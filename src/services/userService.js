import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (profileData, isFormData = false) => {
    try {
      // Check if there's any data to send
      if (isFormData) {
        // For FormData, check if it has any entries
        if (profileData instanceof FormData) {
          const hasEntries = Array.from(profileData.entries()).length > 0;
          if (!hasEntries) {
            throw new Error('No data to update');
          }
        }
      } else {
        // For regular objects, check if it has any properties
        const hasKeys = profileData && Object.keys(profileData).length > 0;
        if (!hasKeys) {
          throw new Error('No data to update');
        }
      }

      const config = isFormData ? {
        // Don't set Content-Type for FormData - let browser set it with boundary
        transformRequest: [
          function (data, headers) {
            if (data instanceof FormData) {
              delete headers['Content-Type'];
            }
            return data;
          }
        ]
      } : {};
      
      const response = await api.put('/api/user/profile', profileData, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  },

  // Submit verification
  submitVerification: async (verificationData) => {
    try {
      const response = await api.post('/api/user/verification', verificationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit verification');
    }
  },

  // Get wallet details
  getWallet: async () => {
    try {
      const response = await api.get('/api/user/wallet');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet');
    }
  },

  // Get referrals
  getReferrals: async () => {
    try {
      const response = await api.get('/api/referrals/invitees');
      return response.data?.data || { referralCode: '', referrals: [], totalEarnings: 0 };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch referrals');
    }
  },

  // Apply referral code
  applyReferralCode: async (referralCode, userId) => {
    try {
      const response = await api.post('/api/user/referral/apply', {
        referralCode,
        userId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply referral code');
    }
  },

  // Get trip history
  getTripHistory: async () => {
    try {
      const response = await api.get('/api/user/trips');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trip history');
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/user/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Add money to wallet (admin only)
  addWalletMoney: async (data) => {
    try {
      const response = await api.post('/api/user/admin/add-wallet-money', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add money to wallet');
    }
  },

  // Get detailed user information (admin only)
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/api/user/admin/details/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  },

  // Get user bookings (for My Trips)
  getMyBookings: async () => {
    try {
      const response = await api.get('/api/booking/my-bookings', { 
        params: { limit: 100 } // Get all bookings
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
};

export default userService;
