import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedEarth from '../AnimatedEarth';

const Register = ({ onSwitchToLogin, onSwitchToOTP, referralCode = '' }) => {
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

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

    // If profile picture is provided, create FormData
    let submitData = formData;
    if (profilePicture) {
      const formDataWithFile = new FormData();
      formDataWithFile.append('profilePicture', profilePicture);
      Object.keys(formData).forEach(key => {
        formDataWithFile.append(key, formData[key]);
      });
      submitData = formDataWithFile;
    }

    const result = await register(submitData, !!profilePicture);
    
    if (result.success) {
      onSwitchToOTP(formData.email);
    }
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
          <p className="text-gray-700 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Join us on your next adventure 🌍</p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Profile Picture Upload (Optional) */}
            <div className="flex flex-col items-center py-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                Profile Picture <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                {profilePicturePreview ? (
                  <div className="relative group">
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-4 border-dashed border-purple-300">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="mt-3 cursor-pointer">
                <span className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-xs border border-purple-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1.5 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>JPG, PNG or GIF (Max 5MB)</p>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.name ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter your full name"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.name}</p>
              )}
            </div>

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
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.email ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter your email"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.phone ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Enter your phone number"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.phone && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.phone}</p>
              )}
            </div>

            {/* Referral Code Input (Optional) */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Referral Code <span className="text-gray-500 text-xs">(Optional)</span>
                {referralCode && <span className="text-green-600 text-xs ml-2">✓ Pre-filled from link</span>}
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={handleChange}
                readOnly={!!referralCode}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 border-purple-200 ${referralCode ? 'bg-green-50 border-green-300' : ''}`}
                placeholder="Enter referral code (if any)"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <p className="mt-1 text-xs text-gray-500">
                {referralCode 
                  ? `You're using referral code ${referralCode}! Get ₹100 off your first booking! 🎉`
                  : "Get ₹100 off your first booking when you use a referral code!"
                }
              </p>
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

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  validationErrors.confirmPassword ? 'border-red-400' : 'border-purple-200'
                }`}
                placeholder="Confirm your password"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-300">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-base text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
