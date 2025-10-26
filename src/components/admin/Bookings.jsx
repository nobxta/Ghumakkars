import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Timer,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import bookingService from '../../services/bookingService';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    seat_locked: 0,
    cancelled: 0,
    completed: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.current]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const response = await bookingService.getAllBookings({
        ...filters,
        page: pagination.current,
        limit: 20
      });
      
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
        
        // Calculate stats
        const bookingStats = (response.data.bookings || []).reduce((acc, booking) => {
          acc.total++;
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        }, { total: 0, pending: 0, confirmed: 0, rejected: 0, seat_locked: 0, cancelled: 0, completed: 0 });
        
        setStats(bookingStats);
      } else {
        console.error('Invalid response format:', response);
        setBookings([]);
        setStats({ total: 0, pending: 0, confirmed: 0, rejected: 0, seat_locked: 0, cancelled: 0, completed: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch bookings');
      setBookings([]);
      setStats({ total: 0, pending: 0, confirmed: 0, rejected: 0, seat_locked: 0, cancelled: 0, completed: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleApproveBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        await bookingService.approveBooking(bookingId);
        alert('Booking approved successfully');
        fetchBookings();
        setShowModal(false);
      } catch (error) {
        console.error('Failed to approve booking:', error);
        alert('Failed to approve booking');
      }
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason && reason.trim()) {
      try {
        await bookingService.rejectBooking(bookingId, reason);
        alert('Booking rejected successfully');
        fetchBookings();
        setShowModal(false);
      } catch (error) {
        console.error('Failed to reject booking:', error);
        alert('Failed to reject booking');
      }
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    if (action === 'approve') {
      await handleApproveBooking(bookingId);
    } else if (action === 'reject') {
      await handleRejectBooking(bookingId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (booking) => {
    // Safety check for booking object
    if (!booking || !booking.payment) {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertTriangle,
        text: 'Unknown'
      };
    }

    // Simplified status logic for admin view
    if (booking.status === 'confirmed' && booking.payment.paymentType === 'full') {
      return {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle,
        text: '✓ Confirmed'
      };
    }
    
    if (booking.status === 'pending' && booking.payment.paymentType === 'seat_lock') {
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: AlertTriangle,
        text: '⚡ Seat Locked'
      };
    }

    const statusConfig = {
      pending: { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: Clock,
        text: 'Pending' 
      },
      confirmed: { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircle,
        text: 'Confirmed' 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        text: 'Cancelled' 
      },
      completed: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle,
        text: 'Completed' 
      },
      expired: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: Timer,
        text: 'Expired' 
      }
    };
    
    return statusConfig[booking.status] || statusConfig.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-amber-100 text-amber-800', 
        icon: Clock,
        text: 'Pending' 
      },
      verified: { 
        color: 'bg-emerald-100 text-emerald-800', 
        icon: CheckCircle,
        text: 'Verified' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle,
        text: 'Rejected' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'seat_locked':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'expired':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-3 sm:p-4 lg:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-600">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="text-xs sm:text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );


  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => {
              setError(null);
              fetchBookings();
            }}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Manage Bookings</h1>
            <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base font-medium">View and manage all trip bookings with real-time updates.</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-200 transition-colors duration-200 font-medium flex items-center space-x-1 sm:space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-1 sm:space-x-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Only show non-zero values */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {stats.total > 0 && (
          <StatCard
            title="Total"
            value={stats.total}
            icon={Users}
            color="blue"
            delay={0.1}
          />
        )}
        {stats.pending > 0 && (
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="amber"
            delay={0.2}
          />
        )}
        {stats.confirmed > 0 && (
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CheckCircle}
            color="emerald"
            delay={0.3}
          />
        )}
        {stats.rejected > 0 && (
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="red"
            delay={0.4}
          />
        )}
        {stats.seat_locked > 0 && (
          <StatCard
            title="Seat Locked"
            value={stats.seat_locked}
            icon={Clock}
            color="blue"
            delay={0.5}
          />
        )}
        {stats.cancelled > 0 && (
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            color="gray"
            delay={0.6}
          />
        )}
        {stats.completed > 0 && (
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
            delay={0.7}
          />
        )}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6"
      >
        <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Search bookings..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Booking Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="seat_locked">Seat Locked</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Payment Type</label>
            <select
              value={filters.paymentType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentType: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Payment Types</option>
              <option value="full">Full Payment</option>
              <option value="seat_lock">Seat Lock</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', paymentStatus: '', search: '' })}
              className="w-full px-3 sm:px-4 py-2 bg-slate-600 text-white rounded-lg sm:rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            />
            <p className="text-slate-600 font-medium text-sm sm:text-base">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">No Bookings Found</h3>
            <p className="text-slate-600 text-sm sm:text-base">No bookings match the current filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trip Details
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Passengers
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-slate-200/50">
                  <AnimatePresence>
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{booking._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{booking.trip?.title}</div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {booking.trip?.startLocation} → {booking.trip?.endLocation}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{booking.contactDetails.name}</div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {booking.contactDetails.email}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {booking.contactDetails.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {booking.passengers.length} passenger(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{booking.payment ? formatCurrency(booking.payment.amount || booking.payment.totalAmount || 0) : '₹0'}</div>
                            {booking.payment && booking.payment.paymentType === 'seat_lock' && (
                              <div className="text-xs text-slate-500 flex items-center">
                                <CreditCard className="w-3 h-3 mr-1" />
                                Seat Lock
                              </div>
                            )}
                            <div className="mt-1">
                              {booking.payment && getPaymentStatusBadge(booking.payment.paymentStatus)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const badge = getStatusBadge(booking);
                            const Icon = badge.icon;
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {badge.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(booking.bookingDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openBookingDetails(booking)}
                              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingAction(booking._id, 'approve')}
                                  className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking._id, 'reject')}
                                  className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
                              </>
                            )}
                            {booking.status === 'seat_locked' && (
                              <span className="text-blue-600 text-xs">
                                Awaiting Full Payment
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                <AnimatePresence>
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">#{booking._id.slice(-4)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{booking.contactDetails.name}</div>
                            <div className="text-xs text-slate-500">{booking.trip?.title}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking).color}`}>
                          {getStatusBadge(booking).text}
                        </span>
                      </div>

                      {/* Trip Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-xs text-slate-600">
                          <MapPin className="w-3 h-3 mr-2" />
                          {booking.trip?.startLocation} → {booking.trip?.endLocation}
                        </div>
                        <div className="flex items-center text-xs text-slate-600">
                          <Calendar className="w-3 h-3 mr-2" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-slate-600">
                          <Users className="w-3 h-3 mr-2" />
                          {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Payment Info */}
                      {booking.payment && (
                        <div className="flex items-center justify-between mb-3 p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-600">
                            <div className="font-medium">Amount Paid</div>
                            <div className="font-bold text-emerald-600">₹{booking.payment.paidAmount || booking.payment.amount || 0}</div>
                          </div>
                          {booking.payment.paymentType === 'seat_lock' && booking.payment.remainingAmount > 0 && (
                            <div className="text-xs text-slate-600">
                              <div className="font-medium">Remaining</div>
                              <div className="font-bold text-orange-600">₹{booking.payment.remainingAmount}</div>
                            </div>
                          )}
                          <div className="text-xs text-slate-600">
                            <div className="font-medium">Type</div>
                            <div className="capitalize">{booking.payment.paymentType ? booking.payment.paymentType.replace('_', ' ') : 'N/A'}</div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBookingDetails(booking)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(booking._id, 'approve')}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking._id, 'reject')}
                              className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {booking.status === 'seat_locked' && (
                          <div className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg text-center">
                            <span>Seat Locked - Awaiting Full Payment</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white/50 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-slate-200/50">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                    disabled={pagination.current === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-3 py-2 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                      <span className="font-medium">{pagination.pages}</span> ({pagination.total} total bookings)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                        disabled={pagination.current === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                        disabled={pagination.current === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Booking Details</h2>
                    <p className="text-slate-600">#{selectedBooking._id.slice(-8)}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Trip Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Trip Information</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Trip:</span>
                            <span className="font-medium">{selectedBooking.trip?.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Route:</span>
                            <span className="font-medium">
                              {selectedBooking.trip?.startLocation} → {selectedBooking.trip?.endLocation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Departure:</span>
                            <span className="font-medium">{formatDate(selectedBooking.trip?.departureDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Return:</span>
                            <span className="font-medium">{formatDate(selectedBooking.trip?.returnDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Details</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Name:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Email:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phone:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.phone}</span>
                          </div>
                          {selectedBooking.contactDetails.emergencyContact?.name && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Emergency Contact:</span>
                                <span className="font-medium">{selectedBooking.contactDetails.emergencyContact.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Emergency Phone:</span>
                                <span className="font-medium">{selectedBooking.contactDetails.emergencyContact.phone}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Information</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Payment Type:</span>
                            <span className="font-medium capitalize">{selectedBooking.payment.paymentType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Amount Paid:</span>
                            <span className="font-medium">{formatCurrency(selectedBooking.payment.amount)}</span>
                          </div>
                          {selectedBooking.payment.paymentType === 'seat_lock' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Seat Lock Amount:</span>
                                <span className="font-medium">{formatCurrency(selectedBooking.payment.seatLockAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Remaining Amount:</span>
                                <span className="font-medium">{formatCurrency(selectedBooking.payment.remainingAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Seat Lock Expires:</span>
                                <span className="font-medium text-orange-600">
                                  {formatDate(selectedBooking.payment.seatLockExpiry)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-600">Transaction ID:</span>
                            <span className="font-medium">{selectedBooking.payment.transactionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Payment Status:</span>
                            {getPaymentStatusBadge(selectedBooking.payment.paymentStatus)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Passengers */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Passengers ({selectedBooking.passengers.length})</h3>
                      <div className="space-y-3">
                        {selectedBooking.passengers.map((passenger, index) => (
                          <div key={index} className="bg-slate-50 rounded-lg p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Name:</span>
                                <span className="font-medium">{passenger.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Phone:</span>
                                <span className="font-medium">{passenger.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Age:</span>
                                <span className="font-medium">{passenger.age}</span>
                              </div>
                              {passenger.college?.name && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">College:</span>
                                  <span className="font-medium">{passenger.college.name}</span>
                                </div>
                              )}
                              {passenger.college?.id && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">College ID:</span>
                                  <span className="font-medium">{passenger.college.id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Booking Status</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Status:</span>
                            {getStatusBadge(selectedBooking.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Booking Date:</span>
                            <span className="font-medium">{formatDate(selectedBooking.bookingDate)}</span>
                          </div>
                          {selectedBooking.adminApproval?.approvedAt && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Approved At:</span>
                              <span className="font-medium">{formatDate(selectedBooking.adminApproval.approvedAt)}</span>
                            </div>
                          )}
                          {selectedBooking.specialRequirements && (
                            <div>
                              <span className="text-slate-600">Special Requirements:</span>
                              <p className="mt-1 text-sm text-slate-900">{selectedBooking.specialRequirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {selectedBooking.status === 'pending' && selectedBooking.payment.paymentType === 'seat_lock' && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Admin Actions</h3>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                            <p className="font-medium text-orange-800">⚡ Seat Lock Booking</p>
                          </div>
                          <p className="text-sm text-orange-700">
                            Customer has paid ₹{selectedBooking.payment.paidAmount || selectedBooking.payment.amount} to lock their seat. 
                            Remaining ₹{selectedBooking.payment.remainingAmount} must be paid before{' '}
                            {new Date(selectedBooking.payment.seatLockExpiry).toLocaleDateString()} to confirm.
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproveBooking(selectedBooking._id)}
                            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Seat Lock
                          </button>
                          <button
                            onClick={() => handleRejectBooking(selectedBooking._id)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Booking
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedBooking.status === 'confirmed' && selectedBooking.payment.paymentType === 'full' && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Booking Status</h3>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                            <div>
                              <p className="font-medium text-emerald-800">✓ Booking Confirmed</p>
                              <p className="text-sm text-emerald-700">Full payment received. No action required.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;