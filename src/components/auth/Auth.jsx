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
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');

  // Get redirect URL and referral code from query parameters
  const redirectUrl = searchParams.get('redirect') || '/';
  const referralCode = searchParams.get('ref') || '';

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, user, navigate, redirectUrl]);

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
      {renderCurrentView()}
    </div>
  );
};

export default Auth;
