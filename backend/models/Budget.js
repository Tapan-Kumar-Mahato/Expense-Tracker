const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify a monthly budget amount'],
      min: [0, 'Budget amount cannot be negative']
    },
    month: {
      type: Number,
      required: [true, 'Please specify a month (1-12)'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12']
    },
    year: {
      type: Number,
      required: [true, 'Please specify a year'],
      min: [2000, 'Year must be valid']
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure a single budget record per user per month/year
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
