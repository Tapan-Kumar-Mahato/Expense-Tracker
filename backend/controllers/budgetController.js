const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get monthly budget and spending progress
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Find budget document for specified month and year
    let budget = await Budget.findOne({ user: userId, month, year });

    // Calculate actual expenses for this month and year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseTransactions = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const amountSpent = expenseTransactions.reduce((acc, item) => acc + item.amount, 0);

    const budgetAmount = budget ? budget.amount : 0;
    const remainingBudget = budgetAmount - amountSpent;
    const percentageUsed = budgetAmount > 0 ? Math.min(Math.round((amountSpent / budgetAmount) * 100), 999) : 0;

    res.status(200).json({
      success: true,
      budget: budget || { user: userId, amount: 0, month, year },
      metrics: {
        month,
        year,
        budgetAmount,
        amountSpent,
        remainingBudget,
        percentageUsed,
        isWarning: budgetAmount > 0 && percentageUsed >= 80,
        isExceeded: budgetAmount > 0 && amountSpent > budgetAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update budget for month/year
 * @route   POST /api/budgets
 * @access  Private
 */
const setBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, month, year } = req.body;

    if (amount === undefined || amount === null) {
      res.status(400);
      throw new Error('Please provide budget amount');
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      res.status(400);
      throw new Error('Budget amount must be a non-negative number');
    }

    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : (now.getMonth() + 1);
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    if (targetMonth < 1 || targetMonth > 12) {
      res.status(400);
      throw new Error('Month must be between 1 and 12');
    }

    // Upsert budget record
    let budget = await Budget.findOneAndUpdate(
      { user: userId, month: targetMonth, year: targetYear },
      { amount: numericAmount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget set successfully',
      budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update budget by ID
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget record not found');
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this budget');
    }

    const { amount } = req.body;

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        res.status(400);
        throw new Error('Budget amount must be non-negative');
      }
      budget.amount = numericAmount;
    }

    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  updateBudget
};
