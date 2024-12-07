const db = require('../config/db.js');
const jwt = require('jsonwebtoken');

// Giải mã token và trả về customer_id
const getCustomerIDFromToken = (req) => {
    const token = req.headers.token;
    if (!token) {
        throw new Error("Unauthorized: Token not provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerID = decoded.customer_id;

    if (!customerID) {
        throw new Error("Invalid token: Customer ID not found");
    }

    return customerID;
};

// Lấy cart_id dựa trên customer_id (tạo mới nếu chưa có)
const getCartID = async (customerID) => {
    let [cart] = await db.query(`SELECT * FROM Cart WHERE customer_id = ?`, [customerID]);
    if (!cart.length) {
        const [result] = await db.query(`INSERT INTO Cart (customer_id) VALUES (?)`, [customerID]);
        return result.insertId;
    } else {
        return cart[0].cart_id;
    }
};

exports.addToCart = async (req, res) => {
    const { product_id, size, quantity } = req.body;

    if (!product_id || !size || !quantity) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        const customerID = getCustomerIDFromToken(req); // Lấy customerID từ token
        const cartID = await getCartID(customerID); // Lấy cart_id (tạo mới nếu chưa có)

        // Kiểm tra giá theo kích thước
        const [priceResult] = await db.query(
            `SELECT price FROM PRICE_WITH_SIZE WHERE Product_ID = ? AND Size = ?`,
            [product_id, size]
        );
        if (!priceResult.length) {
            return res.status(404).json({ error: "Invalid product size or not found" });
        }

        const price = priceResult[0].price;

        // Thêm sản phẩm vào giỏ hàng
        await db.query(
            `INSERT INTO Cart_Item (cart_id, product_id, size, quantity, price)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [cartID, product_id, size, quantity, price]
        );

        // Tính tổng tiền giỏ hàng
        const [cartTotalResult] = await db.query(
            `SELECT SUM(quantity * price) AS total
             FROM Cart_Item
             WHERE cart_id = ?`,
            [cartID]
        );
        const subTotal = cartTotalResult[0]?.total || 0;

        await db.query(
            `UPDATE Cart
             SET subTotal = ?
             WHERE cart_id = ?`,
            [subTotal,cartID]
        );

        res.status(201).json({ message: "Product added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add product to cart" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const customerID = getCustomerIDFromToken(req); // Lấy customerID từ token
        const cartID = await getCartID(customerID); // Lấy cart_id

        // Lấy chi tiết các item trong cart
        const [items] = await db.query(
            `SELECT ci.cart_item_id, ci.product_id, p.Product_Name, ci.size, ci.quantity, ci.price AS price_per_item, 
                    (ci.quantity * ci.price) AS total_price
             FROM Cart_Item ci 
             JOIN PRODUCT p ON ci.product_id = p.Product_ID
             WHERE ci.cart_id = ?`,
            [cartID]
        );

        // Tính tổng giá trị giỏ hàng (subTotal)
        const [cartSummary] = await db.query(
            `SELECT SUM(ci.quantity * ci.price) AS subTotal
             FROM Cart_Item ci
             WHERE ci.cart_id = ?`,
            [cartID]
        );

        const subTotal = cartSummary[0]?.subTotal || 0;

        // Lấy thông tin voucher hoặc chương trình giảm giá
        const [cartInfo] = await db.query(
            `SELECT c.Voucher_ID, v.Voucher_Code, v.Discount_Type, v.Discount_Value, c.DiscountLytP
             FROM Cart c
             LEFT JOIN Voucher v ON c.Voucher_ID = v.Voucher_ID
             WHERE c.cart_id = ?`,
            [cartID]
        );
        
        const cartDetails = {
            subTotal, // Tổng giá trị giỏ hàng
            voucher: cartInfo[0] || null, // Thông tin voucher nếu có
            loyaltyDiscount: cartInfo[0].DiscountLytP,
            items, // Chi tiết từng sản phẩm
            
        };

        res.status(200).json(cartDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch cart details" });
    }
};

exports.removeFromCart = async (req, res) => {
    const { cart_item_id } = req.query;

    if (!cart_item_id) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        const customerID = getCustomerIDFromToken(req); // Lấy customerID từ token
        const cartID = await getCartID(customerID); // Lấy cart_id

        // Xóa sản phẩm khỏi giỏ hàng
        const [result] = await db.query(
            `DELETE FROM Cart_Item WHERE cart_id = ? AND cart_item_id = ?`,
            [cartID, cart_item_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found in the cart" });
        }

        res.status(200).json({ message: "Product removed from cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove product from cart" });
    }
};

exports.updateItemQuantity = async (req, res) => {
    const { cart_item_id, quantity } = req.query;

    if (!cart_item_id || !quantity) {
        return res.status(400).json({ error: "Cart item ID and new quantity are required" });
    }

    try {
        const customerID = getCustomerIDFromToken(req); // Lấy customerID từ token
        const cartID = await getCartID(customerID); // Lấy cart_id để xác nhận khách hàng sở hữu giỏ hàng

        // Kiểm tra xem cart_item_id có thuộc cart_id của người dùng hay không
        const [cartItem] = await db.query(
            `SELECT * FROM Cart_Item WHERE cart_id = ? AND cart_item_id = ?`,
            [cartID, cart_item_id]
        );

        if (!cartItem.length) {
            return res.status(404).json({ error: "Cart item not found or does not belong to this cart" });
        }

        // Cập nhật số lượng sản phẩm
        const [result] = await db.query(
            `UPDATE Cart_Item SET quantity = ? WHERE cart_item_id = ? AND cart_id = ?`,
            [quantity, cart_item_id, cartID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Failed to update quantity" });
        }

        res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update quantity" });
    }
};
