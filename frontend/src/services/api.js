const API_BASE = '/api';

export const api = {
  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  // Sales
  getSales: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/sales?${query}`);
    if (!res.ok) throw new Error('Failed to fetch sales');
    return res.json();
  },

  getSalesAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/sales/analytics?${query}`);
    if (!res.ok) throw new Error('Failed to fetch sales analytics');
    return res.json();
  },

  // Inventory
  getInventory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inventory?${query}`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  reorderStock: async (productId, quantity) => {
    const res = await fetch(`${API_BASE}/inventory/reorder/${productId}?quantity=${quantity}`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to reorder stock');
    return res.json();
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getProductDetails: async (productId) => {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  // Forecast
  getForecastOptions: async () => {
    const res = await fetch(`${API_BASE}/forecast/options`);
    if (!res.ok) throw new Error('Failed to fetch forecast options');
    return res.json();
  },

  getForecast: async (productId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/forecast/${productId}?${query}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  // Alerts
  getAlerts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alerts?${query}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  updateAlertStatus: async (alertId, status) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status?status=${status}`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to update alert status');
    return res.json();
  },

  resolveAllAlerts: async () => {
    const res = await fetch(`${API_BASE}/alerts/resolve-all`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alerts');
    return res.json();
  },

  // Stores
  getStores: async () => {
    const res = await fetch(`${API_BASE}/stores`);
    if (!res.ok) throw new Error('Failed to fetch stores');
    return res.json();
  },

  // AI Insights
  getAIInsights: async () => {
    const res = await fetch(`${API_BASE}/ai/insights`);
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  askAI: async (question) => {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('Failed to query AI');
    return res.json();
  },

  // Demo Mode
  launchDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/launch`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to launch demo');
    return res.json();
  },

  // Upload CSV
  uploadSalesCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  }
};
