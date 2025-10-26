import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Star
} from 'lucide-react';
import bookingService from '../../services/bookingService';

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          default:
            break;
        }
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      const response = await bookingService.getPaymentAnalytics(params);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', delay = 0, subtitle, isCompact = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105 ${
        isCompact ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
        <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-4'}`}>
          <div className={`${isCompact ? 'p-2' : 'p-3'} rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg`}>
            <Icon className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
          </div>
          <div className={isMobile ? 'text-right' : ''}>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-slate-600`}>{title}</p>
            <p className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-slate-800`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'} ${isMobile ? 'justify-end' : ''}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4 sm:mb-6"
                />
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-600 font-medium text-sm sm:text-base"
                >
                  Loading payment analytics...
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 p-6 sm:p-8">
            <div className="text-center py-12 sm:py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-400 mx-auto mb-4 sm:mb-6" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3"
              >
                Failed to Load Data
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base"
              >
                Unable to fetch payment analytics. Please try again.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleRefresh}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Retry
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { overview, dailyRevenue, topTrips, paymentStatusDistribution, bookingStatusDistribution, revenueByPaymentType } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 p-6 sm:p-8"
        >
          <div className={`${isMobile ? 'space-y-6' : 'flex items-center justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight"
              >
                Payment Analytics
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 mt-2 font-medium text-sm sm:text-base"
              >
                Real-time insights into your payment performance and revenue trends
              </motion.p>
            </div>
            <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-3'}`}>
              <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'flex items-center space-x-3'}`}>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
              <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Tabs */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-2"
          >
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'charts', label: 'Charts', icon: PieChartIcon },
                { id: 'trips', label: 'Trips', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        {(activeTab === 'overview' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(overview.totalRevenue)}
                icon={DollarSign}
                color="emerald"
                delay={0.1}
                isCompact={isMobile}
                subtitle="All time"
              />
              <StatCard
                title="Collected Amount"
                value={formatCurrency(overview.totalCollected)}
                icon={CheckCircle}
                color="blue"
                delay={0.2}
                isCompact={isMobile}
                subtitle="Verified payments"
              />
              <StatCard
                title="Total Bookings"
                value={formatNumber(overview.totalBookings)}
                icon={Users}
                color="purple"
                delay={0.3}
                isCompact={isMobile}
                subtitle="All bookings"
              />
              <StatCard
                title="Total Passengers"
                value={formatNumber(overview.totalPassengers)}
                icon={Users}
                color="teal"
                delay={0.4}
                isCompact={isMobile}
                subtitle="All passengers"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Verified Payments"
                value={formatNumber(overview.verifiedPayments)}
                icon={CheckCircle}
                color="emerald"
                delay={0.5}
                isCompact={isMobile}
                subtitle="Success rate"
              />
              <StatCard
                title="Pending Payments"
                value={formatNumber(overview.pendingPayments)}
                icon={Clock}
                color="amber"
                delay={0.6}
                isCompact={isMobile}
                subtitle="Awaiting verification"
              />
              <StatCard
                title="Rejected Payments"
                value={formatNumber(overview.rejectedPayments)}
                icon={XCircle}
                color="red"
                delay={0.7}
                isCompact={isMobile}
                subtitle="Failed payments"
              />
              <StatCard
                title="Discount Given"
                value={formatCurrency(overview.totalDiscountGiven)}
                icon={CreditCard}
                color="indigo"
                delay={0.8}
                isCompact={isMobile}
                subtitle="Total savings"
              />
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {(activeTab === 'charts' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
              >
                <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'} mb-4 sm:mb-6`}>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Revenue Trend</h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">Daily revenue over time</p>
                  </div>
                  <div className={`flex ${isMobile ? 'justify-center' : 'space-x-2'}`}>
                    <button
                      onClick={() => setSelectedChart('revenue')}
                      className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        selectedChart === 'revenue' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setSelectedChart('bookings')}
                      className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        selectedChart === 'bookings' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Bookings
                    </button>
                  </div>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyRevenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        stroke="#64748B"
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke="#64748B"
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                        formatter={(value, name) => [
                          name === 'verifiedRevenue' ? formatCurrency(value) : value,
                          name === 'verifiedRevenue' ? 'Verified Revenue' : 'Bookings'
                        ]}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedChart === 'revenue' ? 'verifiedRevenue' : 'bookings'}
                        stroke="#3B82F6"
                        strokeWidth={isMobile ? 2 : 3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Payment Status Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
              >
                <div className={`${isMobile ? 'text-center' : 'flex items-center justify-between'} mb-4 sm:mb-6`}>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Payment Status</h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">Distribution of payment statuses</p>
                  </div>
                  {!isMobile && <PieChartIcon className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 60 : 80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {paymentStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                        formatter={(value, name) => [value, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Top Performing Trips */}
        {(activeTab === 'trips' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden"
          >
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200/50">
              <div className={`${isMobile ? 'text-center' : 'flex items-center justify-between'}`}>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Top Performing Trips</h3>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">Trips with highest revenue generation</p>
                </div>
                {!isMobile && <BarChart3 className="w-5 h-5 text-slate-400" />}
              </div>
            </div>
            
            {isMobile ? (
              // Mobile Card Layout
              <div className="p-4 space-y-4">
                {topTrips.map((trip, index) => (
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/50"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{trip.tripTitle}</h4>
                        <p className="text-xs text-slate-500">{trip.startLocation} → {trip.endLocation}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Bookings</p>
                          <p className="text-sm font-semibold text-slate-800">{trip.bookings}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Passengers</p>
                          <p className="text-sm font-semibold text-slate-800">{trip.passengers}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Total Revenue</p>
                          <p className="text-sm font-semibold text-slate-800">{formatCurrency(trip.revenue)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Verified Revenue</p>
                          <p className="text-sm font-semibold text-emerald-600">{formatCurrency(trip.verifiedRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Desktop Table Layout
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/50">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Trip Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Passengers
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Verified Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-slate-200/50">
                    {topTrips.map((trip, index) => (
                      <motion.tr
                        key={trip._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800">{trip.tripTitle}</div>
                          <div className="text-sm text-slate-500">{trip.startLocation} → {trip.endLocation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800">{trip.bookings}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{trip.passengers}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800">{formatCurrency(trip.revenue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-emerald-600">{formatCurrency(trip.verifiedRevenue)}</div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {topTrips.length === 0 && (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">No Trip Data</h3>
                <p className="text-slate-600 text-sm sm:text-base">No trips found for the selected time period.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Payment Type Analysis */}
        {revenueByPaymentType && revenueByPaymentType.length > 0 && (activeTab === 'charts' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
          >
            <div className={`${isMobile ? 'text-center' : 'flex items-center justify-between'} mb-4 sm:mb-6`}>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Payment Type Analysis</h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">Revenue breakdown by payment type</p>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByPaymentType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(value) => value === 'full' ? 'Full Payment' : 'Seat Lock'}
                    stroke="#64748B"
                    fontSize={isMobile ? 10 : 12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#64748B"
                    fontSize={isMobile ? 10 : 12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name === 'verifiedAmount' ? 'Verified Amount' : 'Total Amount'
                    ]}
                  />
                  <Bar dataKey="verifiedAmount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalAmount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Payments;