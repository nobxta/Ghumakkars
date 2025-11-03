import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';
import { Wallet, TrendingUp, TrendingDown, Gift, ShoppingCart, Award, RefreshCw, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Today - show time
    return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    // Yesterday
    return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    // This week
    return `${diffDays} days ago at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    // Older - show full date
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const WalletPanel = () => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await userService.getWallet();
      // Sort transactions by date (most recent first)
      const sortedTransactions = (res?.transactions || []).sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA;
      });
      setWallet({ 
        balance: res?.balance || 0, 
        transactions: sortedTransactions 
      });
    } catch (error) {
      console.error('Error loading wallet:', error);
      setWallet({ balance: 0, transactions: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const getTransactionIcon = (type, amount) => {
    const isCredit = amount >= 0;
    
    if (isCredit) {
      switch (type?.toLowerCase()) {
        case 'referral_reward':
        case 'referral':
          return <Gift className="w-5 h-5 text-green-600" />;
        case 'refund':
          return <RefreshCw className="w-5 h-5 text-blue-600" />;
        case 'reward':
        case 'bonus':
          return <Award className="w-5 h-5 text-yellow-600" />;
        default:
          return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      }
    } else {
      switch (type?.toLowerCase()) {
        case 'booking':
        case 'payment':
        case 'trip_payment':
          return <ShoppingCart className="w-5 h-5 text-red-600" />;
        default:
          return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
      }
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'referral_reward':
      case 'referral':
        return 'Referral Reward';
      case 'trip_payment':
        return 'Trip Payment';
      case 'booking':
      case 'payment':
        return 'Booking Payment';
      case 'refund':
        return 'Refund';
      case 'reward':
      case 'bonus':
        return 'Bonus';
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (amount) => {
    return amount >= 0 ? 'text-emerald-700' : 'text-red-700';
  };

  const getTransactionBg = (amount) => {
    return amount >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
  };

  // Calculate total earned and spent
  const totalEarned = wallet.transactions
    .filter(tx => (tx.amount || 0) > 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  const totalSpent = wallet.transactions
    .filter(tx => (tx.amount || 0) < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Balance Card */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Ghumakkars Wallet</span>
            </div>
            <button
              onClick={() => loadWallet(true)}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="mb-2">
            <p className="text-sm opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl sm:text-5xl font-extrabold">{formatCurrency(wallet.balance)}</p>
            <p className="text-xs opacity-70 mt-1">
              Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="opacity-80">Earned: {formatCurrency(totalEarned)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingDown className="w-4 h-4" />
              <span className="opacity-80">Spent: {formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to Earn Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          How to Earn Wallet Money
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <p><strong>Refer Friends:</strong> Earn ₹100 when your friend completes their first booking</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <p><strong>Sign Up Bonus:</strong> Get ₹100 off on your first booking when using a referral code</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <p><strong>Special Rewards:</strong> Earn bonus money during promotional events</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <p><strong>Use Wallet Money:</strong> Apply your balance while booking to get instant discounts!</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Transaction History
        </h3>
        
        {wallet.transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">No Transactions Yet</h4>
            <p className="text-gray-600 text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx, idx) => {
              const amount = tx.amount || 0;
              const isCredit = amount >= 0;
              const txDate = tx.date || tx.createdAt || new Date();
              
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${getTransactionBg(amount)} transition-all hover:shadow-lg cursor-default`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                          {getTransactionIcon(tx.type, amount)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {tx.description || getTransactionTypeLabel(tx.type) || 'Transaction'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isCredit 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isCredit ? 'Credit' : 'Debit'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDateTime(txDate)}
                        </p>
                        {tx.tripId && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Trip Related
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        {isCredit ? (
                          <ArrowUpCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        )}
                        <p className={`font-bold text-base sm:text-lg ${getTransactionColor(amount)}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WalletPanel;


