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
  submitReview: async (tripId, { rating, comment, files = [], existingImages = [] }) => {
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    
    // Append existing images as JSON string so backend knows which images to keep
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }
    
    // Append new file uploads
    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file);
      }
    });

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
  },

  // Check if user can review this trip
  checkEligibility: async (tripId) => {
    const response = await api.get(`/api/reviews/${tripId}/eligibility`);
    return response.data;
  }
};

export default reviewService;


