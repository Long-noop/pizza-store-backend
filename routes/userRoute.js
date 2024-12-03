const express = require('express');
const { getCustomerIds } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/customer_id', authMiddleware, getCustomerIds);

 module.exports = router;
