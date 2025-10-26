import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const reviewService = {
  // Create or update a review (one per user per trip), with optional images
  submitReview: async (tripId, { rating, comment, files = [] }) => {
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    files.forEach((file) => formData.append('images', file));

    const response = await api.post(`/api/reviews/${tripId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // List reviews for a trip
  listReviews: async (tripId) => {
    const response = await api.get(`/api/reviews/${tripId}`);
    return response.data;
  },

  // Trip gallery images
  listGallery: async (tripId) => {
    const response = await api.get(`/api/reviews/${tripId}/gallery`);
    return response.data;
  }
};

export default reviewService;


