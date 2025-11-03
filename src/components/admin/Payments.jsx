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
  Star,
  Search,
  MapPin
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
  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');

  useEffect(() => {
    fetchAnalytics();
    fetchAllBookings();
  }, [dateRange]);

  const fetchAllBookings = async () => {
    try {
      const response = await bookingService.getAllBookings({ status: statusFilter !== 'all' ? statusFilter : '', paymentType: paymentTypeFilter !== 'all' ? paymentTypeFilter : '', search: searchTerm });
      setAllBookings(response.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [statusFilter, paymentTypeFilter, searchTerm]);

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

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', delay = 0, subtitle, isCompact = false, tooltip }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105 ${
        isCompact ? 'p-4' : 'p-6'
      }`}
      title={tooltip}
    >
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
        <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-4'}`}>
          <div className={`${isCompact ? 'p-2' : 'p-3'} rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg`}>
            <Icon className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
          </div>
          <div className={isMobile ? 'text-right' : ''}>
            <div className="flex items-center space-x-1">
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-slate-600`}>{title}</p>
              {tooltip && (
                <div className="group relative">
                  <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-slate-400 cursor-help transition-colors"></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              )}
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-3 mb-2"
              >
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Payment Analytics
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 font-medium text-lg"
              >
                Monitor revenue, track payments, and manage booking transactions
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4 mt-3"
              >
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Verified: {formatCurrency(overview.totalCollected)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Pending: {formatCurrency(overview.totalRevenue - overview.totalCollected)}</span>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border-0 focus:ring-0 bg-transparent font-medium text-sm text-slate-700"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-semibold flex items-center space-x-2 border border-slate-300 hover:shadow-sm"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
                title="Export payment data"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </motion.div>

          {/* Enhanced Mobile Navigation */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2"
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { 
                  id: 'overview', 
                  label: 'Summary', 
                  icon: BarChart3, 
                  description: 'Key metrics & stats',
                  color: 'blue'
                },
                { 
                  id: 'charts', 
                  label: 'Analytics', 
                  icon: PieChartIcon, 
                  description: 'Charts & trends',
                  color: 'purple'
                },
                { 
                  id: 'trips', 
                  label: 'Top Trips', 
                  icon: Star, 
                  description: 'Best performers',
                  color: 'amber'
                },
                { 
                  id: 'bookings', 
                  label: 'Transactions', 
                  icon: CreditCard, 
                  description: 'All bookings',
                  color: 'emerald'
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-200 touch-manipulation ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg scale-105`
                      : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                  title={tab.description}
                >
                  <tab.icon className={`w-6 h-6 mb-2 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                  <span className={`text-sm font-semibold text-center leading-tight ${activeTab === tab.id ? 'text-white' : 'text-slate-700'}`}>
                    {tab.label}
                  </span>
                  <span className={`text-xs mt-1 ${activeTab === tab.id ? 'text-white/80' : 'text-slate-500'}`}>
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h2 className="text-lg font-semibold text-slate-800">Dashboard Sections</h2>
                <div className="flex space-x-1">
                  {[
                    { 
                      id: 'overview', 
                      label: 'Summary', 
                      icon: BarChart3, 
                      description: 'Key metrics and statistics' 
                    },
                    { 
                      id: 'charts', 
                      label: 'Analytics', 
                      icon: PieChartIcon, 
                      description: 'Charts and trends' 
                    },
                    { 
                      id: 'trips', 
                      label: 'Top Trips', 
                      icon: Star, 
                      description: 'Best performing trips' 
                    },
                    { 
                      id: 'bookings', 
                      label: 'Transactions', 
                      icon: CreditCard, 
                      description: 'All booking transactions' 
                    }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                      title={tab.description}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Showing data for: <span className="font-medium text-slate-700">
                  {dateRange === '7d' ? 'Last 7 days' : 
                   dateRange === '30d' ? 'Last 30 days' : 
                   dateRange === '90d' ? 'Last 90 days' : 'All time'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Key Metrics */}
        {(activeTab === 'overview' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Primary Revenue Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Revenue Overview</h3>
                  <p className="text-slate-600 text-sm mt-1">Financial performance summary</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Activity className="w-4 h-4" />
                  <span>Live data</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(overview.totalRevenue)}
                  icon={DollarSign}
                  color="emerald"
                  delay={0.1}
                  isCompact={isMobile}
                  subtitle="All bookings"
                  tooltip="Total amount expected from all bookings, including both verified and pending payments"
                />
                <StatCard
                  title="Verified Revenue"
                  value={formatCurrency(overview.totalCollected)}
                  icon={CheckCircle}
                  color="blue"
                  delay={0.2}
                  isCompact={isMobile}
                  subtitle="Confirmed payments"
                  tooltip="Amount actually collected and verified from completed payments"
                />
                <StatCard
                  title="Pending Revenue"
                  value={formatCurrency(overview.totalRevenue - overview.totalCollected)}
                  icon={Clock}
                  color="amber"
                  delay={0.3}
                  isCompact={isMobile}
                  subtitle="Awaiting verification"
                  tooltip="Amount still pending verification or collection from customers"
                />
                <StatCard
                  title="Success Rate"
                  value={`${((overview.totalCollected / overview.totalRevenue) * 100).toFixed(1)}%`}
                  icon={Target}
                  color="purple"
                  delay={0.4}
                  isCompact={isMobile}
                  subtitle="Payment completion"
                  tooltip="Percentage of total revenue that has been successfully collected and verified"
                />
              </div>
            </div>

            {/* Booking & Passenger Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Booking Statistics</h3>
                  <p className="text-slate-600 text-sm mt-1">Customer engagement metrics</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>Customer data</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Total Bookings"
                  value={formatNumber(overview.totalBookings)}
                  icon={CreditCard}
                  color="indigo"
                  delay={0.5}
                  isCompact={isMobile}
                  subtitle="All transactions"
                  tooltip="Total number of booking transactions made by customers"
                />
                <StatCard
                  title="Total Passengers"
                  value={formatNumber(overview.totalPassengers)}
                  icon={Users}
                  color="teal"
                  delay={0.6}
                  isCompact={isMobile}
                  subtitle="All travelers"
                  tooltip="Total number of passengers across all bookings"
                />
                <StatCard
                  title="Verified Payments"
                  value={formatNumber(overview.verifiedPayments)}
                  icon={CheckCircle}
                  color="emerald"
                  delay={0.7}
                  isCompact={isMobile}
                  subtitle="Successful transactions"
                  tooltip="Number of payments that have been successfully verified and collected"
                />
                <StatCard
                  title="Pending Payments"
                  value={formatNumber(overview.pendingPayments)}
                  icon={Clock}
                  color="amber"
                  delay={0.8}
                  isCompact={isMobile}
                  subtitle="Awaiting confirmation"
                  tooltip="Number of payments still waiting for verification or collection"
                />
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Payment Status</h3>
                  <p className="text-slate-600 text-sm mt-1">Transaction status breakdown</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Zap className="w-4 h-4" />
                  <span>Status tracking</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Successful"
                  value={formatNumber(overview.verifiedPayments)}
                  icon={CheckCircle}
                  color="emerald"
                  delay={0.9}
                  isCompact={isMobile}
                  subtitle="Verified payments"
                  tooltip="Payments that have been successfully processed and verified"
                />
                <StatCard
                  title="Pending"
                  value={formatNumber(overview.pendingPayments)}
                  icon={Clock}
                  color="amber"
                  delay={1.0}
                  isCompact={isMobile}
                  subtitle="Awaiting verification"
                  tooltip="Payments that are still being processed or waiting for customer action"
                />
                <StatCard
                  title="Failed"
                  value={formatNumber(overview.rejectedPayments)}
                  icon={XCircle}
                  color="red"
                  delay={1.1}
                  isCompact={isMobile}
                  subtitle="Rejected payments"
                  tooltip="Payments that were declined, failed, or cancelled"
                />
                <StatCard
                  title="Discounts Given"
                  value={formatCurrency(overview.totalDiscountGiven)}
                  icon={CreditCard}
                  color="purple"
                  delay={1.2}
                  isCompact={isMobile}
                  subtitle="Customer savings"
                  tooltip="Total amount of discounts and savings provided to customers"
                />
              </div>
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
            {/* Revenue Trend Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Revenue Trend Analysis</h3>
                  <p className="text-slate-600 text-sm mt-1">Track daily revenue patterns and booking trends over time</p>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-500">Performance</span>
                </div>
              </div>
              
              <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'} mb-4`}>
                <div className={`flex ${isMobile ? 'space-x-2 justify-center' : 'space-x-2'}`}>
                  <button
                    onClick={() => setSelectedChart('revenue')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                      selectedChart === 'revenue' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedChart('bookings')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                      selectedChart === 'bookings' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Bookings
                  </button>
                </div>
                {!isMobile && (
                  <div className="text-sm text-slate-500">
                    {selectedChart === 'revenue' ? 'Daily revenue in ₹' : 'Daily booking count'}
                  </div>
                )}
                {isMobile && (
                  <div className="text-center text-sm text-slate-500">
                    {selectedChart === 'revenue' ? 'Daily revenue in ₹' : 'Daily booking count'}
                  </div>
                )}
              </div>
              
              <div className="h-80">
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
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => selectedChart === 'revenue' ? formatCurrency(value) : value}
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => [
                        selectedChart === 'revenue' ? formatCurrency(value) : value,
                        selectedChart === 'revenue' ? 'Verified Revenue' : 'Bookings'
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
                      strokeWidth={3}
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
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Payment Status Distribution</h3>
                  <p className="text-slate-600 text-sm mt-1">Visual breakdown of payment statuses across all transactions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-500">Status overview</span>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => [value, 'Transactions']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
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
                        <p className="text-xs text-slate-500">{trip.startLocation} to {trip.endLocation}</p>
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
                          <div className="text-sm text-slate-500">{trip.startLocation} to {trip.endLocation}</div>
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

            {/* Payment Method Analysis */}
            {revenueByPaymentType && revenueByPaymentType.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Payment Method Analysis</h3>
                    <p className="text-slate-600 text-sm mt-1">Revenue breakdown by payment type (Full Payment vs Seat Lock)</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-slate-500">Method comparison</span>
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByPaymentType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="_id" 
                        tickFormatter={(value) => value === 'full' ? 'Full Payment' : 'Seat Lock'}
                        stroke="#64748B"
                        fontSize={12}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke="#64748B"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px'
                        }}
                        formatter={(value, name) => [
                          formatCurrency(value),
                          name === 'verifiedAmount' ? 'Verified Amount' : 'Total Amount'
                        ]}
                      />
                      <Legend 
                        formatter={(value) => <span className="text-slate-700 font-medium">{value === 'verifiedAmount' ? 'Verified Revenue' : 'Total Revenue'}</span>}
                      />
                      <Bar dataKey="verifiedAmount" fill="#10B981" radius={[4, 4, 0, 0]} name="verifiedAmount" />
                      <Bar dataKey="totalAmount" fill="#3B82F6" radius={[4, 4, 0, 0]} name="totalAmount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

        {/* Enhanced Bookings Management */}
        {(activeTab === 'bookings' || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Transaction Management</h3>
                  <p className="text-slate-600 text-sm font-medium mt-1">View, filter, and manage all booking payments and transactions</p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Verified: {formatNumber(overview.verifiedPayments)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Pending: {formatNumber(overview.pendingPayments)}</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Filters */}
              <div className={`${isMobile ? 'space-y-4' : 'flex items-center space-x-4'} flex-wrap gap-4`}>
                <div className={`relative ${isMobile ? 'w-full' : 'flex-1 min-w-64'}`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isMobile ? "Search bookings..." : "Search by customer name, trip, or booking ID..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white touch-manipulation ${isMobile ? 'text-base' : ''}`}
                  />
                </div>
                <div className={`flex items-center ${isMobile ? 'w-full justify-between space-x-2' : 'space-x-3'}`}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white touch-manipulation ${isMobile ? 'flex-1 text-base' : 'min-w-32'}`}
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                  <select
                    value={paymentTypeFilter}
                    onChange={(e) => setPaymentTypeFilter(e.target.value)}
                    className={`px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white touch-manipulation ${isMobile ? 'flex-1 text-base' : 'min-w-32'}`}
                  >
                    <option value="all">All Types</option>
                    <option value="full">Full Payment</option>
                    <option value="seat_lock">Seat Lock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Customer & Trip</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Expected</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Collected</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Due</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {allBookings && allBookings.length > 0 ? allBookings.map((booking) => {
                    const expectedAmount = booking.payment?.amount || 0;
                    const collectedAmount = booking.payment?.paymentType === 'seat_lock' 
                      ? (booking.payment?.seatLockAmount || 0)
                      : (booking.payment?.paidAmount || booking.payment?.amount || 0);
                    const dueAmount = booking.payment?.paymentType === 'seat_lock' 
                      ? (booking.payment?.remainingAmount || 0)
                      : 0;

                    return (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-blue-50 transition-colors duration-150 border-b border-slate-100"
                      >
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="font-bold text-slate-900 text-base">
                              {booking.user?.firstName} {booking.user?.lastName}
                            </div>
                            <div className="text-sm text-slate-600 font-medium">{booking.trip?.title}</div>
                            <div className="text-xs text-slate-400 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {booking.trip?.startLocation} → {booking.trip?.endLocation}
                            </div>
                            <div className="text-xs text-slate-500">
                              Booking ID: {booking._id.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="space-y-1">
                            <div className="text-base font-bold text-slate-900">{formatCurrency(expectedAmount)}</div>
                            <div className="text-xs text-slate-500">
                              {booking.passengers?.length || 0} passenger{(booking.passengers?.length || 0) !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-slate-400">
                              {booking.payment?.paymentType === 'seat_lock' ? 'Seat Lock' : 'Full Payment'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="space-y-1">
                            <div className="text-base font-bold text-emerald-700">{formatCurrency(collectedAmount)}</div>
                            <div className="text-xs text-emerald-600">
                              {booking.payment?.paymentType === 'seat_lock' ? 'Seat Lock Paid' : 'Full Amount'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {dueAmount > 0 ? (
                            <div className="space-y-1">
                              <div className="text-base font-bold text-orange-600">{formatCurrency(dueAmount)}</div>
                              <div className="text-xs text-orange-500">Remaining</div>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-300">-</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(booking.status)}`}>
                            {booking.status === 'confirmed' ? '✅ Confirmed' : 
                             booking.status === 'pending' ? '⏳ Pending' : 
                             booking.status === 'cancelled' ? '❌ Cancelled' : booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                            title="View booking details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <CreditCard className="w-8 h-8 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Bookings Found</h3>
                            <p className="text-slate-600">No bookings match your current filters. Try adjusting your search criteria.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Payments;