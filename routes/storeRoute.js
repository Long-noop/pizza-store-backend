const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeControoler.js')
// Lấy tất cả cửa hàng
router.get('/getStores', storeController.getAllStores);

// Lấy cửa hàng theo ID
router.get('/getStores/:id', storeController.getStoreById);

// Thêm cửa hàng
router.post('/stores', storeController.createStore);

// Cập nhật cửa hàng theo ID
router.put('/stores/:id', storeController.updateStore);

// Xóa cửa hàng theo ID
router.delete('/stores/:id', storeController.deleteStore);

module.exports = router;
