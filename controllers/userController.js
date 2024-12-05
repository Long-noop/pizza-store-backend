const db = require('../config/db.js');

exports.getCustomerIds = async (req, res) => {
    try {
        // Truy vấn danh sách customer_id
        const [customers] = await db.query(`SELECT customer_id FROM Customer`);
        
        // Kiểm tra dữ liệu trả về
        if (!customers.length) {
            return res.status(404).json({ error: "No customers found" });
        }

        // Trả về danh sách customer_id
        res.status(200).json({customers});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch customer IDs" });
    }
};
