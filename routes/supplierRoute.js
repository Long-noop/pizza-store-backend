const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/auth.js');

router.post('/add', authMiddleware, supplierController.addSupplier);
router.delete('/remove/:id', authMiddleware, supplierController.removeSupplier);
router.get('/list', authMiddleware, supplierController.listSuppliers);
router.put('/update/:id', authMiddleware, supplierController.updateSupplier);
router.get('/:id/ingredients', authMiddleware, supplierController.getIngredientsBySupplierId);

module.exports = router;
