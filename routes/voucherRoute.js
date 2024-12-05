const express = require('express');
const {createVoucher, getActiveVouchers, getVoucherById, updateVoucherStatus, applyVoucher, revokeVoucher, createEvent, applyLoyaltyPoint, revokeLytPoint } = require('../controllers/voucherController.js');
const authMiddleware = require('../middleware/auth');
const { route } = require('./authRoute.js');

const router = express.Router();

router.post('/createVch', authMiddleware, createVoucher);
router.get('/getActiveVch', authMiddleware, getActiveVouchers);
router.get('/getVchById', authMiddleware, getVoucherById);
router.put('/updateVchStatus', authMiddleware, updateVoucherStatus);
router.post('/applyVch', authMiddleware, applyVoucher);
router.post('/removeVch', authMiddleware, revokeVoucher);
router.post('/createEvent', authMiddleware, createEvent);
router.post('/applyLytPoints', authMiddleware, applyLoyaltyPoint)
router.post('/removeLytP', authMiddleware, revokeLytPoint);
module.exports = router;
