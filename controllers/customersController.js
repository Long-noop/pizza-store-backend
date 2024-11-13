const Customer = require('../models/Customers.js');

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.getAllCustomers();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const customerId = await Customer.addCustomer(req.body);
        res.status(201).json({ customerId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
