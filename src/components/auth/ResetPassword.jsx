import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

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

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await resetPassword(token, formData.password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Star Background */}
        <div className="section-banner">
          <div id="star-1">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-2">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-3">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-4">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-5">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-6">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>

          <div id="star-7">
            <div className="curved-corner-star">
              <div id="curved-corner-bottomright"></div>
              <div id="curved-corner-bottomleft"></div>
            </div>
            <div className="curved-corner-star">
              <div id="curved-corner-topright"></div>
              <div id="curved-corner-topleft"></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm relative z-10">
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
            <p className="text-gray-600 text-sm mt-1">Password reset successful</p>
          </div>

          {/* Success Card - Glassmorphism */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p className="text-xs text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Star Background */}
      <div className="section-banner">
        <div id="star-1">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-2">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-3">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-4">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-5">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-6">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-7">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Ghumakkars
          </h1>
          <p className="text-gray-600 text-sm mt-1">Reset your password</p>
          <p className="text-xs text-gray-500 mt-2">Enter your new password below</p>
        </div>

        {/* Auth Card - Glassmorphism */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;