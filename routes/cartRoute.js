const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/get', authMiddleware, getCart);
router.delete('/remove', authMiddleware, removeFromCart);

module.exports = router;
