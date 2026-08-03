const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Summary route must come before :id route to prevent collision
router.get('/summary', protect, getTransactionSummary);

router.route('/')
  .get(protect, getTransactions)
  .post(protect, addTransaction);

router.route('/:id')
  .get(protect, getTransactionById)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
