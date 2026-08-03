import { fetchAPI } from './api';

export const budgetService = {
  /**
   * Get budget for specific month and year
   */
  async getBudget(month, year) {
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await fetchAPI(`/budgets${queryString}`);
  },

  /**
   * Set or update monthly budget
   */
  async setBudget(amount, month, year) {
    return await fetchAPI('/budgets', {
      method: 'POST',
      body: JSON.stringify({ amount, month, year })
    });
  },

  /**
   * Update budget by ID
   */
  async updateBudget(id, amount) {
    return await fetchAPI(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ amount })
    });
  }
};
