const API_BASE_URL = '/api';

/**
 * Custom Fetch API wrapper with authentication token header and error handling
 */
export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Read body as text first so we can handle empty / non-JSON responses
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }

    if (!response.ok) {
      // If token expired or unauthorized, clean local storage
      if (response.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.message || 'An error occurred while fetching data');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
