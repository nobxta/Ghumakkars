import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerificationPopup = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.isVerified || hasShownPopup) {
      return;
    }

    const handleScroll = () => {
      setScrollCount(prev => prev + 1);
      
      // Show popup randomly after scrolling (every 30-60 scrolls)
      if (scrollCount > 0 && scrollCount % Math.floor(Math.random() * 30 + 30) === 0) {
        setIsAnimating(true);
        setShowPopup(true);
        setHasShownPopup(true);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAuthenticated, user, scrollCount, hasShownPopup]);

  const handleVerifyNow = () => {
    setIsAnimating(false);
    setShowPopup(false);
    navigate('/profile/verification');
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setShowPopup(false);
    // Set a timeout to show again after some time
    setTimeout(() => {
      setHasShownPopup(false);
      setScrollCount(0);
    }, 60000); // 60 seconds
  };

  // Disabled - no verification required
  return null;
};

export default VerificationPopup;