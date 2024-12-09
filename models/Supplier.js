const db = require('../config/db.js');

const Supplier = {
    getAllSuppliers: async () => {
        const sql = 'CALL GetSupplier(?)';
        const [rows] = await db.query(sql, [null]);
        return rows[0];
    },

    getSupplierById: async (supplierId) => {
        const sql = 'CALL GetSupplier(?)';
        const [rows] = await db.query(sql, supplierId);
        return rows[0];
    },

    addSupplier: async (supplier) => {
        const sql = 'INSERT INTO SUPPLIER (PhoneNumber, Rating, Supplier_Name, Supplier_Address, Email, Description) VALUE (?,?,?,?,?,?)';
        const [result] = await db.query(sql, [supplier.PhoneNumber, supplier.Rating, supplier.Supplier_Name, supplier.Supplier_Address, supplier.Email, supplier.Description]);
        const supplierId = result.insertId;

        if (supplier.IngredientWithPrice) {
            let priceValues;
            if (Array.isArray(supplier.IngredientWithPrice)) {
                priceValues = supplier.IngredientWithPrice.map(ingredientPrice => [supplierId, ingredientPrice.Ingredient_ID, ingredientPrice.Price]);
            } else {
                priceValues = [[supplierId, supplier.ingredientPrice.Ingredient_ID, supplier.ingredientPrice.Price]];
            }
            const priceSql = 'INSERT INTO DISCOUNT_POLICY (Supplier_ID, Ingredient_ID, Price) VALUES ?';
            await db.query(priceSql, [priceValues]);
        }
        
        return supplierId;
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
        if (supplier.Description) {
            fields.push('Description = ?');
            values.push(supplier.Description);
        }
        if (fields.length > 0) {
            const sql = `UPDATE SUPPLIER SET ${fields.join(', ')} WHERE Supplier_ID = ?`;
            values.push(supplierId);
            await db.query(sql, values);
        }

        if (supplier.IngredientWithPrice) {
            let priceValues;
            if (Array.isArray(supplier.IngredientWithPrice)) {
                priceValues = supplier.IngredientWithPrice.map(ingredientPrice => [supplierId, ingredientPrice.Ingredient_ID, ingredientPrice.Price]);
            } else {
                priceValues = [[supplierId, supplier.ingredientPrice.Ingredient_ID, supplier.ingredientPrice.Price]];
            }
            const deleteSql = 'DELETE FROM DISCOUNT_POLICY WHERE Supplier_ID = ?';
            await db.query(deleteSql, [supplierId]);
            const insertSql = 'INSERT INTO DISCOUNT_POLICY (Supplier_ID, Ingredient_ID, Price) VALUES ?';
            await db.query(insertSql, [priceValues]);
        }
    },

    removeSupplier: async (supplierId) => {
        await db.query('DELETE FROM SUPPLIER WHERE Supplier_ID = ?', [supplierId]);
    },

    getIngredientsBySupplierId: async (supplierId) => {
        const sql = 'CALL GetIngredientsBySupplier(?)';
        const [rows] = await db.query(sql, [supplierId]);
        return rows[0].map(row => ({
            ...row,
            expiration_date: row.expiration_date.toISOString().split('T')[0]
        }));
    }
};

module.exports = Supplier;
