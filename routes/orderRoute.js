const express = require('express');
const {createOrder, updateOrderAddress, cancelOrder, updateOrderStatus, getOrderDetailsByCustomer_id, getOrderDetailsByOrder_id } = require('../controllers/orderController.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router();

router.post('/create', authMiddleware, createOrder);
router.get('/getOrderOf', authMiddleware, getOrderDetailsByCustomer_id);
router.get('/getOrderById', authMiddleware, getOrderDetailsByOrder_id);
router.put('/updateAddr', authMiddleware, updateOrderAddress);
router.put('/cancel',authMiddleware, cancelOrder);
router.put('/update', authMiddleware, updateOrderStatus);

module.exports = router;
