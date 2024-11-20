const express = require('express');
const { registerCustomer, login } = require('../controllers/authController.js');

const router = express.Router();

router.post('/register', registerCustomer); // Đăng ký cho Customer
router.post('/login', login);               // Đăng nhập cho mọi tài khoản

module.exports = router;
