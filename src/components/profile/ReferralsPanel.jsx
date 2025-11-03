import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';
import referralService from '../../services/referralService';
import { Gift, Users, TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const ReferralsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ 
    referralCode: '', 
    referrals: [], 
    totalEarnings: 0,
    totalReferrals: 0,
    completedReferrals: 0
  });
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadReferrals = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await userService.getReferrals();
      console.log('Referral data:', res);
      setData({
        referralCode: res?.data?.referralCode || res?.referralCode || '',
        referrals: res?.data?.referrals || res?.referrals || [],
        totalEarnings: res?.data?.totalEarnings || res?.totalEarnings || 0,
        totalReferrals: res?.data?.totalReferrals || res?.referrals?.length || 0,
        completedReferrals: res?.data?.completedReferrals || (res?.referrals || []).filter(r => r.status === 'completed').length || 0
      });
    } catch (e) {
      console.error('Error loading referrals:', e);
      setData({ referralCode: '', referrals: [], totalEarnings: 0, totalReferrals: 0, completedReferrals: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const copy = async () => {
    const ok = await referralService.copyToClipboard(data.referralCode);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const shareWhatsApp = () => {
    referralService.shareReferralLink('whatsapp', `${window.location.origin}/auth?ref=${data.referralCode}`, data.referralCode);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading referrals...</p>
      </div>
    );
  }

  const referralLink = data.referralCode ? `${window.location.origin}/auth?ref=${data.referralCode}` : '';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Referral Program</h2>
        <button
          onClick={() => loadReferrals(true)}
          disabled={refreshing}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-indigo-700 font-medium mb-1">Your Code</p>
          <p className="text-xl font-bold text-indigo-900 font-mono">{data.referralCode || 'Not Generated'}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-emerald-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-700 font-medium mb-1">Total Earnings</p>
          <p className="text-2xl font-extrabold text-emerald-900">{formatCurrency(data.totalEarnings)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-orange-700 font-medium mb-1">Total Referrals</p>
          <p className="text-2xl font-extrabold text-orange-900">{data.totalReferrals || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-700 font-medium mb-1">Completed</p>
          <p className="text-2xl font-extrabold text-blue-900">{data.completedReferrals || 0}</p>
        </div>
      </div>

      {/* Referral Link Section */}
      {data.referralCode && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Share Your Referral Code
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 overflow-x-auto">
                <p className="text-sm text-gray-600 font-mono break-all">{referralLink}</p>
              </div>
              <button 
                onClick={copy} 
                className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={shareWhatsApp} 
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-600" />
          How It Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p className="text-sm text-gray-700 pt-0.5">Share your referral code or link with friends</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <p className="text-sm text-gray-700 pt-0.5">They register using your code and get ₹100 off their first booking</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <p className="text-sm text-gray-700 pt-0.5 font-semibold">When their first booking is confirmed, you both get ₹100 in your wallet!</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-200 shadow-xl">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Referral History
        </h3>
        {data.referrals?.length ? (
          <div className="space-y-3">
            {data.referrals.map((r) => {
              // Handle both new and old data structures
              const referredName = r.referred?.name || r.user?.name || 'Friend';
              const referredEmail = r.referred?.email || r.user?.email || '';
              const profilePicture = r.referred?.profilePicture || r.user?.profilePicture || null;
              const referredOn = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : r.date ? new Date(r.date).toLocaleDateString('en-IN') : '-';
              const bookedFirst = r.status === 'completed';
              const earned = r.rewardEarned || (bookedFirst ? 100 : 0);
              const completedAt = r.firstBookingCompletedAt ? new Date(r.firstBookingCompletedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : null;

              return (
                <motion.div 
                  key={r.id || r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border-2 bg-gradient-to-r transition-all hover:shadow-lg"
                  style={{
                    background: bookedFirst 
                      ? 'linear-gradient(to right, #ecfdf5, #f0fdf4)' 
                      : 'linear-gradient(to right, #fafafa, #f9fafb)',
                    borderColor: bookedFirst ? '#86efac' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {profilePicture ? (
                          <img 
                            src={profilePicture} 
                            alt={referredName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {referredName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{referredName}</p>
                          {bookedFirst && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{referredEmail}</p>
                        <p className="text-xs text-gray-500">Referred on {referredOn}</p>
                        {completedAt && (
                          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            First booking completed on {completedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Status and Earnings */}
                    <div className="text-right flex-shrink-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        bookedFirst 
                          ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                      }`}>
                        {bookedFirst ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        )}
                      </div>
                      {bookedFirst && (
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-green-700">{formatCurrency(earned)}</p>
                          <p className="text-xs text-gray-500">Reward Earned</p>
                        </div>
                      )}
                      {!bookedFirst && (
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-gray-400">{formatCurrency(0)}</p>
                          <p className="text-xs text-gray-400">Awaiting booking</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No Referrals Yet</h4>
            <p className="text-gray-600 text-sm mb-4">Share your referral code to invite friends and earn rewards!</p>
            {data.referralCode && (
              <button
                onClick={() => referralService.shareReferralLink('whatsapp', referralLink, data.referralCode)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share on WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReferralsPanel;


