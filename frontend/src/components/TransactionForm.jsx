import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, X, Check } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Shopping',
  'Clothing',
  'Travel',
  'Transport',
  'Education',
  'Entertainment',
  'Subscriptions',
  'Bills',
  'Electricity',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other'
];

export default function TransactionForm({ onSubmit, initialData = null, onCancel }) {
  const isEditMode = !!initialData;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync category options when type changes
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(initialData.category || (initialData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]));
      setDescription(initialData.description || '');
      if (initialData.date) {
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
      }
    }
  }, [initialData]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        type,
        amount: numericAmount,
        category,
        description,
        date
      });

      if (!isEditMode) {
        // Reset form for next entry
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-header">
        <h4>{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</h4>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-close">
            <X size={18} />
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Type Selector Toggle */}
      <div className="type-toggle-container">
        <button
          type="button"
          className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          Income
        </button>
      </div>

      {/* Amount & Category inputs */}
      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group flex-1">
          <label className="form-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description & Date */}
      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label">Description</label>
          <input
            type="text"
            placeholder="e.g. Grocery shopping, Client invoice..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group flex-1">
          <label className="form-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            required
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <div className="spinner" />
          ) : isEditMode ? (
            <>
              <Check size={18} /> Update Transaction
            </>
          ) : (
            <>
              <PlusCircle size={18} /> Add Transaction
            </>
          )}
        </button>
      </div>

      <style>{`
        .transaction-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-header h4 {
          font-size: 1.1rem;
          color: var(--text-main);
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .type-toggle-container {
          display: flex;
          background: var(--bg-input);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .type-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .type-btn.active-expense {
          background: var(--expense-bg);
          color: var(--expense-color);
          border: 1px solid var(--expense-border);
        }

        .type-btn.active-income {
          background: var(--income-bg);
          color: var(--income-color);
          border: 1px solid var(--income-border);
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </form>
  );
}
