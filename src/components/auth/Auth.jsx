import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Register from './Register';
import Login from './Login';
import OTPLogin from './OTPLogin';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loadUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Get redirect URL and referral code from query parameters
  const redirectUrl = searchParams.get('redirect') || '/';
  const referralCode = searchParams.get('ref') || '';

  // Manual authentication check - only when user clicks a button
  const handleCheckExistingAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const result = await loadUser();
      if (result.success) {
        navigate(redirectUrl);
      }
    }
    setHasCheckedAuth(true);
  };

  // Redirect if user is already authenticated (only after manual check)
  useEffect(() => {
    if (isAuthenticated && user && hasCheckedAuth) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, user, navigate, redirectUrl, hasCheckedAuth]);

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToOTP = (emailAddress) => {
    setEmail(emailAddress);
    setCurrentView('otp');
  };

  const handleSwitchToOTPLogin = () => {
    setCurrentView('otp-login');
  };

  const handleSwitchToForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleOTPSuccess = () => {
    // User is now authenticated, redirect to original destination or home
    navigate(redirectUrl);
  };

  const handleLoginSuccess = () => {
    // User is now authenticated, redirect to original destination or home
    navigate(redirectUrl);
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return (
          <Register
            onSwitchToLogin={handleSwitchToLogin}
            onSwitchToOTP={handleSwitchToOTP}
            referralCode={referralCode}
          />
        );
      case 'login':
        return (
          <Login
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToOTP={handleSwitchToOTPLogin}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'otp-login':
        return (
          <OTPLogin
            onBack={handleBackToLogin}
            onSwitchToOTP={handleSwitchToOTP}
          />
        );
      case 'otp':
        return (
          <OTPVerification
            email={email}
            type={currentView === 'otp' && email ? 'email_verification' : 'login'}
            onSuccess={handleOTPSuccess}
            onBack={handleBackToLogin}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={handleBackToLogin}
          />
        );
      default:
        return (
          <Login
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToOTP={handleSwitchToOTP}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
    }
  };

  return (
    <div>
      {/* Check Existing Authentication Button */}
      {!hasCheckedAuth && localStorage.getItem('token') && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleCheckExistingAuth}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Already have an account? Sign In'}
          </button>
        </div>
      )}
      
      {renderCurrentView()}
    </div>
  );
};

export default Auth;
