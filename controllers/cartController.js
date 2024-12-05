const db = require('../config/db.js');
const jwt = require('jsonwebtoken');

exports.addToCart = async (req,res) => {
    const { customer_id, product_id, size, quantity } = req.body;

    if (!customer_id || !product_id || !size || !quantity) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        // Kiểm tra giỏ hàng
        let [cart] = await db.query(`SELECT * FROM Cart WHERE customer_id = ?`, [customer_id]);
        if (!cart.length) {
            const [result] = await db.query(`INSERT INTO Cart (customer_id) VALUES (?)`, [customer_id]);
            cart = { cart_id: result.insertId };
        }else {
             cart = cart[0]; 
        }

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
            [cart.cart_id, product_id, size, quantity, price]
        );

        res.status(201).json({message:"Product added to cart"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add product to cart" });
    }
}


exports.getCart = async (req, res) => {
    try {
        // Lấy token từ header 'token'
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: Token not provided" });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customerID = decoded.customer_id;

        if (!customerID) {
            return res.status(400).json({ error: "Invalid token: Customer ID not found" });
        }

        // Truy vấn Cart dựa trên customerID
        const [cart] = await db.query(
            'SELECT * FROM Cart WHERE customer_id = ?',
            [customerID]
        );

        if (cart.length === 0) {
            return res.status(404).json({ error: "Cart not found for this customer" });
        }

        const cartID = cart[0].cart_id;

        // Lấy chi tiết các item trong cart
        const [items] = await db.query(
            `SELECT ci.cart_item_id, ci.product_id, p.Product_Name, ci.size, ci.quantity, ci.price AS price_per_item, 
                    (ci.quantity * ci.price) AS total_price
             FROM Cart_Item ci 
             JOIN PRODUCT p ON ci.product_id = p.Product_ID
             WHERE ci.cart_id = ?`,
            [cartID]
        );

        res.status(200).send(JSON.stringify(items, null, 2));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
};


exports.removeFromCart = async (req, res) => {
    const {cart_item_id } = req.query;

    if (!cart_item_id) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {

        const[cart] = await db.query(
            'SELECT * FROM Cart'
        );
        if(cart.length === 0) {
            return res.status(404).json({ error: "Cart not found" });
        }
        // Xóa sản phẩm khỏi giỏ hàng
        const [result] = await db.query(
            `DELETE FROM Cart_Item WHERE cart_id = ? AND cart_item_id = ?`,
            [cart[0].cart_id, cart_item_id]
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
    const { cart_item_id, quantity} = req.query;

    if (!cart_item_id || !quantity) {
        return res.status(400).json({ error: "New quantity are required" });
    }

    try {
        // Update the address
        await db.query(
            `UPDATE Cart_Item SET quantity = ? WHERE cart_item_id = ?`,
            [quantity, cart_item_id]
        );

        res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update quantity" });
    }
};
