import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { transactionService } from '../services/transactionService';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'All',
    search: ''
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const res = await transactionService.getTransactions(params);
      setTransactions(res.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (formData) => {
    await transactionService.addTransaction(formData);
    setShowAddModal(false);
    fetchTransactions();
  };

  const handleUpdateTransaction = async (formData) => {
    if (editingTransaction) {
      await transactionService.updateTransaction(editingTransaction._id, formData);
      setEditingTransaction(null);
      fetchTransactions();
    }
  };

  const handleDeleteTransaction = async (id) => {
    await transactionService.deleteTransaction(id);
    fetchTransactions();
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (!transactions.length) return;
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">View, search, filter, and manage your income and expenses.</p>
        </div>
        <div className="header-actions">
          <button onClick={exportToCSV} className="btn btn-secondary" disabled={!transactions.length}>
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="glass-card">
        <TransactionList
          transactions={transactions}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
          onEdit={(item) => setEditingTransaction(item)}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Add Modal */}
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

      {/* Edit Modal */}
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
        .transactions-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
