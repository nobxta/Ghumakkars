import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

// Create axios instance with default config
const dashboardAPI = axios.create({
  baseURL: `${API_BASE_URL}/dashboard`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
dashboardAPI.interceptors.request.use(
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

// Dashboard API service
export const dashboardService = {
  // Get overview metrics
  getOverview: async () => {
    try {
      const response = await dashboardAPI.get('/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Get user analytics
  getUsers: async (period = '30') => {
    try {
      const response = await dashboardAPI.get(`/users?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Get trip analytics
  getTrips: async () => {
    try {
      const response = await dashboardAPI.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Error fetching trip analytics:', error);
      throw error;
    }
  },

  // Get booking analytics
  getBookings: async (period = '30') => {
    try {
      const response = await dashboardAPI.get(`/bookings?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      throw error;
    }
  },

  // Get financial analytics
  getFinancial: async (period = '30') => {
    try {
      const response = await dashboardAPI.get(`/financial?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  },

  // Get performance metrics
  getPerformance: async () => {
    try {
      const response = await dashboardAPI.get('/performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },
};

export default dashboardService;
