import { motion } from 'framer-motion';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const OverviewPanel = ({ user, stats }) => {
  const recentTrips = (user?.tripHistory || []).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-700">Total Trips</p>
          <p className="text-2xl font-bold text-indigo-900">{stats?.totalTrips || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-700">Total Spent</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats?.totalSpent)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm text-purple-700">Wallet Balance</p>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats?.walletBalance)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 border border-orange-100">
          <p className="text-sm text-orange-700">Referrals</p>
          <p className="text-2xl font-bold text-orange-900">{stats?.referrals || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Verification</h3>
          {stats?.isVerified ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              ✅ Verified Traveler
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Not Verified</span>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Complete Verification</a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Profile Details Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{user?.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">College</p>
              <p className="font-medium">{user?.collegeName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium">{user?.gender || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">DOB</p>
              <p className="font-medium">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
          {recentTrips.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="text-sm text-gray-800">
                    You booked <span className="font-semibold">{t.trip?.title || 'Trip'}</span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {formatCurrency(t.totalAmount)} • {t.bookingDate ? new Date(t.bookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/explore-trips" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold">Explore Trips</a>
        <a href="/profile#referrals" className="px-4 py-2 rounded-lg border border-purple-200 text-purple-700 text-sm font-semibold bg-purple-50">Refer & Earn</a>
      </div>
    </motion.div>
  );
};

export default OverviewPanel;


