/**
 * Centralized API configuration
 * This ensures consistent API URL usage across the entire application
 */

// Get API URL from environment variable
// Remove trailing slash if present
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
};

// Get API base URL (with /api prefix)
const getApiBaseUrl = () => {
  const apiUrl = getApiUrl();
  // If API URL already includes /api, don't add it again
  if (apiUrl.endsWith('/api')) {
    return apiUrl;
  }
  return `${apiUrl}/api`;
};

// Export constants
export const API_URL = getApiUrl();
export const API_BASE_URL = getApiBaseUrl();

// Helper function to build full API endpoint
export const buildApiEndpoint = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If endpoint already starts with /api, use API_URL directly
  if (cleanEndpoint.startsWith('api/')) {
    return `${API_URL}/${cleanEndpoint}`;
  }
  
  // Otherwise use API_BASE_URL
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Log API URL in development (helps with debugging)
if (import.meta.env.DEV) {
  console.log('🔗 API Configuration:');
  console.log('   API_URL:', API_URL);
  console.log('   API_BASE_URL:', API_BASE_URL);
  console.log('   Environment:', import.meta.env.MODE);
}

export default {
  API_URL,
  API_BASE_URL,
  buildApiEndpoint
};

