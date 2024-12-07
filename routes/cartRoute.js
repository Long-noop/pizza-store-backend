const express = require('express');
const { addToCart, getCart, removeFromCart, updateItemQuantity, getCartIdByUser } = require('../controllers/cartController.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/get', authMiddleware, getCart);
router.delete('/remove', authMiddleware, removeFromCart);
router.put('/update',authMiddleware, updateItemQuantity);
router.get('/getID',authMiddleware,getCartIdByUser);
module.exports = router;
