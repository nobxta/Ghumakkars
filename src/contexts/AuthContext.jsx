import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Set up axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Manual user loading - only when explicitly called
  const loadUser = async () => {
    if (state.token) {
      try {
        const response = await axios.get('/api/user/profile');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: state.token
          }
        });
        return { success: true, user: response.data.user };
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Only logout if it's an authentication error (401, 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        } else {
          // For other errors, keep user logged in but show error
          console.warn('Profile load failed, but keeping user logged in');
        }
        return { success: false, error: error.message };
      }
    } else {
      dispatch({ type: 'LOGOUT' });
      return { success: false, error: 'No token available' };
    }
  };

  // Initialize loading state without automatic authentication
  useEffect(() => {
    dispatch({ type: 'AUTH_START' });
    // Set loading to false after a brief delay to show the auth page
    const timer = setTimeout(() => {
      dispatch({ type: 'LOGOUT' }); // This sets loading to false
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Register user
  const register = async (userData, isFormData = false) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};
      
      const response = await axios.post('/api/auth/register', userData, config);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Verify email OTP
  const verifyEmail = async (email, otp) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/verify-email', { email, otp });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Login with password
  const login = async (loginField, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login', { loginField, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Login with OTP
  const loginWithOTP = async (email) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login-otp', { email });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Verify login OTP
  const verifyLoginOTP = async (email, otp) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/verify-login-otp', { email, otp });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP
  const resendOTP = async (email, type) => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { email, type });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      return { success: false, error: errorMessage };
    }
  };

  // Check if user exists
  const checkUserExists = async (loginField) => {
    try {
      const response = await axios.post('/api/auth/check-user', { loginField });
      return { 
        success: true, 
        userExists: response.data.userExists,
        user: response.data.user 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to check user';
      return { success: false, error: errorMessage };
    }
  };

  // Send OTP
  const sendOTP = async (email, type) => {
    try {
      const response = await axios.post('/api/auth/send-otp', { email, type });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { 
        token, 
        password, 
        confirmPassword 
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh user data
  const refreshUser = async () => {
    if (state.token) {
      try {
        console.log('Refreshing user data...');
        const response = await axios.get('/api/user/profile');
        console.log('User data received:', response.data.user);
        console.log('Is verified:', response.data.user.isVerified);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: state.token
          }
        });
        return { success: true, user: response.data.user };
      } catch (error) {
        console.error('Failed to refresh user:', error);
        // Only logout if it's an authentication error
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No token available' };
  };

  const value = {
    ...state,
    register,
    verifyEmail,
    login,
    loginWithOTP,
    verifyLoginOTP,
    resendOTP,
    checkUserExists,
    sendOTP,
    forgotPassword,
    resetPassword,
    logout,
    clearError,
    refreshUser,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
