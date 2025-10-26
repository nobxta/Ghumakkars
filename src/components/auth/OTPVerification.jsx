import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedEarth from '../AnimatedEarth';

const OTPVerification = ({ email, type = 'email_verification', onSuccess, onBack }) => {
  const { verifyEmail, verifyLoginOTP, resendOTP, loading, error, clearError } = useAuth();
  
  // Debug logging
  console.log('OTPVerification props:', { email, type, loading, error });
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the last filled input or the first empty one
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    const nextInput = document.getElementById(`otp-${lastFilledIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    console.log('OTP Verification - handleSubmit:', { otpString, email, type, loading });
    
    if (otpString.length !== 6) {
      console.log('OTP length not 6:', otpString.length);
      return;
    }

    setLocalLoading(true);
    try {
      let result;
      if (type === 'login') {
        console.log('Calling verifyLoginOTP');
        result = await verifyLoginOTP(email, otpString);
      } else {
        console.log('Calling verifyEmail');
        result = await verifyEmail(email, otpString);
      }
      
      console.log('Verification result:', result);
      
      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await resendOTP(email, type);
      setResendCooldown(60); // 1 minute cooldown
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'email_verification':
        return 'Verify your email';
      case 'login':
        return 'Enter login code';
      case 'password_reset':
        return 'Verify reset code';
      default:
        return 'Enter verification code';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'email_verification':
        return 'Please enter the 6-digit code sent to your email.';
      case 'login':
        return 'Please enter the 6-digit code sent to your email.';
      case 'password_reset':
        return 'Please enter the 6-digit code sent to your email.';
      default:
        return 'Please enter the 6-digit code sent to your email.';
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
          <p className="text-gray-700 text-base mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{getTitle()}</p>
          <p className="text-sm text-gray-600">
            Code sent to <span className="font-medium text-purple-600">{email}</span>
          </p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(124, 58, 237, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={localLoading || otp.join('').length !== 6}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {localLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading || resendCooldown > 0}
                  className="font-medium text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendLoading ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </p>
            </div>

            {/* Back Button */}
            {onBack && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs text-gray-600 hover:text-gray-500 transition-colors"
                >
                  ← Back to previous step
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;