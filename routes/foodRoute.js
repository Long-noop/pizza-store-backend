const express = require('express');
const foodController = require('../controllers/foodController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/add', upload.single('image'), foodController.addFood);
router.get('/list', foodController.listFood);
router.delete('/remove/:id', foodController.removeFood);

module.exports = router;
