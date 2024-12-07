const db = require('../config/db.js');

// exports.getCustomerIds = async (req, res) => {
//     try {
//         // Truy vấn danh sách customer_id
//         const [customers] = await db.query(`SELECT customer_id FROM Customer`);
        
//         // Kiểm tra dữ liệu trả về
//         if (!customers.length) {
//             return res.status(404).json({ error: "No customers found" });
//         }

//         // Trả về danh sách customer_id
//         res.status(200).json({customers});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to fetch customer IDs" });
//     }
// };

exports.getEmployeeList = async (req, res) => {
    const { search, sortBy = 'employee_id', order = 'asc', page = 1, limit = 10 } = req.body;
    
    const offset = (page - 1) * limit;

    try {
        const [rows] = await db.query(
            'CALL GetEmployeeList(?, ?, ?, ?, ?)',
            [search, sortBy, order, page, limit]
        );
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};


exports.getCustomerList = async (req, res) => {
    const { search , page = 1, limit = 10 } = req.body;  // Lấy các tham số từ query params, mặc định là giá trị rỗng cho tìm kiếm và 10 kết quả mỗi trang

    try {
        // Gọi thủ tục GetCustomerList với các tham số từ request
        const [result] = await db.query(`CALL GetCustomerList(?, ?, ?)`, [search, page, limit]);

        // Trả kết quả về cho client
        res.status(200).json(result[0]);  // Kết quả trả về từ thủ tục (mảng chứa kết quả)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch customer list' });
    }
};

exports.addNewEmployee = async (req, res) => {
    const { username, password, email, store_id, birth_date, gender, phone, role } = req.body;

    try {
        // 1. Tạo tài khoản mới
        const [accountResult] = await db.query(
            `INSERT INTO Account (username, password, email)
             VALUES (?, ?, ?)`,
            [username, password, email]
        );

        const account_id = accountResult.insertId; // Lấy account_id vừa tạo

        // 2. Tạo thông tin nhân viên
        await db.query(
            `INSERT INTO Employee (account_id, store_id, birth_date, gender, phone, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [account_id, store_id, birth_date, gender, phone, role]
        );

        res.status(201).json({ message: 'Employee and account created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add employee' });
    }
};

exports.deleteEmployee =  async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM Employee WHERE employee_id = ?`, [id]);
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
};

exports.updateEmployeeInfo = async (req, res) => {
    const { id } = req.params;
    const { store_id, birth_date, gender, phone, role } = req.body;

    try {
        await db.query(
            `UPDATE Employee
             SET store_id = ?, birth_date = ?, gender = ?, phone = ?, role = ?
             WHERE employee_id = ?`,
            [store_id, birth_date, gender, phone, role, id]
        );
        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
};
