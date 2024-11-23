const express = require('express');
const menuController = require('../controllers/menuController');
const upload = require('../middleware/upload'); // Assuming you have a middleware for file uploads

const router = express.Router();

router.post('/add', upload.single('image'), menuController.addMenu);
router.delete('/remove/:Menu_Name', menuController.removeMenu);
router.put('/edit/:Menu_Name', upload.single('image'), menuController.editMenu);
router.get('/list', menuController.listMenus);

module.exports = router;
