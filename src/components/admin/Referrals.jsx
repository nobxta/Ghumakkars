import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import referralService from '../../services/referralService';
import { Users, Gift, CheckCircle, Clock, TrendingUp, Search, Filter, RefreshCw } from 'lucide-react';

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewardsPaid: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await referralService.getAllReferrals();
      if (response.success) {
        setReferrals(response.data.referrals);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    return null;
  };

  // Filter and search referrals
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = 
      searchQuery === '' || 
      referral.referrer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referrer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referred?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referred?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referralCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || referral.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Referral Management</h1>
            <p className="text-slate-600 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Track and manage user referrals and rewards program.</p>
          </div>
          <button 
            onClick={loadReferrals}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Referrals</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalReferrals}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Successful</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.completedReferrals}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
              <Gift className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Rewards Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRewardsPaid)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Conversion</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.conversionRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-200"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({stats.totalReferrals})
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    filterStatus === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Completed ({stats.completedReferrals})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pending ({stats.pendingReferrals})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Referrals List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">All Referrals</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
                Showing {filteredReferrals.length} of {stats.totalReferrals} referrals
              </p>
            </div>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">No Referrals Found</h3>
            <p className="text-slate-600 text-sm sm:text-base">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Referrals will appear here once users start referring others'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden lg:table w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReferrals.map((referral, index) => (
                  <motion.tr
                    key={referral._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{referral.referrer?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{referral.referrer?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{referral.referred?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{referral.referred?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-mono font-semibold">
                        {referral.referralCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(referral.status)}`}>
                        {getStatusIcon(referral.status)}
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {formatCurrency(referral.rewardEarned || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(referral.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-200">
              {filteredReferrals.map((referral, index) => (
                <motion.div
                  key={referral._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Status and Date */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(referral.status)}`}>
                        {getStatusIcon(referral.status)}
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(referral.createdAt)}</span>
                    </div>

                    {/* Referrer */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Referrer</div>
                      <div className="text-sm font-medium text-slate-900">{referral.referrer?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{referral.referrer?.email || 'N/A'}</div>
                    </div>

                    {/* Referred User */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Referred User</div>
                      <div className="text-sm font-medium text-slate-900">{referral.referred?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{referral.referred?.email || 'N/A'}</div>
                    </div>

                    {/* Referral Code and Reward */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Referral Code</div>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono font-semibold">
                          {referral.referralCode}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Reward</div>
                        <div className="text-sm font-semibold text-slate-900">{formatCurrency(referral.rewardEarned || 0)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
