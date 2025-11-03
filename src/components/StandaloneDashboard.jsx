import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import LoadingStates from './common/LoadingStates';
import Toast from './common/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 ${colorClasses[color]} p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <div className="flex items-center space-x-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Chart Container Component
const ChartContainer = ({ title, children, className = "", icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Activity className="w-4 h-4" />
        <span>Live Data</span>
      </div>
    </div>
    {children}
  </motion.div>
);

// Status Badge Component
const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    confirmed: { color: 'green', icon: CheckCircle, text: 'Confirmed' },
    pending: { color: 'yellow', icon: Clock, text: 'Pending' },
    rejected: { color: 'red', icon: XCircle, text: 'Rejected' },
    cancelled: { color: 'red', icon: XCircle, text: 'Cancelled' },
    completed: { color: 'green', icon: CheckCircle, text: 'Completed' }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-${config.color}-50 border border-${config.color}-200`}>
      <Icon className={`w-4 h-4 text-${config.color}-600`} />
      <span className={`text-sm font-medium text-${config.color}-800`}>{config.text}</span>
      <span className={`text-sm font-bold text-${config.color}-900`}>{count}</span>
    </div>
  );
};

// Standalone Dashboard Component
const StandaloneDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [trips, setTrips] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewRes, usersRes, tripsRes, bookingsRes, financialRes, performanceRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getUsers(),
        dashboardService.getTrips(),
        dashboardService.getBookings(),
        dashboardService.getFinancial(),
        dashboardService.getPerformance()
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (tripsRes.success) setTrips(tripsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (financialRes.success) setFinancial(financialRes.data);
      if (performanceRes.success) setPerformance(performanceRes.data);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchDashboardData();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, user]);

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates.PageLoader message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userTrendData = users?.trends?.map(item => ({
    date: `${item._id.day}/${item._id.month}`,
    users: item.count
  })) || [];

  const bookingTrendData = bookings?.trends?.map(item => ({
    date: `${item._id.day}/${item._id.month}`,
    bookings: item.count,
    revenue: item.revenue || 0
  })) || [];

  const revenueTrendData = financial?.revenueTrends?.map(item => ({
    date: `${item._id.day}/${item._id.month}`,
    revenue: item.revenue || 0,
    bookings: item.bookings || 0
  })) || [];

  const categoryData = trips?.popularCategories?.map(item => ({
    name: item._id,
    trips: item.count,
    bookings: item.totalBookings
  })) || [];

  const bookingStatusData = bookings?.statusDistribution?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive overview of your travel booking platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={overview?.users?.total?.toLocaleString() || '0'}
            subtitle={`${overview?.users?.newThisMonth || 0} new this month`}
            icon={Users}
            trend={overview?.users?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview?.users?.growthRate || 0}%`}
            color="blue"
          />
          
          <MetricCard
            title="Active Trips"
            value={overview?.trips?.active || '0'}
            subtitle={`${overview?.trips?.upcoming || 0} upcoming`}
            icon={MapPin}
            color="green"
          />
          
          <MetricCard
            title="Total Bookings"
            value={overview?.bookings?.total?.toLocaleString() || '0'}
            subtitle={`${overview?.bookings?.thisMonth || 0} this month`}
            icon={Calendar}
            trend={overview?.bookings?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview?.bookings?.growthRate || 0}%`}
            color="purple"
          />
          
          <MetricCard
            title="Total Revenue"
            value={`₹${(overview?.revenue?.total || 0).toLocaleString()}`}
            subtitle={`₹${(overview?.revenue?.thisMonth || 0).toLocaleString()} this month`}
            icon={DollarSign}
            trend={overview?.revenue?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview?.revenue?.growthRate || 0}%`}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registration Trend */}
          <ChartContainer title="User Registration Trend" icon={LineChart}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Booking Status Distribution */}
          <ChartContainer title="Booking Status Distribution" icon={PieChartIcon}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Revenue and Category Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <ChartContainer title="Revenue Trend" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Popular Categories */}
          <ChartContainer title="Popular Trip Categories" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="trips" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Users */}
          <ChartContainer title="Recent Users" icon={Users}>
            <div className="space-y-3">
              {users?.recentUsers?.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>

          {/* Booking Status Overview */}
          <ChartContainer title="Booking Status Overview" icon={Calendar}>
            <div className="space-y-3">
              {bookings?.statusDistribution?.map((status, index) => (
                <StatusBadge 
                  key={index} 
                  status={status._id} 
                  count={status.count} 
                />
              ))}
            </div>
          </ChartContainer>

          {/* Top Rated Trips */}
          <ChartContainer title="Top Rated Trips" icon={Star}>
            <div className="space-y-3">
              {performance?.topRatedTrips?.slice(0, 5).map((trip, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{trip.title}</p>
                    <p className="text-sm text-gray-600">{trip.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{trip.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{trip.reviews} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Platform Performance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Growth Rate</span>
                <span className={`font-semibold ${overview?.users?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview?.users?.growthRate > 0 ? '+' : ''}{overview?.users?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview?.users?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview?.users?.growthRate || 0), 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Booking Growth Rate</span>
                <span className={`font-semibold ${overview?.bookings?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview?.bookings?.growthRate > 0 ? '+' : ''}{overview?.bookings?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview?.bookings?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview?.bookings?.growthRate || 0), 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Growth Rate</span>
                <span className={`font-semibold ${overview?.revenue?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview?.revenue?.growthRate > 0 ? '+' : ''}{overview?.revenue?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview?.revenue?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview?.revenue?.growthRate || 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </ChartContainer>

          <ChartContainer title="System Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Payment Gateway</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Email Service</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Operational</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Cloud Storage</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Online</span>
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Toast for notifications */}
      <Toast />
    </div>
  );
};

export default StandaloneDashboard;
