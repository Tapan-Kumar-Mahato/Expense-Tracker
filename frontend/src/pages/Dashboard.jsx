import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import TransactionForm from '../components/TransactionForm';
import TransactionItem from '../components/TransactionItem';
import ExpenseChart from '../components/ExpenseChart';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryExpenses: {},
    recentTransactions: []
  });
  const [budgetMetrics, setBudgetMetrics] = useState({
    budgetAmount: 0,
    amountSpent: 0,
    remainingBudget: 0,
    percentageUsed: 0,
    isWarning: false,
    isExceeded: false
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, budgetRes] = await Promise.all([
        transactionService.getSummary(),
        budgetService.getBudget()
      ]);

      if (summaryRes.summary) {
        setSummary(summaryRes.summary);
      }
      if (budgetRes.metrics) {
        setBudgetMetrics(budgetRes.metrics);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddTransaction = async (formData) => {
    await transactionService.addTransaction(formData);
    setShowAddModal(false);
    fetchDashboardData();
  };

  const handleUpdateTransaction = async (formData) => {
    if (editingTransaction) {
      await transactionService.updateTransaction(editingTransaction._id, formData);
      setEditingTransaction(null);
      fetchDashboardData();
    }
  };

  const handleDeleteTransaction = async (id) => {
    await transactionService.deleteTransaction(id);
    fetchDashboardData();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name || 'User'}! Here is your current financial summary.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Budget Threshold Warning Banner */}
      {(budgetMetrics.isWarning || budgetMetrics.isExceeded) && (
        <div className={`alert ${budgetMetrics.isExceeded ? 'alert-error' : 'alert-warning'}`}>
          <AlertTriangle size={20} />
          <div>
            <strong>
              {budgetMetrics.isExceeded ? 'Budget Exceeded Warning!' : 'Budget Warning!'}
            </strong>
            <span>
              {' '}You have used {budgetMetrics.percentageUsed}% of your monthly budget. 
              {budgetMetrics.isExceeded ? ' Total spending exceeds limit.' : ' Keep an eye on expenses.'}
            </span>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid-summary">
        <SummaryCard
          title="Current Balance"
          amount={summary.balance}
          type="balance"
          subtitle="Net financial total"
        />
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          type="income"
          subtitle="Total recorded earnings"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          type="expense"
          subtitle="Total recorded spending"
        />
        <SummaryCard
          title="Monthly Budget"
          amount={budgetMetrics.remainingBudget}
          type={budgetMetrics.isExceeded ? 'expense' : budgetMetrics.isWarning ? 'warning' : 'income'}
          subtitle={budgetMetrics.budgetAmount > 0 ? `${budgetMetrics.percentageUsed}% of ₹${budgetMetrics.budgetAmount} spent` : 'No budget configured yet'}
          progress={budgetMetrics.budgetAmount > 0 ? budgetMetrics.percentageUsed : undefined}
        />
      </div>

      {/* Main Grid: Recent Transactions & Category Breakdown */}
      <div className="grid-dashboard-main">
        {/* Left Column: Recent Activity */}
        <div className="glass-card section-card">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <Link to="/transactions" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : summary.recentTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No recent transactions. Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="recent-list">
              {summary.recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx._id}
                  transaction={tx}
                  onEdit={(item) => setEditingTransaction(item)}
                  onDelete={handleDeleteTransaction}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Category Distribution */}
        <div className="section-card">
          <ExpenseChart
            categoryData={summary.categoryExpenses}
            title="Spending Summary"
            mode="category"
          />
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TransactionForm
              onSubmit={handleAddTransaction}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--primary);
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
