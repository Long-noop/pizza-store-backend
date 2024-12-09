const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');

// Mã hóa mật khẩu
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Kiểm tra mật khẩu
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);

// Đăng ký tài khoản cho Customer
exports.registerCustomer = async (req, res) => {
  const { username, password, email} = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    const conn = await pool.getConnection();
    // Kiểm tra trùng username
    const [existingUsername] = await conn.query(
      'SELECT COUNT(*) AS count FROM Account WHERE username = ?',
      [username]
    );

    if (existingUsername[0].count > 0) {
      conn.release();
      return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
    }

    // Kiểm tra trùng email
    const [existingEmail] = await conn.query(
      'SELECT COUNT(*) AS count FROM Account WHERE email = ?',
      [email]
    );

    if (existingEmail[0].count > 0) {
      conn.release();
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }

    const hashedPassword = await hashPassword(password);

    await conn.beginTransaction();

    // Thêm vào bảng Account
    const [accountResult] = await conn.query(
      'INSERT INTO Account (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    const accountId = accountResult.insertId;

    // Thêm vào bảng Customer
    await conn.query(
      'INSERT INTO Customer (account_id) VALUES (?)',
      [accountId]
    );

    await conn.commit();
    conn.release();
    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    console.log(error?.sqlMessage);
    res.status(500).json({ message: error?.sqlMessage || " Register fail" });
  }
};

// Đăng nhập cho Customer hoặc Employee
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp username và password.' });
  }

  try {
    const conn = await pool.getConnection();

    // Tìm tài khoản trong bảng Account
    const [accounts] = await conn.query(
      'SELECT * FROM Account WHERE username = ?',
      [username]
    );

    if (accounts.length === 0) {
      conn.release();
      return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    const account = accounts[0];

    // Kiểm tra mật khẩu
    const validPassword = await comparePassword(password, account.password);
    if (!validPassword) {
      if(password!==account.password){
        conn.release();
        return res.status(401).json({ message: 'Sai mật khẩu.' });
    }
    }

    // Kiểm tra vai trò và lấy thông tin id tương ứng
    let role = 'Customer'; // Mặc định là khách hàng
    let idField = null; // Tên của trường id (customer_id hoặc employee_id)
    let idValue = null; // Giá trị của id

    const [employees] = await conn.query(
      'SELECT employee_id, role FROM Employee WHERE account_id = ?',
      [account.account_id]
    );

    if (employees.length > 0) {
      role = employees[0].role; // Vai trò nhân viên
      idField = 'employee_id';
      idValue = employees[0].employee_id;
    } else {
      const [customers] = await conn.query(
        'SELECT customer_id FROM Customer WHERE account_id = ?',
        [account.account_id]
      );
      if (customers.length > 0) {
        idField = 'customer_id';
        idValue = customers[0].customer_id;
      }
    }

    conn.release();

    if (!idValue) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin tài khoản liên kết.' });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { accountId: account.account_id, role, [idField]: idValue },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    // Phản hồi dữ liệu
    res.json({
      message: 'Đăng nhập thành công.',
      token,
      role,
      [idField]: idValue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đăng nhập thất bại.' });
  }
};
