import React from 'react';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Rent: '#6366f1',
  Shopping: '#ec4899',
  Clothing: '#f472b6',
  Travel: '#06b6d4',
  Transport: '#0ea5e9',
  Education: '#8b5cf6',
  Entertainment: '#10b981',
  Subscriptions: '#a78bfa',
  Bills: '#ef4444',
  Electricity: '#fbbf24',
  Salary: '#10b981',
  Freelance: '#06b6d4',
  Business: '#3b82f6',
  Investment: '#8b5cf6',
  Other: '#64748b'
};

export default function ExpenseChart({
  categoryData = {},
  monthlyTrends = [],
  title = 'Category Breakdown',
  mode = 'category' // 'category' or 'trends'
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Convert categoryData object to sorted array
  const categoryList = Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = categoryList.reduce((acc, item) => acc + item.amount, 0);

  // Calculate Donut SVG Slices
  let cumulativeAngle = 0;
  const donutSlices = categoryList.map((item) => {
    const percentage = totalExpense > 0 ? item.amount / totalExpense : 0;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      percentage: Math.round(percentage * 100),
      startAngle,
      angle
    };
  });

  // Calculate Bar Chart Scaling
  const maxMonthlyVal = Math.max(
    1,
    ...monthlyTrends.map((t) => Math.max(t.income || 0, t.expense || 0))
  );

  return (
    <div className="glass-card chart-container">
      <div className="chart-header">
        <div className="chart-title">
          {mode === 'category' ? <PieIcon size={18} /> : <BarChart2 size={18} />}
          <h4>{title}</h4>
        </div>
      </div>

      {mode === 'category' ? (
        totalExpense === 0 ? (
          <div className="empty-chart">
            <p>No expense category data recorded yet</p>
          </div>
        ) : (
          <div className="category-chart-body">
            {/* SVG Donut Visual */}
            <div className="donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                {donutSlices.map((slice, i) => {
                  const strokeDasharray = `${(slice.angle / 360) * 238.76} 238.76`;
                  const strokeDashoffset = -((slice.startAngle / 360) * 238.76);
                  const color = CATEGORY_COLORS[slice.category] || CATEGORY_COLORS.Other;

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 50 50)"
                      className="donut-segment"
                    />
                  );
                })}
              </svg>
              <div className="donut-center-text">
                <span className="donut-total-val">{formatCurrency(totalExpense)}</span>
                <span className="donut-total-lbl">Total Expenses</span>
              </div>
            </div>

            {/* Category Legend List */}
            <div className="category-legend">
              {donutSlices.map((item, idx) => {
                const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
                return (
                  <div key={idx} className="legend-item">
                    <div className="legend-info">
                      <span className="legend-color-dot" style={{ background: color }} />
                      <span className="legend-name">{item.category}</span>
                    </div>
                    <div className="legend-values">
                      <span className="legend-amount">{formatCurrency(item.amount)}</span>
                      <span className="legend-percentage">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Monthly Income vs Expense Bar Chart Visual */
        monthlyTrends.length === 0 ? (
          <div className="empty-chart">
            <p>No monthly trends recorded yet</p>
          </div>
        ) : (
          <div className="bar-chart-body">
            <div className="bar-legend">
              <span className="legend-badge income-badge">
                <span className="dot" style={{ background: '#10b981' }} /> Income
              </span>
              <span className="legend-badge expense-badge">
                <span className="dot" style={{ background: '#f43f5e' }} /> Expense
              </span>
            </div>

            <div className="bars-wrapper">
              {monthlyTrends.map((monthData, idx) => {
                const incomeHeight = ((monthData.income || 0) / maxMonthlyVal) * 100;
                const expenseHeight = ((monthData.expense || 0) / maxMonthlyVal) * 100;

                return (
                  <div key={idx} className="bar-column">
                    <div className="bar-pair">
                      <div
                        className="bar bar-income"
                        style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                        title={`Income: ${formatCurrency(monthData.income)}`}
                      />
                      <div
                        className="bar bar-expense"
                        style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                        title={`Expense: ${formatCurrency(monthData.expense)}`}
                      />
                    </div>
                    <span className="bar-month-lbl">{monthData.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      <style>{`
        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-main);
        }

        .chart-title h4 {
          font-size: 1rem;
        }

        .empty-chart {
          text-align: center;
          padding: 2.5rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .category-chart-body {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 0.5rem 0;
        }

        .donut-wrapper {
          position: relative;
          width: 170px;
          height: 170px;
          flex-shrink: 0;
        }

        .donut-svg {
          width: 100%;
          height: 100%;
        }

        .donut-segment {
          transition: stroke-dasharray 0.5s ease;
        }

        .donut-center-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .donut-total-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .donut-total-lbl {
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .category-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .legend-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .legend-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-name {
          color: var(--text-muted);
          font-weight: 600;
        }

        .legend-values {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legend-amount {
          font-weight: 700;
          color: var(--text-main);
        }

        .legend-percentage {
          color: var(--text-dim);
          font-size: 0.75rem;
          min-width: 30px;
          text-align: right;
        }

        /* Bar Chart Styles */
        .bar-chart-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .bar-legend {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .legend-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .legend-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .bars-wrapper {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 180px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          gap: 0.5rem;
        }

        .bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          flex: 1;
          gap: 0.4rem;
        }

        .bar-pair {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 100%;
          width: 100%;
          justify-content: center;
        }

        .bar {
          width: 12px;
          border-radius: 4px 4px 0 0;
          transition: height 0.4s ease;
        }

        .bar-income {
          background: #10b981;
        }

        .bar-expense {
          background: #f43f5e;
        }

        .bar-month-lbl {
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        @media (max-width: 640px) {
          .category-chart-body {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
