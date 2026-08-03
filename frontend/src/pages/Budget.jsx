import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import { budgetService } from '../services/budgetService';

export default function Budget() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [budgetInput, setBudgetInput] = useState('');
  
  const [metrics, setMetrics] = useState({
    budgetAmount: 0,
    amountSpent: 0,
    remainingBudget: 0,
    percentageUsed: 0,
    isWarning: false,
    isExceeded: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBudgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await budgetService.getBudget(selectedMonth, selectedYear);
      if (res.metrics) {
        setMetrics(res.metrics);
        setBudgetInput(res.metrics.budgetAmount ? String(res.metrics.budgetAmount) : '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const numericAmount = parseFloat(budgetInput);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError('Please enter a valid non-negative budget amount.');
      return;
    }

    try {
      setSaving(true);
      await budgetService.setBudget(numericAmount, selectedMonth, selectedYear);
      setMessage('Budget updated successfully!');
      fetchBudgetData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update budget.');
    } finally {
      setSaving(false);
    }
  };

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="budget-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Budget Planner</h1>
          <p className="page-subtitle">Set monthly spending limits and monitor your usage in real-time.</p>
        </div>

        {/* Month & Year Selectors */}
        <div className="selector-group">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="form-select"
          >
            {MONTHS.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="form-select"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> {message}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {metrics.isExceeded && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>
            <strong>Budget Exceeded!</strong> You have spent ₹{metrics.amountSpent.toFixed(2)}, exceeding your limit of ₹{metrics.budgetAmount.toFixed(2)}.
          </span>
        </div>
      )}

      {metrics.isWarning && !metrics.isExceeded && (
        <div className="alert alert-warning">
          <AlertTriangle size={20} />
          <span>
            <strong>Warning: High Spending!</strong> You have used {metrics.percentageUsed}% of your target budget.
          </span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid-summary">
        <SummaryCard
          title="Monthly Budget Limit"
          amount={metrics.budgetAmount}
          type="balance"
          subtitle={`Budget target for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
        />
        <SummaryCard
          title="Amount Spent"
          amount={metrics.amountSpent}
          type="expense"
          subtitle="Total expenses this month"
        />
        <SummaryCard
          title="Remaining Budget"
          amount={metrics.remainingBudget}
          type={metrics.remainingBudget < 0 ? 'expense' : 'income'}
          subtitle={metrics.remainingBudget < 0 ? 'Over budget limit' : 'Funds available to spend'}
        />
        <SummaryCard
          title="Budget Usage"
          amount={metrics.percentageUsed}
          type={metrics.isExceeded ? 'expense' : metrics.isWarning ? 'warning' : 'income'}
          subtitle={`${metrics.percentageUsed}% of budget used`}
          progress={metrics.percentageUsed}
        />
      </div>

      {/* Set Budget Form Card */}
      <div className="glass-card budget-form-card">
        <div className="card-header">
          <Wallet size={20} className="icon-purple" />
          <h3>Configure Target Budget</h3>
        </div>

        <form onSubmit={handleSaveBudget} className="budget-form">
          <div className="form-group">
            <label className="form-label">
              Monthly Budget Amount for {MONTHS[selectedMonth - 1]} {selectedYear} (₹)
            </label>
            <div className="input-row">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 2000.00"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="form-input"
                required
              />
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Save size={18} /> Save Target Budget
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .budget-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .selector-group {
          display: flex;
          gap: 0.75rem;
        }

        .budget-form-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 600px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
        }

        .icon-purple {
          color: #818cf8;
        }

        .input-row {
          display: flex;
          gap: 0.75rem;
        }

        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
