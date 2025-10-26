import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerificationCheck = ({ children, redirectTo = '/profile/verification', showMessage = true }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  // If user is not verified, show verification required message or redirect
  if (!user?.isVerified) {
    if (showMessage) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8 max-w-lg w-full text-center animate-fade-in-up">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Verification Required</h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              You need to verify your account before you can book trips. This helps us ensure safe and secure travel experiences for everyone.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Secure Bookings</p>
                  <p className="text-slate-600 text-sm">Verified identity for safe travel</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Priority Access</p>
                  <p className="text-slate-600 text-sm">Early access to new trips & offers</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Earn Rewards</p>
                  <p className="text-slate-600 text-sm">₹100 for every successful referral</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate(redirectTo)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Verification</span>
            </button>
            
            <p className="text-sm text-slate-500 mt-4">Quick 2-3 minute process</p>
          </div>
        </div>
      );
    } else {
      navigate(redirectTo);
      return null;
    }
  }

  return children;
};

export default VerificationCheck;