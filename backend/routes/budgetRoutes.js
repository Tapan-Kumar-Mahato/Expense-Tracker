const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, updateBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBudgets)
  .post(protect, setBudget);

router.route('/:id')
  .put(protect, updateBudget);

module.exports = router;
