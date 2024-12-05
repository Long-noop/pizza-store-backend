const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

router.get('/list', ingredientController.listIngredients);
router.post('/add', ingredientController.addIngredient);
router.put('/update/:id', ingredientController.updateIngredient);
router.delete('/remove/:id', ingredientController.removeIngredient);

module.exports = router;
