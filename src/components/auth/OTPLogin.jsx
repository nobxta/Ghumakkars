import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedEarth from '../AnimatedEarth';

const OTPLogin = ({ onBack, onSwitchToOTP }) => {
  const { checkUserExists, sendOTP, verifyLoginOTP, loading, error, clearError } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: OTP verification
  const [formData, setFormData] = useState({
    loginField: '',
    otp: ['', '', '', '', '', '']
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [userInfo, setUserInfo] = useState(null);

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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...formData.otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
  };

  const validateLoginField = () => {
    if (!formData.loginField.trim()) {
      setValidationErrors({ loginField: 'Email or phone number is required' });
      return false;
    }
    
    // Check if it's an email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginField);
    const isPhone = /^[\+]?[1-9][\d]{0,15}$/.test(formData.loginField.replace(/\s/g, ''));
    
    if (!isEmail && !isPhone) {
      setValidationErrors({ loginField: 'Please enter a valid email or phone number' });
      return false;
    }
    
    return true;
  };

  const handleCheckUser = async (e) => {
    e.preventDefault();
    
    if (!validateLoginField()) {
      return;
    }

    const result = await checkUserExists(formData.loginField);
    
    if (result.success) {
      if (result.userExists) {
        setUserInfo(result.user);
        // Send OTP to the registered email
        const otpResult = await sendOTP(result.user.email, 'login');
        if (otpResult.success) {
          setStep(2);
        }
      } else {
        setValidationErrors({ 
          loginField: 'No account found with this email or phone number. Please sign up first.' 
        });
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = formData.otp.join('');
    if (otpString.length !== 6) {
      setValidationErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    const result = await verifyLoginOTP(formData.loginField, otpString);
    
    if (result.success) {
      // Login successful, user will be redirected by AuthContext
    }
  };

  const handleResendOTP = async () => {
    if (userInfo) {
      await sendOTP(userInfo.email, 'login');
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Earth Background */}
        <AnimatedEarth />

        <div className="w-full max-w-md relative z-10">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", letterSpacing: '0.02em' }}>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Ghumakkars</span>
            </h1>
            <p className="text-gray-700 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Sign in with OTP</p>
          </div>

          {/* Auth Card - Enhanced Glassmorphism */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
            <form className="space-y-4" onSubmit={handleCheckUser}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email/Phone Input */}
              <div>
                <label htmlFor="loginField" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Email or Phone Number
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
                  placeholder="Enter your email or phone number"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {validationErrors.loginField && (
                  <p className="mt-2 text-sm text-red-300">{validationErrors.loginField}</p>
                )}
              </div>

              {/* Check User Button */}
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
                      Checking...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
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
  }

  // Step 2: OTP Verification
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Earth Background */}
      <AnimatedEarth />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-purple-500/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", letterSpacing: '0.02em' }}>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Ghumakkars</span>
          </h1>
          <p className="text-gray-700 text-base mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Verify OTP</p>
          <p className="text-sm text-gray-600">
            Code sent to <span className="font-medium text-purple-600">{userInfo?.email}</span>
          </p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleVerifyOTP}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center space-x-3">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      validationErrors.otp ? 'border-red-400' : 'border-purple-200'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                ))}
              </div>
              {validationErrors.otp && (
                <p className="mt-2 text-sm text-red-300 text-center">{validationErrors.otp}</p>
              )}
            </div>

            {/* Verify Button */}
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
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Didn't receive code? Resend OTP
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-base text-purple-600 hover:text-purple-700 transition-colors font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ← Back to Email/Phone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
