const express = require('express');
const { getCustomerIds, getEmployeeList, getCustomerList, addNewEmployee, deleteEmployee, updateEmployeeInfo } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/employee', authMiddleware, getEmployeeList);
router.get('/customer', authMiddleware, getCustomerList);
router.post('/addEmployee', authMiddleware, addNewEmployee);
router.delete('/removeEmployee/:id', authMiddleware, deleteEmployee);
router.put('/updateEInfo/:id', authMiddleware, updateEmployeeInfo);

module.exports = router;
