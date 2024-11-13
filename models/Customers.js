const db = require('../config/db.js');

const Customer = {
    getAllCustomers: async () => {
        const [rows] = await db.query('SELECT * FROM Customer');
        return rows;
    },

    getCustomerById: async (customerId) => {
        const [rows] = await db.query('SELECT * FROM Customer WHERE customer_id = ?', [customerId]);
        return rows[0];
    },

    addCustomer: async (customer) => {
        const [result] = await db.query('INSERT INTO Customer SET ?', customer);
        return result.insertId;
    },

    updateCustomer: async (customerId, customer) => {
        await db.query('UPDATE Customer SET ? WHERE customer_id = ?', [customer, customerId]);
    }
};

module.exports = Customer;
