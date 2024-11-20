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
    const hashedPassword = await hashPassword(password);

    const conn = await pool.getConnection();
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
    console.error(error);
    res.status(500).json({ message: 'Đăng ký thất bại.' });
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
            console.log(password,account.password)
            return res.status(401).json({ message: 'Sai mật khẩu.' });
        }
    }

    // Kiểm tra vai trò
    let role = 'Customer'; // Mặc định là khách hàng
    const [employees] = await conn.query(
      'SELECT * FROM Employee WHERE account_id = ?',
      [account.account_id]
    );
    if (employees.length > 0) {
        role = employees[0].role; // Vai trò nhân viên
    }
    else{
        const [customers] = await conn.query(
            'SELECT * FROM Customer WHERE account_id = ?',
            [account.account_id]
        );
    }
    conn.release();

    // Tạo token JWT
    const token = jwt.sign(
      { accountId: account.account_id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Đăng nhập thành công.', token, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đăng nhập thất bại.' });
  }
};
