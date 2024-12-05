const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');


router.post('/add', supplierController.addSupplier);
router.delete('/remove/:id', supplierController.removeSupplier);
router.get('/list', supplierController.listSuppliers);
router.put('/update/:id', supplierController.updateSupplier);

module.exports = router;
