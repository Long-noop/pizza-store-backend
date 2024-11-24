const express = require('express');
const menuController = require('../controllers/menuController');
const upload = require('../middleware/upload'); // Assuming you have a middleware for file uploads
const authMiddleware = require('../middleware/auth.js');

const router = express.Router();

router.post('/add', upload.single('image'), authMiddleware, menuController.addMenu);
router.delete('/remove/:Menu_Name', authMiddleware, menuController.removeMenu);
router.put('/edit/:Menu_Name', authMiddleware, upload.single('image'), menuController.editMenu);
router.get('/list', authMiddleware, menuController.listMenus);

module.exports = router;
