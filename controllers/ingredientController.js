const Ingredient = require('../models/Ingredients');

const ingredientController = {
    listIngredients: async (req, res) => {
        try {
            const ingredients = await Ingredient.getAllIngredients();
            res.json(ingredients);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addIngredient: async (req, res) => {
        try {
            const ingredientId = await Ingredient.addIngredient(req.body);
            res.status(201).json({ id: ingredientId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateIngredient: async (req, res) => {
        try {
            await Ingredient.updateIngredient(req.params.id, req.body);
            res.status(200).json({
              message: "Ingredient updated successfully"
            });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },

    removeIngredient: async (req, res) => {
        try {
            await Ingredient.removeIngredient(req.params.id);
            res.status(200).json({
              message: "Ingredient removed successfully"
            });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ingredientController;
