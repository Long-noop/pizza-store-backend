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
        const [result] = await db.query('INSERT INTO Ingredient SET ?', ingredient);
        return result.insertId;
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
    },

    removeIngredient: async (ingredientId) => {
        await db.query('DELETE FROM Ingredient WHERE ingredient_id = ?', [ingredientId]);
    }
};

module.exports = Ingredient;
