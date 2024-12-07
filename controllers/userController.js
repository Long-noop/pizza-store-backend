const db = require('../config/db.js');

exports.getEmployeeList = async (req, res) => {
    try {
        const [result] = await db.query(`CALL GetEmployeeList()`);
        res.status(200).json(result[0]); // Kết quả trả về từ thủ tục
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employee list' });
    }
};


exports.getCustomerList = async (req, res) => {
    try {
        const [result] = await db.query(`CALL GetCustomerList()`);
        res.status(200).json(result[0]); // Kết quả trả về từ thủ tục
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
