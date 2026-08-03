import { fetchAPI } from './api';

export const transactionService = {
  /**
   * Fetch all transactions with optional query filters
   */
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await fetchAPI(`/transactions${queryString}`);
  },

  /**
   * Add a new transaction
   */
  async addTransaction(transactionData) {
    return await fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  },

  /**
   * Get single transaction by ID
   */
  async getTransactionById(id) {
    return await fetchAPI(`/transactions/${id}`);
  },

  /**
   * Update transaction by ID
   */
  async updateTransaction(id, transactionData) {
    return await fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  },

  /**
   * Delete transaction by ID
   */
  async deleteTransaction(id) {
    return await fetchAPI(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get summary data (total income, expenses, balance, categories, monthly trends)
   */
  async getSummary(month, year) {
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await fetchAPI(`/transactions/summary${queryString}`);
  }
};
