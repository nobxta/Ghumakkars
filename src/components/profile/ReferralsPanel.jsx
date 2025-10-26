import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';
import referralService from '../../services/referralService';

const ReferralsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ referralCode: '', referrals: [], totalEarnings: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getReferrals();
        setData({
          referralCode: res?.referralCode || '',
          referrals: res?.referrals || [],
          totalEarnings: res?.totalEarnings || 0
        });
      } catch (e) {
        console.error('Error loading referrals:', e);
        setData({ referralCode: '', referrals: [], totalEarnings: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copy = async () => {
    const ok = await referralService.copyToClipboard(data.referralCode);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const shareWhatsApp = () => {
    referralService.shareReferralLink('whatsapp', `${window.location.origin}/auth?ref=${data.referralCode}`, data.referralCode);
  };

  if (loading) return <div className="text-gray-600">Loading referrals...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Referrals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-700">Referral Code</p>
          <p className="text-xl font-bold text-indigo-900 font-mono">{data.referralCode || '-'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-700">Total Earnings</p>
          <p className="text-2xl font-bold text-emerald-900">₹{data.totalEarnings || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 border border-orange-100">
          <p className="text-sm text-orange-700">Total Referrals</p>
          <p className="text-2xl font-bold text-orange-900">{data.referrals?.length || 0}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={copy} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">{copied ? 'Copied!' : 'Copy Code'}</button>
        <button onClick={shareWhatsApp} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold">Share on WhatsApp</button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Referral History</h3>
        {data.referrals?.length ? (
          <div className="divide-y divide-gray-100">
            {data.referrals.map((r) => {
              // Handle both new and old data structures
              const referredName = r.referred?.name || r.user?.name || 'Friend';
              const referredEmail = r.referred?.email || r.user?.email || '';
              const profilePicture = r.referred?.profilePicture || r.user?.profilePicture || null;
              const referredOn = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 
                                r.date ? new Date(r.date).toLocaleDateString('en-IN') : '-';
              const bookedFirst = r.status === 'completed';
              const earned = r.rewardEarned || r.rewardEarned || 0;

              return (
                <div key={r.id || r._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt={referredName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {referredName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{referredName}</div>
                      <div className="text-sm text-gray-500 truncate">{referredEmail}</div>
                      <div className="text-xs text-gray-400">Referred on {referredOn}</div>
                    </div>
                  </div>
                  
                  {/* Status and Earnings */}
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                      bookedFirst 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {bookedFirst ? 'First booking completed' : 'Pending first booking'}
                    </div>
                    <div className="font-semibold text-gray-900">₹{earned}</div>
                    <div className="text-xs text-gray-500">Earned</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
            <div className="text-gray-400 mb-2">📧</div>
            <div>No referrals yet.</div>
            <div className="text-sm mt-1">Share your referral code to invite friends!</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReferralsPanel;


