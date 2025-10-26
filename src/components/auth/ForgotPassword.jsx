import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedEarth from '../AnimatedEarth';

const ForgotPassword = ({ onBack }) => {
  const { forgotPassword, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Earth Background */}
        <AnimatedEarth />

        <div className="w-full max-w-md relative z-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Ghumakkars
            </h1>
            <p className="text-gray-600 text-sm mt-1">Check your email</p>
          </div>

          {/* Success Card - Glassmorphism */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to <span className="font-medium text-purple-600">{email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Please check your email and click the link to reset your password.
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-700 text-base mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Reset your password</p>
          <p className="text-sm text-gray-600">Enter your email to get reset link</p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationError ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter your email address"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationError && (
                <p className="mt-1 text-xs text-red-600">{validationError}</p>
              )}
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending reset link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-base text-purple-600 hover:text-purple-700 transition-colors font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;