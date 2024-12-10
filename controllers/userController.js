const db = require('../config/db.js');
const jwt =require('jsonwebtoken')
exports.getEmployeeList = async (req, res) => {
    try {
        const [result] = await db.query(`CALL GetEmployeeList()`);
        res.status(200).json(result[0]); // Kết quả trả về từ thủ tục
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employee list' });
    }
};

exports.getEmployeeById = async (req, res) => {
    const { id } = req.params; 
    try {
        const [result] = await db.query(`CALL GetEmployeeList()`);
        const employee = result[0].find(emp => emp.employee_id === id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employee information' });
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

exports.getLoyaltyPoint = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            throw new Error("Unauthorized: Token not provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customerID = decoded.customer_id;

        if (!customerID) {
            throw new Error("Invalid token: Customer ID not found");
        }
        const [result] = await db.query(`SELECT loyalty_points FROM Customer WHERE customer_id = ?`,[customerID]);
        res.status(200).json(result[0]); // Kết quả trả về từ thủ tục
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch customerID' });
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
        console.log(error);
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

// API tìm kiếm và sắp xếp nhân viên
exports.searchAndSortE = async (req, res) => {
    const { search, sortBy, sortOrder = 'ASC' } = req.query;
  
    // Xây dựng câu truy vấn SQL
    let query = 'SELECT * FROM Employee';
  
    // Tìm kiếm theo các trường
    if (search) {
      query += ` WHERE employee_id LIKE '%${search}%' OR role LIKE '%${search}%' OR gender LIKE '%${search}%' OR phone LIKE '%${search}%'`;
    }
  
    // Sắp xếp theo trường và thứ tự
    if (sortBy) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }
  
    try {
      // Thực thi câu truy vấn SQL và lấy kết quả
      const [results] = await db.query(query);
      res.json(results);
    } catch (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Error fetching employees' });
    }
  };