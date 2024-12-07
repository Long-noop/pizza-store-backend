const db = require('../config/db.js');

const Supplier = {
    getAllSuppliers: async () => {
        const [rows] = await db.query('SELECT * FROM SUPPLIER');
        return rows;
    },

    getSupplierById: async (supplierId) => {
        const [rows] = await db.query('SELECT * FROM SUPPLIER WHERE Supplier_ID = ?', [supplierId]);
        return rows[0];
    },

    addSupplier: async (supplier) => {
        const [result] = await db.query('INSERT INTO SUPPLIER SET ?', supplier);
        return result.insertId;
    },

    updateSupplier: async (supplierId, supplier) => {
        const fields = [];
        const values = [];

        if (supplier.PhoneNumber) {
            fields.push('PhoneNumber = ?');
            values.push(supplier.PhoneNumber);
        }
        if (supplier.Rating) {
            fields.push('Rating = ?');
            values.push(supplier.Rating);
        }
        if (supplier.Supplier_Name) {
            fields.push('Supplier_Name = ?');
            values.push(supplier.Supplier_Name);
        }
        if (supplier.Supplier_Address) {
            fields.push('Supplier_Address = ?');
            values.push(supplier.Supplier_Address);
        }
        if (supplier.Email) {
            fields.push('Email = ?');
            values.push(supplier.Email);
        }
        if (fields.length > 0) {
            const sql = `UPDATE SUPPLIER SET ${fields.join(', ')} WHERE Supplier_ID = ?`;
            values.push(supplierId);
            await db.query(sql, values);
        }
    },

    removeSupplier: async (supplierId) => {
        await db.query('DELETE FROM SUPPLIER WHERE Supplier_ID = ?', [supplierId]);
    },

    getIngredientsBySupplierId: async (supplierId) => {
        const [rows] = await db.query('SELECT * FROM PROVIDE WHERE Supplier_ID = ?', [supplierId]);
        return rows;
    }
};

module.exports = Supplier;
