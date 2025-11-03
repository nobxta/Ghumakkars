import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const contactService = {
  // Submit contact form
  submitContact: async (contactData) => {
    try {
      const response = await api.post('/api/contact/submit', contactData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit contact form');
    }
  },

  // Admin: Get all contact queries
  getAllContacts: async (params = {}) => {
    try {
      const response = await api.get('/api/contact/admin/all', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact queries');
    }
  },

  // Admin: Get contact statistics
  getContactStats: async () => {
    try {
      const response = await api.get('/api/contact/admin/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact statistics');
    }
  },

  // Admin: Get single contact query
  getContactById: async (id) => {
    try {
      const response = await api.get(`/api/contact/admin/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact query');
    }
  },

  // Admin: Reply to contact query
  replyToContact: async (id, message) => {
    try {
      const response = await api.post(`/api/contact/admin/${id}/reply`, { message });
      return response.data;
    } catch (error) {
      console.error('Reply to contact error:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.length > 0) {
          throw new Error(errorData.errors[0].msg || 'Validation failed');
        }
        throw new Error(errorData.message || 'Validation failed');
      } else if (error.response?.status === 401) {
        throw new Error('Access denied. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin role required.');
      } else if (error.response?.status === 404) {
        throw new Error('Contact query not found');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to send reply');
      }
    }
  },

  // Admin: Update contact status
  updateContactStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/contact/admin/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  // Admin: Assign contact to admin
  assignContact: async (id, assignedTo) => {
    try {
      const response = await api.put(`/api/contact/admin/${id}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign contact');
    }
  }
};

export default contactService;
