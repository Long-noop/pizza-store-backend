const db = require('../config/db.js')
const jwt = require('jsonwebtoken');

exports.createVoucher = async (req, res) => {
    const { code, discount_type, discount_value, event_id, start_date, end_date, max_usage, stauts } = req.body;

    try {
        const sql = `INSERT INTO Voucher (Voucher_code, Discount_Type, Discount_Value, Event_ID, Start_Date, End_Date, Max_Usage, Status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [code, discount_type, discount_value, event_id, start_date, end_date, max_usage, 'active']);
        res.status(201).json({
            success: true,
            message: 'Voucher created successfully',
            voucher_id: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getActiveVouchers = async (req, res) => {
    try {
        const sql = `
            SELECT * FROM Voucher 
            WHERE Status = 'Active' 
            AND Start_Date <= NOW()
            AND End_Date >= NOW()

        `;
        const [rows] = await db.query(sql);
        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllVouchers = async (req, res) => {
    try {
        const sql = `SELECT * FROM Voucher `;
        const [rows] = await db.query(sql);
        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM Voucher WHERE Voucher_ID = ?`, [id]);
        res.status(200).json({ message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete voucher' });
    }
};



exports.getVoucherById = async (req, res) => {
    const { voucher_id } = req.query;

    try {
        const sql = `SELECT * FROM Voucher WHERE Voucher_ID = ?`;
        const [rows] = await db.query(sql, [voucher_id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        res.status(200).json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateVoucherStatus = async (req, res) => {
    const {voucher_id , status } = req.query;

    try {
        const validStatuses = ['Active', 'Expired', 'Disabled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        await db.query(`UPDATE Voucher SET Status = ? WHERE voucher_id = ?`, [status, voucher_id]);
        res.status(200).json({ success: true, message: 'Voucher status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    const { event_name, date_start, date_end, description, status = 'Active', event_type = 'Promotion' } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!event_name || !date_start || !date_end) {
        return res.status(400).json({ success: false, message: "Tên sự kiện, ngày bắt đầu và ngày kết thúc là bắt buộc." });
    }

    try {
        // Thêm sự kiện vào bảng SPECIAL_EVENT
        const [result] = await db.query(
            `INSERT INTO SPECIAL_EVENT (Event_Name, Date_Start, Date_End, Description, Status, Event_Type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [event_name, date_start, date_end, description || null, status, event_type]
        );

        res.status(201).json({
            success: true,
            message: "Sự kiện được tạo thành công.",
            event_id: result.insertId,
        });
    } catch (error) {
        console.error("Lỗi khi tạo sự kiện:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tạo sự kiện, vui lòng thử lại sau.",
        });
    }
};

exports.applyVoucherToCart = async (req, res) => {
    const { cartId, voucherCode } = req.body;

    try {
        const [cart] = await db.query(
            `SELECT subTotal FROM Cart WHERE cart_id = ?`,
            [cartId]
        );

        if (!cart.length) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const subTotal = cart[0].subTotal;

        const [voucher] = await db.execute(
            `SELECT Voucher_ID, Discount_Type, Discount_Value, 
                CASE 
                    WHEN Discount_Type = 'Percent' THEN LEAST((? * Discount_Value) / 100, ?)
                    WHEN Discount_Type = 'Fixed' THEN LEAST(Discount_Value, ?)
                    ELSE 0
                END AS Discount_Amount
            FROM Voucher
            WHERE Voucher_Code = ?
              AND Status = 'Active' 
              AND Max_Usage > 0
              AND Start_Date <= CURRENT_DATE 
              AND End_Date >= CURRENT_DATE`,
            [subTotal, subTotal, subTotal, voucherCode]
        );

        if (!voucher.length) {
            return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn.' });
        }

        const { Voucher_ID, Discount_Amount } = voucher[0];

        await db.execute(
            `UPDATE Cart SET 
                finalPrice = subTotal - ?, 
                Voucher_ID = ?, 
                DiscountAmount = ? 
            WHERE cart_id = ?`,
            [Discount_Amount, Voucher_ID, Discount_Amount, cartId]
        );

        await db.query(
            `UPDATE Voucher 
             SET Max_Usage = Max_Usage - 1 
             WHERE Voucher_ID = ?`,
            [Voucher_ID]
        );

        res.json({ message: 'Voucher applied successfully!', discount: Discount_Amount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error applying voucher to cart.' });
    }
};

exports.revokeVoucherFromCart = async (req, res) => {
    const { cartId } = req.query;

    try {
        const [cart] = await db.query(
            `SELECT Voucher_ID, DiscountAmount FROM Cart WHERE cart_id = ?`,
            [cartId]
        );

        if (!cart.length || !cart[0].Voucher_ID) {
            return res.status(400).json({ error: 'No voucher applied to this cart.' });
        }

        const { Voucher_ID, DiscountAmount } = cart[0];

        await db.query(
            `UPDATE Cart SET 
                finalPrice = finalPrice + ?, 
                Voucher_ID = NULL, 
                DiscountAmount = 0 
            WHERE cart_id = ?`,
            [DiscountAmount, cartId]
        );

        await db.query(
            `UPDATE Voucher 
             SET Max_Usage = Max_Usage + 1 
             WHERE Voucher_ID = ?`,
            [Voucher_ID]
        );

        res.json({ message: 'Voucher revoked successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error revoking voucher from cart.' });
    }
};

exports.applyLoyaltyPointsToCart = async (req, res) => {
    const { cartId, customerId, voucherCode, pointsToUse } = req.body;

    try {
        // Kiểm tra voucher hợp lệ và tính giảm giá
        const [voucher] = await db.execute(
            `SELECT Voucher_ID, Discount_Type, Discount_Value
            FROM Voucher
            WHERE Voucher_Code = ?
              AND Status = 'Active' 
              AND Max_Usage > 0
              AND Start_Date <= CURRENT_DATE 
              AND End_Date >= CURRENT_DATE`,
            [voucherCode]
        );

        if (!voucher.length) {
            return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn.' });
        }
        const [customer] = await db.query(
            `SELECT loyalty_points FROM Customer WHERE customer_id = ?`,
            [customerId]
        );

        if (customer[0].loyalty_points < pointsToUse) {
            return res.status(400).json({ error: 'Điểm tích lũy không đủ.' });
        }

        const [cart] = await db.query(
            `SELECT DiscountAmount FROM Cart WHERE cart_id = ?`,
            [cartId]
        );

        if (!customer.length || !cart.length) {
            return res.status(404).json({ error: 'Customer or cart not found.' });
        }

        const { loyalty_points } = customer[0];
        const {DiscountAmount } = cart[0];

        if (loyalty_points < pointsToUse) {
            return res.status(400).json({ error: 'Insufficient loyalty points.' });
        }

        const discountFromPoints = pointsToUse;

        await db.query(
            `UPDATE Customer 
             SET loyalty_points = loyalty_points - ? 
             WHERE customer_id = ?`,
            [pointsToUse, customerId]
        );

        await db.query(
            `UPDATE Cart 
             SET finalPrice = subTotal - ? - ?, 
                 DiscountLytP = ?, 
                 Loyalty_Program_ID = ? 
             WHERE cart_id = ?`,
            [DiscountAmount, discountFromPoints, discountFromPoints, voucher[0].Voucher_ID, cartId]
        );

        res.json({
            message: 'Loyalty points applied successfully!',
            remainingPoints: loyalty_points - pointsToUse,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error applying loyalty points to cart.' });
    }
};

exports.revokeLoyaltyPointsFromCart = async (req, res) => {
    const { cartId } = req.query;

    try {
        const [cart] = await db.query(
            `SELECT Loyalty_Program_ID, DiscountLytP FROM Cart WHERE cart_id = ?`,
            [cartId]
        );

        if (!cart.length || !cart[0].Loyalty_Program_ID) {
            return res.status(400).json({ error: 'No loyalty points applied to this cart.' });
        }

        const { Loyalty_Program_ID, DiscountLytP } = cart[0];

        await db.query(
            `UPDATE Cart 
             SET finalPrice = finalPrice + ?, 
                 DiscountLytP = 0, 
                 Loyalty_Program_ID = NULL 
             WHERE cart_id = ?`,
            [DiscountLytP, cartId]
        );

        await db.query(
            `UPDATE Customer 
             SET loyalty_points = loyalty_points + ? 
             WHERE customer_id = ?`,
            [DiscountLytP, Loyalty_Program_ID]
        );

        res.json({ message: 'Loyalty points revoked successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error revoking loyalty points from cart.' });
    }
};
