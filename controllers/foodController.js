const Food = require('../models/Food');
const fs = require('fs');
const path = require('path');

const foodController = {
    addFood: async (req, res) => {
        try {
            const foodData = req.body;
            if (req.file) {
                const imagePath = path.join('uploads', req.file.filename);
                foodData.Image = imagePath;
            }
            const result = await Food.addFood(foodData);
            if (result.error) {
                if (req.file) {
                    fs.unlinkSync(req.file.path); // Delete the uploaded image
                }
                return res.status(400).json({ error: result.error });
            }
            res.status(201).json({ id: result.id });
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(req.file.path); // Delete the uploaded image
            }
            res.status(500).json({ error: error.message });
        }
    },

    listFood: async (req, res) => {
        try {
            const foods = await Food.listFood();
            res.status(200).json(foods);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    removeFood: async (req, res) => {
        try {
            const food = await Food.findFoodById(req.params.id);
            if (!food) {
                return res.status(404).json({ error: 'Food not found' });
            }
            await Food.removeFood(req.params.id);
            res.status(200).json({ message: 'Food removed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = foodController;
