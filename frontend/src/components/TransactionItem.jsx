import React, { useState } from 'react';
import { 
  Utensils, 
  Home, 
  ShoppingBag, 
  Plane, 
  GraduationCap, 
  Film, 
  FileText, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Tag, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Car,
  Tv,
  Shirt,
  Zap
} from 'lucide-react';

const CATEGORY_ICONS = {
  Food: Utensils,
  Rent: Home,
  Shopping: ShoppingBag,
  Clothing: Shirt,
  Travel: Plane,
  Transport: Car,
  Education: GraduationCap,
  Entertainment: Film,
  Subscriptions: Tv,
  Bills: FileText,
  Electricity: Zap,
  Salary: DollarSign,
  Freelance: Briefcase,
  Business: Briefcase,
  Investment: TrendingUp,
  Other: Tag
};

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { _id, type, amount, category, description, date } = transaction;

  const IconComponent = CATEGORY_ICONS[category] || Tag;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val || 0);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(_id);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="transaction-item">
      <div className="item-left">
        <div className={`category-icon-bg ${type === 'income' ? 'bg-income' : 'bg-expense'}`}>
          <IconComponent size={18} />
        </div>
        <div className="item-details">
          <div className="item-header-row">
            <span className="item-category">{category}</span>
            <span className={`badge ${type === 'income' ? 'badge-income' : 'badge-expense'}`}>
              {type}
            </span>
          </div>
          <span className="item-desc">{description || 'No description'}</span>
          <span className="item-date">{formatDate(date)}</span>
        </div>
      </div>

      <div className="item-right">
        <span className={`item-amount ${type === 'income' ? 'amount-income' : 'amount-expense'}`}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
        </span>

        <div className="item-actions">
          <button
            onClick={() => onEdit(transaction)}
            className="action-btn edit-btn"
            title="Edit Transaction"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="action-btn delete-btn"
            title="Delete Transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="confirm-icon">
              <AlertTriangle size={32} color="#f43f5e" />
            </div>
            <h4>Delete Transaction?</h4>
            <p>
              Are you sure you want to delete this {category} ({formatCurrency(amount)}) transaction? This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? <div className="spinner" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .transaction-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          margin-bottom: 0.75rem;
          transition: var(--transition-fast);
        }

        .transaction-item:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-icon-bg {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-income {
          background: var(--income-bg);
          color: var(--income-color);
          border: 1px solid var(--income-border);
        }

        .bg-expense {
          background: var(--expense-bg);
          color: var(--expense-color);
          border: 1px solid var(--expense-border);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .item-header-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .item-category {
          font-weight: 700;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .item-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .item-date {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .item-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .item-amount {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .amount-income {
          color: var(--income-color);
        }

        .amount-expense {
          color: var(--expense-color);
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .action-btn {
          background: transparent;
          border: none;
          padding: 0.4rem;
          border-radius: 6px;
          color: var(--text-dim);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .edit-btn:hover {
          color: #818cf8;
          background: rgba(99, 102, 241, 0.15);
        }

        .delete-btn:hover {
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.15);
        }

        .confirm-modal {
          max-width: 420px;
          text-align: center;
        }

        .confirm-icon {
          margin: 0 auto 1rem;
          width: 56px;
          height: 56px;
          background: rgba(244, 63, 94, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .confirm-modal h4 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .confirm-modal p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .confirm-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .transaction-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .item-right {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
