const express = require('express');
const {createOrder, getOrderDetails, updateOrderAddress, cancelOrder, updateOrderStatus } = require('../controllers/orderController.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router();

router.post('/create', authMiddleware, createOrder);
router.get('/getOrder', authMiddleware, getOrderDetails);
router.put('/updateAddr', authMiddleware, updateOrderAddress);
router.put('/cancel',authMiddleware, cancelOrder);
router.put('/update', authMiddleware, updateOrderStatus);

module.exports = router;
