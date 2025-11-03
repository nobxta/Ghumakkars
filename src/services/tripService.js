import axios from 'axios';
import { API_URL as API_BASE_URL } from '../utils/apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Trip Service
export const tripService = {
  // Create a new trip
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/api/trips', tripData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create trip';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        const errorDetails = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
        throw new Error(`${errorMessage} - ${errorDetails}`);
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get all trips (public)
  getTrips: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/api/trips?${params.toString()}`);
      console.log('getTrips API response:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trips');
    }
  },

  // Get single trip by ID
  getTripById: async (id) => {
    try {
      console.log('tripService: Fetching trip with ID:', id);
      const response = await api.get(`/api/trips/${id}`);
      console.log('tripService: API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('tripService: Error fetching trip:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch trip');
    }
  },

  // Update trip (admin only)
  updateTrip: async (id, tripData) => {
    try {
      const response = await api.put(`/api/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update trip');
    }
  },

  // Delete trip (admin only)
  deleteTrip: async (id) => {
    try {
      const response = await api.delete(`/api/trips/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete trip');
    }
  },

  // Get all trips for admin (including unpublished)
  getAdminTrips: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/api/trips/admin/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin trips');
    }
  },

  // Update trip status
  updateTripStatus: async (id, status, cancellationReason = null) => {
    try {
      const response = await api.put(`/api/trips/${id}/status`, {
        status,
        cancellationReason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update trip status');
    }
  },

  // Get trip overview (admin only) - bookings, earnings, reviews, seats
  getTripOverview: async (id) => {
    try {
      const response = await api.get(`/api/trips/${id}/overview`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trip overview');
    }
  },

  // Like a trip
  likeTrip: async (tripId) => {
    try {
      const response = await api.post('/api/user/like-trip', { tripId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like trip');
    }
  },

  // Unlike a trip
  unlikeTrip: async (tripId) => {
    try {
      const response = await api.delete(`/api/user/unlike-trip/${tripId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlike trip');
    }
  },

  // Get user's liked trips
  getLikedTrips: async () => {
    try {
      const response = await api.get('/api/user/liked-trips');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch liked trips');
    }
  }
};

export default tripService;
