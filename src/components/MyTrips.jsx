import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Calendar,
  MapPin,
  Users,
  Phone,
  Mail,
  Eye,
  Download,
  RefreshCw,
  DollarSign,
  Timer,
  Info,
  Shield,
  Zap,
  Plane,
  Hourglass
} from 'lucide-react';
import bookingService from '../services/bookingService';
import StatusNotification from './StatusNotification';
// BookingStatusTimeline removed from this page for a cleaner UI

const MyTrips = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [statusNotificationData, setStatusNotificationData] = useState(null);
  // Removed timeline modal state for simplified UX

  // Lightweight skeleton primitives
  const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
  );

  const HeaderSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8 mb-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-10 ml-auto" />
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );

  const TabsSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-2 mb-8"
    >
      <div className="flex space-x-2 overflow-x-hidden">
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
    </motion.div>
  );

  const CardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row">
        <Skeleton className="w-full lg:w-1/3 h-64 lg:h-72" />
        <div className="lg:w-2/3 p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="ml-6 space-y-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4 mb-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    fetchBookings();
  }, [isAuthenticated, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings({ limit: 100 });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status, paymentStatus) => {
    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock,
        text: 'Pending Approval',
        description: 'Waiting for admin approval'
      },
      confirmed: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle,
        text: 'Confirmed',
        description: 'Booking confirmed and ready to go!'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: XCircle,
        text: 'Cancelled',
        description: 'Booking has been cancelled'
      },
      rejected: {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: XCircle,
        text: 'Rejected',
        description: 'Booking was rejected by admin'
      },
      completed: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: CheckCircle,
        text: 'Completed',
        description: 'Trip completed successfully'
      },
      terminated: {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: XCircle,
        text: 'Terminated',
        description: 'Booking has been terminated'
      },
      expired: {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: Timer,
        text: 'Expired',
        description: 'Booking has expired'
      },
      seat_locked: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Zap,
        text: 'Seat Locked',
        description: 'Seat is locked, pending full payment'
      }
    };

    return configs[status] || configs.pending;
  };

  const getPaymentStatusConfig = (booking) => {
    // Simplified logic: 
    // - Full payment + confirmed = Payment Complete
    // - Seat lock with remaining = Pay Remaining
    // - Otherwise show payment status
    
    if (booking.status === 'confirmed' && booking.payment.paymentType === 'full') {
      return {
        color: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle,
        text: 'Payment Complete'
      };
    }
    
    if (booking.payment.paymentType === 'seat_lock' && booking.payment.remainingAmount > 0) {
      return {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle,
        text: 'Pay Remaining'
      };
    }

    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-800',
        icon: Clock,
        text: 'Verifying Payment'
      },
      verified: {
        color: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle,
        text: 'Payment Complete'
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        text: 'Payment Failed'
      }
    };

    return configs[booking.payment.paymentStatus] || configs.pending;
  };

  const isSeatLockExpired = (booking) => {
    if (booking.payment.paymentType === 'seat_lock' && booking.payment.seatLockExpiry) {
      return new Date() > new Date(booking.payment.seatLockExpiry);
    }
    return false;
  };

  const getDaysUntilExpiry = (booking) => {
    if (booking.payment.paymentType === 'seat_lock' && booking.payment.seatLockExpiry) {
      const now = new Date();
      const expiry = new Date(booking.payment.seatLockExpiry);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return null;
  };

  const filteredBookings = bookings.filter(booking => {
    const tripDate = new Date(booking.trip?.departureDate || booking.trip?.startDate);
    const now = new Date();
    
    switch (selectedFilter) {
      case 'all':
        return true;
      case 'upcoming':
        return tripDate > now && booking.status !== 'cancelled' && booking.status !== 'completed';
      case 'past':
        return tripDate <= now || booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      case 'pending':
        return booking.status === 'pending';
      default:
        return true;
    }
  });

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const showStatusPopup = (booking, statusType, message = '') => {
    setStatusNotificationData({ booking, statusType, message });
    setShowStatusNotification(true);
  };

  const getBookingStatusType = (booking) => {
    if (booking.status === 'cancelled') return 'booking_rejected';
    if (booking.status === 'confirmed') return 'booking_confirmed';
    if (booking.payment.paymentType === 'seat_lock') {
      if (isSeatLockExpired(booking)) return 'seat_expired';
      if (booking.payment.remainingAmount > 0) return 'payment_required';
      return 'seat_locked';
    }
    if (booking.payment.paymentStatus === 'pending') return 'payment_pending';
    return 'payment_pending';
  };

  const getStatusMessage = (booking) => {
    if (booking.status === 'cancelled') {
      return booking.adminApproval?.rejectionReason || 'Booking could not be confirmed due to payment verification issues or seat unavailability.';
    }
    if (booking.payment.paymentType === 'seat_lock' && isSeatLockExpired(booking)) {
      return 'Your seat lock has expired. Please contact support for assistance.';
    }
    return '';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeaderSkeleton />
          <TabsSkeleton />
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">My Trips</h1>
              <p className="text-slate-600 text-base sm:text-lg">Manage your travel bookings and reservations</p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="text-right bg-blue-50 px-4 py-2 rounded-xl flex-1 sm:flex-initial">
                <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                <p className="text-xs sm:text-sm text-slate-600">Total Bookings</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Filter</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-slate-500">Showing {filteredBookings.length} of {bookings.length} bookings</div>
          </div>
        </motion.div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-12 text-center"
            >
              <div className="mb-4 flex justify-center">
                {selectedFilter === 'upcoming' && <Plane className="w-12 h-12 text-slate-400" />}
                {selectedFilter === 'pending' && <Hourglass className="w-12 h-12 text-slate-400" />}
                {selectedFilter === 'past' && <Calendar className="w-12 h-12 text-slate-400" />}
                {selectedFilter === 'cancelled' && <XCircle className="w-12 h-12 text-slate-400" />}
                {selectedFilter === 'all' && <Plane className="w-12 h-12 text-slate-400" />}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                {selectedFilter === 'upcoming' ? 'No Upcoming Trips' : 
                 selectedFilter === 'pending' ? 'No Pending Bookings' :
                 selectedFilter === 'past' ? 'No Past Trips' :
                 selectedFilter === 'cancelled' ? 'No Cancelled Trips' : 'No Trips Found'}
              </h3>
              <p className="text-slate-600 mb-6">
                {selectedFilter === 'upcoming' ? 'You don\'t have any upcoming trips booked yet.' :
                 selectedFilter === 'pending' ? 'You don\'t have any pending bookings.' :
                 selectedFilter === 'past' ? 'You haven\'t completed any trips yet.' :
                 selectedFilter === 'cancelled' ? 'You haven\'t cancelled any trips.' : 'Try adjusting filters.'}
              </p>
              {selectedFilter === 'upcoming' && (
                <button
                  onClick={() => navigate('/explore-trips')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  Explore Trips
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status, booking.payment.paymentStatus);
                const paymentConfig = getPaymentStatusConfig(booking);
                const StatusIcon = statusConfig.icon;
                const PaymentIcon = paymentConfig.icon;
                const isExpired = isSeatLockExpired(booking);
                const daysUntilExpiry = getDaysUntilExpiry(booking);

                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => navigate(`/booking-details/${booking._id}`)}
                    className={`cursor-pointer group relative bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      booking.status === 'cancelled' || booking.status === 'rejected' || booking.status === 'terminated' || booking.status === 'expired'
                        ? 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
                        : booking.status === 'confirmed' 
                        ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-xl' 
                        : booking.status === 'pending'
                        ? 'border-orange-200 hover:border-orange-400 hover:shadow-xl'
                        : 'border-blue-200 hover:border-blue-400 hover:shadow-xl'
                    }`}
                  >
                    {/* Gradient Overlay on Hover */}
                    {!(booking.status === 'cancelled' || booking.status === 'rejected' || booking.status === 'terminated' || booking.status === 'expired') && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    
                    <div className="relative p-4">
                      {/* Header with Title and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2 flex-1 pr-2 group-hover:text-blue-600 transition-colors">
                          {booking.trip?.title}
                        </h3>
                        <div className="ml-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            booking.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {booking.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                            {booking.status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1" />}
                            {booking.status === 'cancelled' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                            {booking.status === 'seat_locked' && <Shield className="w-3.5 h-3.5 mr-1" />}
                            <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Route with Icon */}
                      <div className="flex items-center text-sm text-slate-600 mb-2.5 bg-slate-50/50 rounded-lg px-2 py-1.5">
                        <MapPin className="w-4 h-4 mr-1.5 text-blue-600" />
                        <span className="truncate font-medium">
                          {booking.trip?.startLocation} → {booking.trip?.endLocation}
                        </span>
                      </div>

                      {/* Date and Passengers Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center text-xs text-slate-600 bg-blue-50/50 rounded-lg px-2 py-1.5">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          <span className="font-medium">{formatDate(booking.trip?.departureDate || booking.trip?.startDate)}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-600 bg-purple-50/50 rounded-lg px-2 py-1.5">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                          <span className="font-medium">{booking.passengers.length} Passenger{(booking.passengers.length !== 1) ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Amount Card */}
                      <div className="border-t-2 border-slate-100 pt-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Amount</span>
                          <span className="text-lg font-bold text-blue-600">
                            ₹{booking.payment?.paymentType === 'seat_lock' ? booking.payment?.seatLockAmount : booking.payment?.amount}
                          </span>
                        </div>
                        {booking.payment?.paymentType === 'seat_lock' && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-orange-600">Remaining</span>
                            <span className="text-sm font-semibold text-orange-600">
                              ₹{booking.payment?.remainingAmount || 0}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking-details/${booking._id}`);
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 text-center hover:shadow-lg transition-all duration-300">
              <Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {bookings.filter(booking => {
                  const tripDate = new Date(booking.trip?.departureDate || booking.trip?.startDate);
                  return tripDate > new Date() && booking.status !== 'cancelled' && booking.status !== 'rejected';
                }).length}
              </div>
              <p className="text-sm font-semibold text-blue-700">Upcoming Trips</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 text-center hover:shadow-lg transition-all duration-300">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {bookings.filter(booking => booking.status === 'pending').length}
              </div>
              <p className="text-sm font-semibold text-orange-700">Pending</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 p-6 text-center hover:shadow-lg transition-all duration-300">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {bookings.filter(booking => booking.status === 'confirmed').length}
              </div>
              <p className="text-sm font-semibold text-emerald-700">Confirmed</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 p-6 text-center hover:shadow-lg transition-all duration-300">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {bookings.filter(booking => booking.status === 'completed').length}
              </div>
              <p className="text-sm font-semibold text-purple-700">Completed</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showDetails && selectedBooking && (
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
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                    <p className="text-gray-600">#{selectedBooking._id.slice(-8)}</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trip:</span>
                            <span className="font-medium">{selectedBooking.trip?.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-medium">
                              {selectedBooking.trip?.startLocation} → {selectedBooking.trip?.endLocation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-medium">{formatDate(selectedBooking.trip?.departureDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return:</span>
                            <span className="font-medium">{formatDate(selectedBooking.trip?.returnDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedBooking.contactDetails.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Type:</span>
                            <span className="font-medium capitalize">{selectedBooking.payment.paymentType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(selectedBooking.payment.paidAmount || selectedBooking.payment.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">{formatCurrency(selectedBooking.payment.amount)}</span>
                          </div>
                          {selectedBooking.payment.paymentType === 'seat_lock' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Remaining Amount:</span>
                                <span className="font-bold text-orange-600">{formatCurrency(selectedBooking.payment.remainingAmount || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Seat Lock Expires:</span>
                                <span className={`font-medium ${isSeatLockExpired(selectedBooking) ? 'text-red-600' : 'text-orange-600'}`}>
                                  {formatDate(selectedBooking.payment.seatLockExpiry)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium">{selectedBooking.payment.transactionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusConfig(selectedBooking).color}`}>
                              {getPaymentStatusConfig(selectedBooking).text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Passengers */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Passengers ({selectedBooking.passengers.length})</h3>
                      <div className="space-y-3">
                        {selectedBooking.passengers.map((passenger, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium">{passenger.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{passenger.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Age:</span>
                                <span className="font-medium">{passenger.age}</span>
                              </div>
                              {passenger.college?.name && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">College:</span>
                                  <span className="font-medium">{passenger.college.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedBooking.status).color}`}>
                              {getStatusConfig(selectedBooking.status).text}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Booking Date:</span>
                            <span className="font-medium">{formatDateTime(selectedBooking.bookingDate)}</span>
                          </div>
                          {selectedBooking.specialRequirements && (
                            <div>
                              <span className="text-gray-600">Special Requirements:</span>
                              <p className="mt-1 text-sm text-gray-900">{selectedBooking.specialRequirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Notification Popup */}
      {showStatusNotification && statusNotificationData && (
        <StatusNotification
          isOpen={showStatusNotification}
          onClose={() => setShowStatusNotification(false)}
          booking={statusNotificationData.booking}
          statusType={statusNotificationData.statusType}
          message={statusNotificationData.message}
          actionRequired={statusNotificationData.statusType === 'payment_required' || statusNotificationData.statusType === 'seat_locked'}
          onAction={() => {
            if (statusNotificationData.statusType === 'payment_required') {
              // Handle payment action
              console.log('Redirect to payment page');
            } else if (statusNotificationData.statusType === 'seat_locked') {
              // Handle seat lock action
              console.log('Show payment completion options');
            }
          }}
        />
      )}

      {/* Timeline modal removed for a cleaner experience */}
    </div>
  );
};

export default MyTrips;