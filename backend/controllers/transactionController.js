const Transaction = require('../models/Transaction');

/**
 * @desc    Get all transactions for logged in user (with optional filters)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, category, startDate, endDate, month, year, search } = req.query;

    // Base filter scoped strictly to the authenticated user
    const queryFilter = { user: userId };

    if (type) {
      queryFilter.type = type;
    }

    if (category && category !== 'All') {
      queryFilter.category = category;
    }

    if (search) {
      queryFilter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filtering options
    if (startDate || endDate) {
      queryFilter.date = {};
      if (startDate) queryFilter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryFilter.date.$lte = end;
      }
    } else if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);
      queryFilter.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const transactions = await Transaction.find(queryFilter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const addTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      res.status(400);
      throw new Error('Please provide transaction type, amount, and category');
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400);
      throw new Error('Amount must be a positive number greater than zero');
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: numericAmount,
      category,
      description: description || '',
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Ensure transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this transaction');
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Ensure transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this transaction');
    }

    const { type, amount, category, description, date } = req.body;

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400);
        throw new Error('Amount must be a positive number greater than zero');
      }
      transaction.amount = numericAmount;
    }

    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Ensure transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this transaction');
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction removed successfully',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary statistics (Totals, category breakdown, monthly trends)
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    const queryFilter = { user: userId };
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);
      queryFilter.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const transactions = await Transaction.find(queryFilter);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenses = {};
    const categoryIncome = {};

    transactions.forEach((item) => {
      if (item.type === 'income') {
        totalIncome += item.amount;
        categoryIncome[item.category] = (categoryIncome[item.category] || 0) + item.amount;
      } else if (item.type === 'expense') {
        totalExpenses += item.amount;
        categoryExpenses[item.category] = (categoryExpenses[item.category] || 0) + item.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    // Calculate monthly spending trends across all time or past 6 months
    const allTransactions = await Transaction.find({ user: userId }).sort({ date: 1 });
    const monthlyTrendsMap = {};

    allTransactions.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTrendsMap[key]) {
        monthlyTrendsMap[key] = { month: key, income: 0, expense: 0 };
      }
      if (item.type === 'income') {
        monthlyTrendsMap[key].income += item.amount;
      } else {
        monthlyTrendsMap[key].expense += item.amount;
      }
    });

    const monthlyTrends = Object.values(monthlyTrendsMap).sort((a, b) => a.month.localeCompare(b.month));

    // Get 5 recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        categoryExpenses,
        categoryIncome,
        monthlyTrends,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};
