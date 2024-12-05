const db = require('../config/db.js');

const Ingredient = {
    getAllIngredients: async () => {
      try {
        const [rows] = await db.query('SELECT * FROM Ingredient');
        return rows;
      } catch (error) { 
        throw new Error("Error in getting all ingredients", error);
      }
    },

    getIngredientById: async (ingredientId) => {
      try {
        const [rows] = await db.query('SELECT * FROM Ingredient WHERE ingredient_id = ?', [ingredientId]);
        return rows[0];
      } catch (error) {
        throw new Error("Error in getting ingredient by id", error);
      }
    },

    addIngredient: async (ingredient) => {
      try {
        const [result] = await db.query('INSERT INTO Ingredient SET ?', ingredient);
        return result.insertId;
      } catch (error) {
        throw new Error("Error in adding ingredient", error);
      }
    },

    updateIngredient: async (ingredientId, ingredient) => {
      try {
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
      } catch (error) { 
        throw new Error("Error in updating ingredient", error);
      }
    },

    removeIngredient: async (ingredientId) => {
      try {
        await db.query('DELETE FROM Ingredient WHERE ingredient_id = ?', [ingredientId]);
      } catch (error) {
        throw new Error("Error in removing ingredient", error);
      }
    }
};

module.exports = Ingredient;
