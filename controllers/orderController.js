const db = require('../config/db.js');

exports.createOrder = async (req, res) => {
    const { customer_id, address } = req.body;

    if (!customer_id) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        // Lấy giỏ hàng
        const [cart] = await db.query(`SELECT cart_id FROM Cart WHERE customer_id = ?`, [customer_id]);
        if (!cart.length) {
            return res.status(404).json({ error: "Cart is empty" });
        }

        const cart_id = cart[0].cart_id;

        // Tạo đơn hàng
        const [orderResult] = await db.query(
            `INSERT INTO \`Order\` (Cus_Place_Order, status, address)
             VALUES (?, 'Pending', ?)`,
            [customer_id, address]
        );

        const order_id = orderResult.insertId;

        // Chuyển Cart_Item sang Order_Item
        await db.query(
            `INSERT INTO Order_Item (order_id, product_id, size, quantity, price)
             SELECT ?, product_id, size, quantity, price
             FROM Cart_Item
             WHERE cart_id = ?`,
            [order_id, cart_id]
        );

        // Xóa giỏ hàng
        await db.query(`DELETE FROM Cart WHERE cart_id = ?`, [cart_id]);

        res.status(201).json({ message: "Order created successfully", order_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to checkout" });
    }
};

exports.getOrderDetailsByCustomer_id = async (req, res) => {
    const { customer_id } = req.query;

    if (!customer_id) {
        return res.status(400).json({ error: "Customer ID is required" });
    }

    try {
        // Retrieve all orders for the customer
        const [orders] = await db.query(
            `SELECT order_id, status, address, order_date
             FROM \`Order\` 
             WHERE Cus_Place_Order = ?`,
            [customer_id]
        );

        if (!orders.length) {
            return res.status(404).json({ error: "No orders found for this customer" });
        }

        // Fetch details of items for each order
        const orderDetailsPromises = orders.map(async (order) => {
            const [items] = await db.query(
                `SELECT oi.product_id, p.Product_Name, oi.size, oi.quantity, oi.price AS price_per_item,
                        (oi.quantity * oi.price) AS total_price
                 FROM Order_Item oi
                 JOIN PRODUCT p ON oi.product_id = p.Product_ID
                 WHERE oi.order_id = ?`,
                [order.order_id]
            );
            return { ...order, items };
        });

        const detailedOrders = await Promise.all(orderDetailsPromises);

        res.status(200).json(detailedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders for the customer" });
    }
};

exports.getOrderDetailsByOrder_id = async (req, res) => {
    const { orderId } = req.query;

    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }

    try {
        // Lấy thông tin đơn hàng
        const [orderDetails] = await db.query(
            `SELECT order_id, Cus_Place_Order, status, address, order_date
             FROM \`Order\`
             WHERE order_id = ?`,
            [orderId]
        );

        if (!orderDetails.length) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Lấy danh sách sản phẩm trong đơn hàng
        const [orderItems] = await db.query(
            `SELECT oi.product_id, p.Product_Name, oi.size, oi.quantity, oi.price AS price_per_item,
                    (oi.quantity * oi.price) AS total_price
             FROM Order_Item oi
             JOIN PRODUCT p ON oi.product_id = p.Product_ID
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.status(200).json({ orderDetails: orderDetails[0], orderItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch order details" });
    }
};


exports.updateOrderAddress = async (req, res) => {
    const { order_id, address} = req.body;

    if (!order_id || !address) {
        return res.status(400).json({ error: "Order ID and new address are required" });
    }

    try {
        // Update the address
        await db.query(
            `UPDATE \`Order\` SET address = ? WHERE order_id = ?`,
            [address, order_id]
        );

        res.status(200).json({ message: "Order address updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order address" });
    }
};


exports.cancelOrder = async (req, res) => {
    const { orderId } = req.query;

    if (!orderId) {
        return res.status(400).json({ error: "Order ID and Customer ID are required" });
    }

    const CANCEL_LIMIT_MINUTES = 10; // Giới hạn thời gian hủy là 10 phút

    try {
        // Lấy thông tin đơn hàng
        const [order] = await db.query(
            `SELECT Order_ID, order_date, status 
             FROM \`Order\` 
             WHERE Order_ID = ? AND status != 'Cancelled'`,
            [orderId]
        );

        if (!order.length) {
            return res.status(404).json({ error: "Order not found or already cancelled" });
        }

        const orderTime = new Date(order.order_date);
        const currentTime = new Date();
        const timeDifference = Math.floor((currentTime - orderTime) / (1000 * 60)); // Tính thời gian chênh lệch (phút)

        if (timeDifference > CANCEL_LIMIT_MINUTES) {
            return res.status(400).json({ error: "Cannot cancel order after 10 minutes" });
        }

        // Cập nhật trạng thái đơn hàng
        await db.query(
            `UPDATE \`Order\` SET status = 'Cancelled' WHERE Order_ID = ?`,
            [orderId]
        );

        // Ghi lại thông tin hủy
        await db.query(
            `INSERT INTO CANCEL_ORDER (Order_ID) VALUES (?)`,
            [orderId]
        );

        res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
};


exports.updateOrderStatus = async (req, res) => {
    const { orderId, newStatus } = req.query;

    if (!orderId || !newStatus) {
        return res.status(400).json({ error: "Order ID and new status are required" });
    }

    try {
        // Gọi stored procedure
        await db.query(`CALL UpdateOrderStatusProcedure(?, ?, @result_message);`, [orderId, newStatus]);

        const [rows] = await db.query(`SELECT @result_message AS result_message;`);
        const message = rows[0]?.result_message;

        if (message === 'Order not found') {
            return res.status(404).json({ error: message });
        } else if (message === 'Cannot update status of a cancelled order') {
            return res.status(400).json({ error: message });
        } else if (message === 'Cannot update to previous status') {
            return res.status(400).json({ error: message });
        }

        res.status(200).json({ message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};


