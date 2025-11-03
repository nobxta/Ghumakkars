import axios from 'axios';
import { API_URL } from '../utils/apiConfig';

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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

const couponService = {
  // Apply a coupon to a trip
  applyCoupon: async (couponCode, tripId, totalAmount) => {
    try {
      const response = await api.post('/api/coupons/apply', {
        couponCode,
        tripId,
        totalAmount
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply coupon');
    }
  },

  // Get available coupons for a trip
  getAvailableCoupons: async (tripId = null) => {
    try {
      const params = tripId ? { tripId } : {};
      const response = await api.get('/api/coupons/available', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available coupons');
    }
  },

  // Get user's coupon usage history
  getMyCouponUsage: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/api/coupons/my-usage', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupon usage history');
    }
  },

  // Admin: Get all coupons
  getAllCoupons: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/coupons', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
    }
  },

  // Admin: Get coupon details
  getCouponDetails: async (couponId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/admin/coupons/${couponId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupon details');
    }
  },

  // Admin: Create coupon
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/api/admin/coupons', couponData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
  },

  // Admin: Update coupon
  updateCoupon: async (couponId, updateData) => {
    try {
      const response = await api.put(`/api/admin/coupons/${couponId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update coupon');
    }
  },

  // Admin: Delete coupon
  deleteCoupon: async (couponId) => {
    try {
      const response = await api.delete(`/api/admin/coupons/${couponId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
  },

  // Admin: Get coupon analytics
  getCouponAnalytics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/api/admin/coupons/analytics/overview', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupon analytics');
    }
  },

  // Admin: Bulk actions on coupons
  bulkAction: async (action, couponIds) => {
    try {
      const response = await api.post('/api/admin/coupons/bulk-actions', {
        action,
        couponIds
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to perform bulk action');
    }
  }
};

export default couponService;
