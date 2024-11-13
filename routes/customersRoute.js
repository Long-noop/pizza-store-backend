const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customersController.js');

router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.addCustomer);

module.exports = router;
