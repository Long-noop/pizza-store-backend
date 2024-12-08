const db = require('../config/db.js');

const Ingredient = {
    getAllIngredients: async () => {
        const [rows] = await db.query('SELECT * FROM Ingredient');
        return rows;
    },

    getIngredientById: async (ingredientId) => {
        const [rows] = await db.query('SELECT * FROM Ingredient WHERE ingredient_id = ?', [ingredientId]);
        return rows[0];
    },

    addIngredient: async (ingredient) => {
        const sql = 'CALL addIngredientWithProvide(?, ?, ?, ?, ?, @insertID)';
        const params = [ingredient.name, ingredient.quantity, ingredient.expiration_date, ingredient.Supplier_ID, ingredient.Product_ID];
        await db.query(sql, params);
        const [row] = await db.query('SELECT @insertID AS ingredient_id');
        return row[0]?.ingredient_id;
    },

    updateIngredient: async (ingredientId, ingredient) => {
        const fields = [];
        const values = [];

        if (ingredient.name) {
            fields.push('name = ?');
            values.push(ingredient.name);
        }
        if (ingredient.quantity) {
            fields.push('quantity = ?');
            values.push(ingredient.quantity);
        }
        if (ingredient.expiration_date) {
            fields.push('expiration_date = ?');
            values.push(ingredient.expiration_date);
        }
        if (fields.length > 0) {
            const sql = `UPDATE Ingredient SET ${fields.join(', ')} WHERE ingredient_id = ?`;
            values.push(ingredientId);
            await db.query(sql, values);
        }
        fields.length = 0;
        values.length = 0;
        if (ingredient.Supplier_ID) {
            fields.push('Supplier_ID = ?');
            values.push(ingredient.Supplier_ID);
        }
        if (ingredient.Product_ID) {
            fields.push('Product_ID = ?');
            values.push(ingredient.Product_ID);
        }
        if (fields.length > 0) {
            const sql = `UPDATE PROVIDE SET ${fields.join(', ')} WHERE Ingredient_ID = ?`;
            values.push(ingredientId);
            await db.query(sql, values);
        }
    },

    removeIngredient: async (ingredientId) => {
        await db.query('DELETE FROM Ingredient WHERE ingredient_id = ?', [ingredientId]);
    }
};

module.exports = Ingredient;
