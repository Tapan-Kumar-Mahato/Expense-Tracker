const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = [
  // Expense Categories
  'Food',
  'Rent',
  'Shopping',
  'Travel',
  'Education',
  'Entertainment',
  'Bills',
  // Income Categories
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  // Shared
  'Other'
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type must be income or expense']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ALLOWED_CATEGORIES,
        message: '{VALUE} is not a supported category'
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
