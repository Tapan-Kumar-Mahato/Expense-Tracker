import React from 'react';
import { Search, Filter, Inbox } from 'lucide-react';
import TransactionItem from './TransactionItem';

const ALL_CATEGORIES = [
  'All',
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
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other'
];

export default function TransactionList({
  transactions = [],
  loading = false,
  filters = {},
  onFilterChange,
  onEdit,
  onDelete
}) {
  return (
    <div className="transaction-list-container">
      {/* Filter & Search Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="form-input search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={filters.type || 'all'}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="form-select filter-select"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.category || 'All'}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="form-select filter-select"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} />
          <h4>No transactions found</h4>
          <p>Try clearing your search filters or add a new transaction.</p>
        </div>
      ) : (
        <div className="items-wrapper">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx._id}
              transaction={tx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <style>{`
        .transaction-list-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }

        .search-input {
          padding-left: 2.5rem;
        }

        .filter-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .filter-icon {
          color: var(--text-muted);
        }

        .filter-select {
          min-width: 140px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 3rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-controls {
            flex-direction: row;
          }
          .filter-select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
