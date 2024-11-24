const express = require('express');
const foodController = require('../controllers/foodController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth.js')
const router = express.Router();

router.post('/add', upload.single('image'), authMiddleware, foodController.addFood);
router.get('/list', authMiddleware, foodController.listFood);
router.delete('/remove/:id', authMiddleware, foodController.removeFood);

module.exports = router;
