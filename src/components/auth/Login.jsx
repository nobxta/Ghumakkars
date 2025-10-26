import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedEarth from '../AnimatedEarth';

const Login = ({ onSwitchToRegister, onSwitchToOTP, onSwitchToForgotPassword, onLoginSuccess }) => {
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    loginField: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.loginField.trim()) {
      errors.loginField = 'Email or phone number is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.loginField, formData.password);
    
    if (result.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleOTPLogin = () => {
    onSwitchToOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Earth Background */}
      <AnimatedEarth />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-purple-500/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", letterSpacing: '0.02em' }}>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Ghumakkars</span>
          </h1>
          <p className="text-gray-700 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Explore the world with us ✈️</p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email/Phone Input */}
            <div>
              <label htmlFor="loginField" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Email or Phone
              </label>
              <input
                id="loginField"
                name="loginField"
                type="text"
                required
                value={formData.loginField}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.loginField ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter email or phone number"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.loginField && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.loginField}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.password ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter your password"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.password}</p>
              )}
            </div>

            {/* Forgot Password and OTP Links */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleOTPLogin}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Sign in with OTP
              </button>
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-base text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
