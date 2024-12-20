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
            delete req.body.userId;
            const ingredientId = await Ingredient.addIngredient(req.body.name);
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
    },

    getIngredientById: async (req, res) => {
        try {
            const ingredient = await Ingredient.getIngredientById(req.params.id);
            if (ingredient) {
                res.json(ingredient);
            } else {
                res.status(404).json({ message: "Ingredient not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    buyIngredient: async (req, res) => {
        try {
            console.log(req.body);
            await Ingredient.buyIngredient(req.body);
            res.status(200).json({
              message: "Ingredient bought successfully"
            });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ingredientController;
