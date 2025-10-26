import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Share2,
  Gift,
  Users,
  Wallet,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X,
  TrendingUp,
  Award,
  Calendar,
  UserPlus,
  Clock
} from 'lucide-react';
import referralService from '../services/referralService';

const ReferralDashboard = () => {
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    completedReferrals: 0,
    totalEarnings: 0,
    recentReferrals: []
  });
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsResponse, linkResponse] = await Promise.all([
        referralService.getReferralStats(),
        referralService.getReferralLink()
      ]);

      if (statsResponse.success && linkResponse.success) {
        setReferralData({
          ...statsResponse.data,
          referralLink: linkResponse.data.referralLink
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    const success = await referralService.copyToClipboard(referralData.referralCode);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    const success = await referralService.copyToClipboard(referralData.referralLink);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareReferralLink = (platform) => {
    referralService.shareReferralLink(platform, referralData.referralLink, referralData.referralCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={fetchReferralData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-xl text-gray-600">Earn ₹100 for every friend you refer!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Referrals</p>
                <p className="text-3xl font-bold">{referralData.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed Referrals</p>
                <p className="text-3xl font-bold">{referralData.completedReferrals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold">₹{referralData.totalEarnings}</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referral Code</h2>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-4">
              <p className="text-3xl font-mono font-bold text-gray-900 text-center">
                {referralData.referralCode}
              </p>
            </div>
            <button
              onClick={copyReferralCode}
              className="flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                Share this code with friends to earn ₹100 when they complete their first booking!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referral Link</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-4">
                <p className="text-sm text-gray-600 break-all">
                  {referralData.referralLink}
                </p>
              </div>
              <button
                onClick={copyReferralLink}
                className="flex items-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share on Social Media</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Referrals */}
        {referralData.recentReferrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Referrals</h2>
            
            <div className="space-y-4">
              {referralData.recentReferrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.referredUser?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {referral.referredUser?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      referral.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </>
                      )}
                    </div>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        +₹{referral.rewardAmount}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Share Your Referral</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => shareReferralLink('whatsapp')}
                    className="flex items-center justify-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => shareReferralLink('facebook')}
                    className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => shareReferralLink('twitter')}
                    className="flex items-center justify-center space-x-2 p-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => shareReferralLink('linkedin')}
                    className="flex items-center justify-center space-x-2 p-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={() => shareReferralLink('email')}
                    className="flex items-center justify-center space-x-2 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </button>
                  
                  <button
                    onClick={() => shareReferralLink('sms')}
                    className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>SMS</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReferralDashboard;
