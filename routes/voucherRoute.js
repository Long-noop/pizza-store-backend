const express = require('express');
const {createVoucher, getActiveVouchers, getVoucherById, updateVoucherStatus, createEvent, applyVoucherToCart, revokeVoucherFromCart, applyLoyaltyPointsToCart, revokeLoyaltyPointsFromCart } = require('../controllers/voucherController.js');
const authMiddleware = require('../middleware/auth');
const { route } = require('./authRoute.js');

const router = express.Router();

router.post('/createVch', authMiddleware, createVoucher);
router.get('/getActiveVch', authMiddleware, getActiveVouchers);
router.get('/getVchById', authMiddleware, getVoucherById);
router.put('/updateVchStatus', authMiddleware, updateVoucherStatus);
router.post('/applyVch', authMiddleware, applyVoucherToCart);
router.post('/removeVch', authMiddleware, revokeVoucherFromCart);
router.post('/createEvent', authMiddleware, createEvent);
router.post('/applyLytPoints', authMiddleware, applyLoyaltyPointsToCart)
router.post('/removeLytP', authMiddleware, revokeLoyaltyPointsFromCart);
module.exports = router;
