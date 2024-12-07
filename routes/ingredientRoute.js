const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authMiddleware = require('../middleware/auth.js');

router.get('/list', authMiddleware, ingredientController.listIngredients);
router.post('/add', authMiddleware, ingredientController.addIngredient);
router.put('/update/:id', authMiddleware, ingredientController.updateIngredient);
router.delete('/remove/:id', authMiddleware, ingredientController.removeIngredient);

module.exports = router;
