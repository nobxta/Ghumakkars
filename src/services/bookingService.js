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

const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      console.log('Sending booking data:', bookingData);
      const response = await api.post('/api/booking/create', bookingData);
      return response.data;
    } catch (error) {
      console.error('Booking API error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        const errorDetails = validationErrors.map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new Error(`${errorMessage}. Details: ${errorDetails}`);
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get user's bookings
  getMyBookings: async (params = {}) => {
    try {
      const response = await api.get('/api/booking/my-bookings', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  // Get booking details
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/api/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/api/booking/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  // Admin: Get all bookings
  getAllBookings: async (params = {}) => {
    try {
      const response = await api.get('/api/booking/admin/all', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all bookings');
    }
  },

  // Admin: Approve booking
  approveBooking: async (bookingId) => {
    try {
      const response = await api.put(`/api/booking/admin/${bookingId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve booking');
    }
  },

  // Admin: Reject booking
  rejectBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/api/booking/admin/${bookingId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject booking');
    }
  },

  // Admin: Get payment analytics
  getPaymentAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/booking/admin/analytics', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment analytics');
    }
  },

  // Admin: Get seat lock reminders
  getSeatLockReminders: async (params = {}) => {
    try {
      const response = await api.get('/api/booking/admin/seat-lock-reminders', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch seat lock reminders');
    }
  },

  // Admin: Send payment reminder
  sendReminder: async (bookingId, reminderType) => {
    try {
      const response = await api.post('/api/booking/admin/send-reminder', {
        bookingId,
        reminderType
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reminder');
    }
  }
};

export default bookingService;
