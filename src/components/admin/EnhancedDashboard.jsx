import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, MapPin,
  Calendar, Activity, Zap, Star, Award, Target, Eye, Download,
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Search,
  Mail, Phone, MessageSquare, Heart, ArrowRight, Clock,
  CheckCircle, XCircle, AlertCircle, Package, Truck, Globe
} from 'lucide-react';
import tripService from '../../services/tripService';
import bookingService from '../../services/bookingService';

const EnhancedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalTrips: 0,
      activeTrips: 0,
      totalBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      avgBookingValue: 0,
      growthRate: {
        trips: 0,
        bookings: 0,
        revenue: 0,
        users: 0
      },
      trips: [],
      recentBookings: [],
      topDestinations: [],
      conversionRate: 0,
      avgResponseTime: '2.5h'
    }
  });

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch trips
      const tripsResponse = await tripService.getAdminTrips({ limit: 100 });
      const allTrips = tripsResponse.data || [];
      
      // Fetch bookings
      const bookingsResponse = await bookingService.getAllBookings({
        page: 1,
        limit: 50,
        sortBy: 'bookingDate',
        sortOrder: 'desc'
      });
      const allBookings = bookingsResponse.data?.bookings || [];
      
      // Calculate comprehensive stats
      const totalTrips = allTrips.length;
      const activeTrips = allTrips.filter(t => t.status === 'active' && t.isPublished).length;
      const totalBookings = allBookings.length;
      const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
      
      // Revenue calculations
      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const monthlyRevenue = allBookings
        .filter(b => new Date(b.bookingDate).getMonth() === new Date().getMonth())
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
      
      // Growth calculations (mock data for now)
      const growthRate = {
        trips: 12.5,
        bookings: 18.3,
        revenue: 24.7,
        users: 8.2
      };
      
      // Top destinations
      const destinationsMap = {};
      allTrips.forEach(trip => {
        const dest = trip.endLocation || trip.startLocation;
        if (!destinationsMap[dest]) {
          destinationsMap[dest] = { name: dest, count: 0, revenue: 0 };
        }
        destinationsMap[dest].count++;
        destinationsMap[dest].revenue += trip.currentParticipants * trip.price;
      });
      const topDestinations = Object.values(destinationsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Conversion rate calculation
      const conversionRate = ((confirmedBookings / (totalBookings || 1)) * 100).toFixed(1);
      
      setDashboardData({
        overview: {
          totalTrips,
          activeTrips,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          totalRevenue,
          monthlyRevenue,
          avgBookingValue,
          growthRate,
          trips: allTrips.slice(0, 6),
          recentBookings: allBookings.slice(0, 10),
          topDestinations,
          conversionRate: parseFloat(conversionRate)
        }
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      purple: 'from-violet-500 to-violet-600',
      amber: 'from-amber-500 to-amber-600',
      rose: 'from-rose-500 to-rose-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </motion.div>
    );
  };

  const MiniChart = ({ data, type = 'bar', color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-emerald-500',
      purple: 'bg-violet-500',
      amber: 'bg-amber-500'
    };

    return (
      <div className="flex items-end justify-between h-20">
        {data.map((val, index) => (
          <div
            key={index}
            className={`${colors[color]} rounded-t transition-all duration-500 hover:opacity-80`}
            style={{
              height: `${(val / Math.max(...data)) * 100}%`,
              width: `${100 / data.length - 2}%`
            }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Trips"
            value={dashboardData.overview.totalTrips}
            subtitle="Active: {dashboardData.overview.activeTrips}"
            icon={Globe}
            color="blue"
            trend={dashboardData.overview.growthRate.trips}
          />
          <StatCard
            title="Bookings"
            value={dashboardData.overview.totalBookings}
            subtitle={`${dashboardData.overview.confirmedBookings} confirmed`}
            icon={ShoppingBag}
            color="green"
            trend={dashboardData.overview.growthRate.bookings}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(dashboardData.overview.monthlyRevenue)}
            subtitle="This month"
            icon={DollarSign}
            color="amber"
            trend={dashboardData.overview.growthRate.revenue}
          />
          <StatCard
            title="Avg Booking"
            value={formatCurrency(dashboardData.overview.avgBookingValue)}
            subtitle="Per booking"
            icon={TrendingUp}
            color="purple"
            trend={8.5}
          />
          <StatCard
            title="Conversion"
            value={`${dashboardData.overview.conversionRate}%`}
            subtitle="Booking rate"
            icon={Target}
            color="rose"
          />
          <StatCard
            title="Pending"
            value={dashboardData.overview.pendingBookings}
            subtitle="Needs action"
            icon={Clock}
            color="indigo"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
                <p className="text-sm text-gray-600 mt-1">Total revenue: {formatCurrency(dashboardData.overview.totalRevenue)}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="h-64">
              <MiniChart
                data={[12000, 19000, 15000, 28000, 24000, 30000, 35000]}
                type="bar"
                color="blue"
              />
            </div>
          </motion.div>

          {/* Top Destinations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Destinations</h3>
              <Filter className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {dashboardData.overview.topDestinations.map((dest, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-600">{dest.count} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(dest.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                <p className="text-sm text-gray-600 mt-1">Latest customer bookings</p>
              </div>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {dashboardData.overview.recentBookings.slice(0, 8).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        #{booking._id?.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {booking.contactDetails?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.contactDetails?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.contactDetails?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.trip?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-3">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Add Trip</span>
          </button>
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all flex items-center space-x-3">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">View Bookings</span>
          </button>
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center space-x-3">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </button>
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center space-x-3">
            <Download className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-900">Export Data</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
