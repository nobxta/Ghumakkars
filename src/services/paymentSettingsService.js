import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const paymentSettingsService = {
  // Get public payment settings (no auth required)
  getPublicSettings: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payment-settings/public`);
      return response.data;
    } catch (error) {
      console.error('Get public payment settings error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment settings');
    }
  },

  // Admin: Get payment settings
  getSettings: async () => {
    try {
      const response = await api.get('/api/payment-settings');
      return response.data;
    } catch (error) {
      console.error('Get payment settings error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment settings');
    }
  },

  // Admin: Update payment settings
  updateSettings: async (settingsData) => {
    try {
      const response = await api.post('/api/payment-settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Update payment settings error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update payment settings');
    }
  },
};

export default paymentSettingsService;

