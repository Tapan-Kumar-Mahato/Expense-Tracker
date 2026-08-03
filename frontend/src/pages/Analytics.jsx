import React, { useState, useEffect, useCallback } from 'react';
import { PieChart as PieIcon, BarChart2, TrendingUp, PiggyBank } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import ExpenseChart from '../components/ExpenseChart';
import { transactionService } from '../services/transactionService';

export default function Analytics() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryExpenses: {},
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionService.getSummary();
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const savingsRate = summary.totalIncome > 0 
    ? Math.max(0, Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100))
    : 0;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Analytics</h1>
          <p className="page-subtitle">Deep dive into your cash flow trends, category distribution, and savings rate.</p>
        </div>
      </div>

      {/* Financial Analytics Metrics */}
      <div className="grid-summary">
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          type="income"
          subtitle="Cumulative earnings"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          type="expense"
          subtitle="Cumulative spending"
        />
        <SummaryCard
          title="Net Savings"
          amount={summary.balance}
          type={summary.balance >= 0 ? 'income' : 'expense'}
          subtitle={summary.balance >= 0 ? 'Positive net cashflow' : 'Negative cashflow deficit'}
        />
        <SummaryCard
          title="Savings Rate"
          amount={savingsRate}
          type="balance"
          subtitle={`${savingsRate}% of income saved`}
          progress={savingsRate}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid-analytics-charts">
        {/* Category Breakdown Donut Chart */}
        <ExpenseChart
          categoryData={summary.categoryExpenses}
          title="Expenses Grouped by Category"
          mode="category"
        />

        {/* Monthly Income vs Expense Trends Bar Chart */}
        <ExpenseChart
          monthlyTrends={summary.monthlyTrends}
          title="Monthly Income vs Expense Trends"
          mode="trends"
        />
      </div>

      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .grid-analytics-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .grid-analytics-charts {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
