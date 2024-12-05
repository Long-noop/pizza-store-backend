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

exports.applyVoucher =  async (req, res) => {
    const { orderId, voucherCode} = req.body;

    try {
        const [order] = await db.query(`
            SELECT OrderTotal FROM \`Order\` WHERE order_id = ?
        `, [orderId]);
        const orderTotal = order[0].OrderTotal
        // Kiểm tra voucher hợp lệ và tính giảm giá
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
            [orderTotal, orderTotal, orderTotal, voucherCode]
        );

        if (!voucher.length) {
            return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn.' });
        }

        const { Voucher_ID, Discount_Amount } = voucher[0];

        // Cập nhật thông tin đơn hàng
        await db.execute(
            `UPDATE \`Order\` SET finalPrice = ? - ?, Voucher_ID = ?, DiscountAmount = ? 
            WHERE order_id = ?`,
            [orderTotal, Discount_Amount, Voucher_ID, Discount_Amount, orderId]
        );


        // Cập nhật số lần sử dụng voucher còn lại
        await db.query(
            `UPDATE Voucher 
             SET Max_Usage = Max_Usage - 1 
             WHERE Voucher_ID = ?`,
            [Voucher_ID]
        );

        res.json({ message: 'Áp dụng voucher thành công!', discount: Discount_Amount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Có lỗi xảy ra.' });
    }
};


exports.revokeVoucher = async (req, res) => {
    const { order_id } = req.query;

    try {
        // Lấy voucher liên kết với đơn hàng
        const [order] = await db.query(`
            SELECT Voucher_ID FROM \`Order\` WHERE order_id = ?
        `, [order_id]);

        if (order.length === 0 || !order[0].Voucher_ID) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy voucher được áp dụng' });
        }

        // Gỡ voucher khỏi đơn hàng
        await db.query(`
            UPDATE \`Order\` 
            SET finalPrice = finalPrice + ?, Voucher_ID = NULL, DiscountAmount = 0 
            WHERE order_id = ?
        `, [order.DiscountAmount,order_id]);

        // Cập nhật voucher
        await db.query(
            `UPDATE Voucher 
             SET Max_Usage = Max_Usage + 1 
             WHERE Voucher_ID = ?`,
             [order[0].Voucher_ID]);

        res.status(200).json({ success: true, message: 'Voucher revoked successfully' });
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

exports.applyLoyaltyPoint = async (req, res) => {
    const { order_id, customer_id, voucherCode, points_to_use } = req.body;
  
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
        // Lấy thông tin khách hàng và đơn hàng
        const [customer] = await db.query(
            `SELECT loyalty_points FROM Customer WHERE customer_id = ?`,
            [customer_id]
        );
    
        const [order] = await db.query(
            `SELECT OrderTotal, DiscountAmount FROM \`Order\` WHERE order_id = ?`,
            [order_id]
        );
    
        if (!customer || !order) {
            return res.status(404).json({ message: 'Customer or Order not found' });
        }
    
        // Kiểm tra số điểm có thể sử dụng
        if (customer.loyalty_points < points_to_use) {
            return res.status(400).json({ message: 'Insufficient loyalty points' });
        }
    
        // Tính số tiền giảm giá
        const discount_amount = points_to_use;
    
        // Cập nhật điểm thưởng và đơn hàng
        await db.query(
            `UPDATE Customer
            SET loyalty_points = loyalty_points - ?
            WHERE customer_id = ?`,
            [points_to_use, customer_id]
        );
    
        await db.query(
            `UPDATE \`Order\`
            SET finalPrice = ? - ? - ?,  DiscountLytP = ?, Bonus_Point = ?, Loyalty_Program_ID = ?
            WHERE order_id = ?`,
            [order[0].OrderTotal, order[0].DiscountAmount, discount_amount, discount_amount, points_to_use, voucher[0].Voucher_ID, order_id]
        );
    
    
        res.status(200).json({
            message: 'Loyalty points applied successfully',
            points_to_use: parseInt(points_to_use, 10),
            remain: customer[0].loyalty_points - points_to_use,
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error applying loyalty points', error: err });
    }
  };
  

exports.revokeLytPoint = async (req, res) => {
    const { order_id } = req.query;

    try {
        // Lấy voucher liên kết với đơn hàng
        const [order] = await db.query(`
            SELECT Loyalty_Program_ID, DiscountLytP FROM \`Order\` WHERE order_id = ?
        `, [order_id]);

        if (order.length === 0 || !order[0].Loyalty_Program_ID) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy voucher được áp dụng' });
        }
        const DiscountLytP = order[0].DiscountLytP
        // Gỡ voucher khỏi đơn hàng
        await db.query(`
            UPDATE \`Order\` 
            SET finalPrice = finalPrice + ?, Loyalty_Program_ID = NULL, DiscountLytP = 0 
            WHERE order_id = ?
        `, [DiscountLytP, order_id]);

        const token = req.headers.token;
        if (!token) {
            throw new Error("Unauthorized: Token not provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customerID = decoded.customer_id;

        if (!customerID) {
            throw new Error("Invalid token: Customer ID not found");
        }
        await db.query(
            `UPDATE Customer 
             SET loyalty_points = loyalty_points + ? 
             WHERE customer_id = ?`,
             [DiscountLytP, customerID]);

        res.status(200).json({ success: true, message: 'Voucher revoked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};