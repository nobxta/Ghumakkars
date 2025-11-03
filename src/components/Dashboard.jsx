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
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import LoadingStates from './common/LoadingStates';
import Toast from './common/Toast';

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 ${colorClasses[color]} p-6 shadow-sm hover:shadow-md transition-all duration-300`}
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
const ChartContainer = ({ title, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Activity className="w-4 h-4" />
        <span>Live Data</span>
      </div>
    </div>
    {children}
  </motion.div>
);

// Dashboard Component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getOverview();
      if (response.success) {
        setOverview(response.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
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

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

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

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">No data available</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of your travel booking platform</p>
          </div>
          <div className="flex items-center space-x-4">
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
            value={overview.users?.total?.toLocaleString() || '0'}
            subtitle={`${overview.users?.newThisMonth || 0} new this month`}
            icon={Users}
            trend={overview.users?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview.users?.growthRate || 0}%`}
            color="blue"
          />
          
          <MetricCard
            title="Active Trips"
            value={overview.trips?.active || '0'}
            subtitle={`${overview.trips?.upcoming || 0} upcoming`}
            icon={MapPin}
            color="green"
          />
          
          <MetricCard
            title="Total Bookings"
            value={overview.bookings?.total?.toLocaleString() || '0'}
            subtitle={`${overview.bookings?.thisMonth || 0} this month`}
            icon={Calendar}
            trend={overview.bookings?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview.bookings?.growthRate || 0}%`}
            color="purple"
          />
          
          <MetricCard
            title="Total Revenue"
            value={`₹${(overview.revenue?.total || 0).toLocaleString()}`}
            subtitle={`₹${(overview.revenue?.thisMonth || 0).toLocaleString()} this month`}
            icon={DollarSign}
            trend={overview.revenue?.growthRate > 0 ? 'up' : 'down'}
            trendValue={`${overview.revenue?.growthRate || 0}%`}
            color="green"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Completed Trips"
            value={overview.trips?.completed || '0'}
            subtitle="Successfully completed"
            icon={MapPin}
            color="indigo"
          />
          
          <MetricCard
            title="Pending Bookings"
            value={overview.bookings?.pending || '0'}
            subtitle="Awaiting approval"
            icon={Calendar}
            color="yellow"
          />
          
          <MetricCard
            title="Average Rating"
            value={overview.reviews?.averageRating || '0.0'}
            subtitle={`${overview.reviews?.total || 0} reviews`}
            icon={Star}
            color="yellow"
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overview.users?.verified || 0}</div>
              <div className="text-sm text-gray-600">Verified Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overview.trips?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overview.reviews?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {overview.revenue?.total > 0 ? 
                  Math.round((overview.revenue?.thisMonth / overview.revenue?.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue Share</div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Platform Performance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Growth Rate</span>
                <span className={`font-semibold ${overview.users?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.users?.growthRate > 0 ? '+' : ''}{overview.users?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview.users?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview.users?.growthRate || 0), 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Booking Growth Rate</span>
                <span className={`font-semibold ${overview.bookings?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.bookings?.growthRate > 0 ? '+' : ''}{overview.bookings?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview.bookings?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview.bookings?.growthRate || 0), 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Growth Rate</span>
                <span className={`font-semibold ${overview.revenue?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.revenue?.growthRate > 0 ? '+' : ''}{overview.revenue?.growthRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${overview.revenue?.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(overview.revenue?.growthRate || 0), 100)}%` }}
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

export default Dashboard;
