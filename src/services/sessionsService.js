import axios from 'axios';
import { API_URL } from '../utils/apiConfig';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

const sessionsService = {
  // Get location statistics for admin
  getLocationStats: async () => {
    try {
      const response = await api.get('/api/user/admin/location-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch location statistics');
    }
  },

  // Get analytics overview (reach, audience, views, clicks, actions, registrations)
  getAnalyticsOverview: async (dateRange = '30d') => {
    try {
      const response = await api.get('/api/analytics/admin/overview', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics overview');
    }
  },

  // Get page performance metrics
  getPagePerformance: async (dateRange = '30d') => {
    try {
      const response = await api.get('/api/analytics/admin/page-performance', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch page performance');
    }
  },

  // Get IP-based statistics
  getIPStats: async (dateRange = '30d') => {
    try {
      const response = await api.get('/api/analytics/admin/ip-stats', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch IP statistics');
    }
  },

  // Track analytics event (public endpoint)
  trackEvent: async (eventData) => {
    try {
      const response = await api.post('/api/analytics/track', eventData);
      return response.data;
    } catch (error) {
      // Don't throw error for tracking - fail silently
      console.error('Analytics tracking failed:', error);
      return { success: false };
    }
  }
};

export default sessionsService;

