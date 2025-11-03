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

const referralService = {
  // Get user's referral statistics
  getReferralStats: async () => {
    try {
      const response = await api.get('/api/referrals/stats');
      return response.data;
    } catch (error) {
      console.error('Get referral stats error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch referral stats');
    }
  },

  // Get user's referral link
  getReferralLink: async () => {
    try {
      const response = await api.get('/api/referrals/link');
      return response.data;
    } catch (error) {
      console.error('Get referral link error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch referral link');
    }
  },

  // Share referral link on social media
  shareReferralLink: (platform, referralLink, referralCode) => {
    const baseUrl = window.location.origin;
    const message = `Join me on Ghumakkars! Use my referral code ${referralCode} to get ₹100 off your first trip! ${referralLink}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/918384826414?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join me on Ghumakkars!&body=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  },

  // Copy referral code to clipboard
  copyToClipboard: async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      return false;
    }
  },

  // Admin: Get all referrals
  getAllReferrals: async () => {
    try {
      const response = await api.get('/api/referrals/admin/all');
      return response.data;
    } catch (error) {
      console.error('Get all referrals error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch referrals');
    }
  }
};

export default referralService;
