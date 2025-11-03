import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  TrendingDown,
  Star,
  Tag,
  FileText,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Send,
  MessageSquare,
  DollarSign,
  UserCheck,
  Shield,
  Zap,
  Flag,
  Archive,
  Bookmark,
  Grid,
  List,
  Settings,
  Bell,
  User,
  Building,
  ArrowUpDown,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentType: '',
    priority: '',
    source: '',
    search: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    seat_locked: 0,
    cancelled: 0,
    completed: 0,
    expired: 0,
    totalRevenue: 0,
    confirmedRevenue: 0,
    seatLockRevenue: 0,
    avgBookingValue: 0,
    totalPassengers: 0
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.current, sortBy, sortOrder]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching bookings with filters:', { ...filters, page: pagination.current, limit: pagination.limit, sortBy, sortOrder });
      
      const response = await bookingService.getAllBookings({
        ...filters,
        page: pagination.current,
        limit: pagination.limit,
        sortBy,
        sortOrder
      });
      
      console.log('Bookings API response:', response);
      
      if (response.success && response.data) {
        const bookingsData = response.data.bookings || [];
        console.log('Bookings data:', bookingsData);
        
        setBookings(bookingsData);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0, limit: 20 });
        
        // Use stats from backend (more accurate calculation)
        const backendStats = response.data.stats || {
          total: 0,
          pending: 0,
          confirmed: 0,
          rejected: 0,
          seat_locked: 0,
          cancelled: 0,
          completed: 0,
          expired: 0,
          totalRevenue: 0,
          confirmedRevenue: 0,
          seatLockRevenue: 0,
          avgBookingValue: 0,
          totalPassengers: 0
        };
        
        setStats(backendStats);
        
        if (bookingsData.length === 0) {
          setError('No bookings found. Try adjusting your filters or check if bookings exist in the database.');
        }
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response from server. Please try again.');
        setBookings([]);
        setStats({ total: 0, pending: 0, confirmed: 0, rejected: 0, seat_locked: 0, cancelled: 0, completed: 0, expired: 0, totalRevenue: 0, confirmedRevenue: 0, seatLockRevenue: 0, avgBookingValue: 0, totalPassengers: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bookings';
      setError(`Error: ${errorMessage}. Please check if the backend server is running on port 5000.`);
      setBookings([]);
      setStats({ total: 0, pending: 0, confirmed: 0, rejected: 0, seat_locked: 0, cancelled: 0, completed: 0, totalRevenue: 0, avgBookingValue: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const toggleRowExpansion = (bookingId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleBookingSelection = (bookingId) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const selectAllBookings = () => {
    if (selectedBookings.size === bookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map(b => b._id)));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Customer', 'Trip', 'Status', 'Payment Type', 'Amount', 'Date'].join(','),
      ...bookings.map(booking => [
        booking._id.slice(-8),
        booking.contactDetails.name,
        booking.trip?.title || 'N/A',
        booking.status,
        booking.payment?.paymentType || 'N/A',
        booking.payment?.amount || 0,
        new Date(booking.bookingDate).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleApproveBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        await bookingService.approveBooking(bookingId);
        alert('Booking approved successfully');
        fetchBookings();
      } catch (error) {
        console.error('Failed to approve booking:', error);
        alert('Failed to approve booking');
      }
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please enter the reason for rejecting this booking:');
    if (reason && reason.trim()) {
      try {
        await bookingService.rejectBooking(bookingId, reason);
        alert('Booking rejected successfully');
        fetchBookings();
      } catch (error) {
        console.error('Failed to reject booking:', error);
        alert('Failed to reject booking');
      }
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      switch (action) {
        case 'hold':
          await bookingService.updateBookingStatus(bookingId, 'hold', 'Booking put on hold');
          break;
        case 'mark_paid':
          await bookingService.markAsPaid(bookingId);
          break;
        case 'send_reminder':
          await bookingService.sendReminder(bookingId, 'payment');
          break;
        case 'cancel':
          const reason = prompt('Please enter the reason for cancelling this booking:');
          if (reason && reason.trim()) {
            await bookingService.updateBookingStatus(bookingId, 'cancelled', reason);
          }
          break;
        default:
          break;
      }
      alert(`Booking ${action.replace('_', ' ')} action completed successfully`);
      fetchBookings();
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
      alert(`Failed to ${action.replace('_', ' ')} booking`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return '₹0';
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'verified': { text: 'Payment Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'failed': { text: 'Payment Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
      'refunded': { text: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
      'partial': { text: 'Partial Payment', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: AlertTriangle };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (booking) => {
    if (!booking || !booking.payment) {
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: AlertTriangle };
    }
    
    const { status, payment } = booking;
    
    if (status === 'rejected') {
      return { text: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle };
    }
    
    if (status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: XCircle };
    }
    
    if (status === 'confirmed') {
      if (payment.paymentType === 'full') {
        return { text: '✓ Confirmed (Full Payment)', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      } else if (payment.paymentType === 'seat_lock') {
        return { text: '✓ Confirmed (Seat Lock)', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle };
      }
    }
    
    if (status === 'pending') {
      if (payment.paymentType === 'seat_lock') {
        return { text: '⚡ Seat Locked (Pending Approval)', color: 'bg-orange-100 text-orange-800', icon: Zap };
      } else if (payment.paymentType === 'full') {
        return { text: '⏳ Pending (Full Payment)', color: 'bg-amber-100 text-amber-800', icon: Clock };
      }
    }
    
    if (status === 'completed') {
      return { text: '✓ Completed', color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle };
    }
    
    if (status === 'expired') {
      return { text: 'Expired', color: 'bg-gray-100 text-gray-600', icon: Timer };
    }

    return { text: 'Unknown Status', color: 'bg-gray-100 text-gray-600', icon: AlertTriangle };
  };


  const openBookingDetails = (booking) => {
    navigate(`/admin/bookings/${booking._id}`);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Booking Management</h1>
              <p className="text-slate-600 mt-2 text-lg">Manage and track all trip bookings with real-time updates</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportBookings}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <strong className="font-semibold">Error:</strong> {error}
                </div>
              </div>
              <button 
                onClick={() => {
                  setError(null);
                  fetchBookings();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats.total}
            icon={Users}
            color="blue"
            delay={0.1}
            subtitle={`${stats.totalPassengers} passengers`}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pending}
            icon={Clock}
            color="amber"
            delay={0.2}
            subtitle="Awaiting admin review"
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed + stats.completed}
            icon={CheckCircle}
            color="green"
            delay={0.3}
            subtitle={`${stats.seat_locked} seat locked`}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="emerald"
            delay={0.4}
            subtitle={`Confirmed: ${formatCurrency(stats.confirmedRevenue)}`}
          />
        </div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-800">Revenue Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Confirmed Revenue</h4>
                    <p className="text-sm text-slate-600">Full payments received</p>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700 mb-2">
                {formatCurrency(stats.confirmedRevenue)}
              </div>
              <div className="text-sm text-green-600">
                {stats.confirmed + stats.completed} bookings
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Timer className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Seat Lock Revenue</h4>
                    <p className="text-sm text-slate-600">Partial payments held</p>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {formatCurrency(stats.seatLockRevenue)}
              </div>
              <div className="text-sm text-blue-600">
                {stats.seat_locked} bookings
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Average Value</h4>
                    <p className="text-sm text-slate-600">Per booking</p>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {formatCurrency(stats.avgBookingValue)}
              </div>
              <div className="text-sm text-purple-600">
                Total: {stats.total} bookings
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-800">Booking Status Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.pending}</div>
              <div className="text-sm text-blue-600 font-medium">Pending</div>
              <div className="text-xs text-blue-500">Awaiting review</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">{stats.confirmed}</div>
              <div className="text-sm text-green-600 font-medium">Confirmed</div>
              <div className="text-xs text-green-500">Full payment</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.seat_locked}</div>
              <div className="text-sm text-blue-600 font-medium">Seat Locked</div>
              <div className="text-xs text-blue-500">Partial payment</div>
            </div>
            
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700 mb-1">{stats.completed}</div>
              <div className="text-sm text-emerald-600 font-medium">Completed</div>
              <div className="text-xs text-emerald-500">Trip finished</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-700 mb-1">{stats.rejected}</div>
              <div className="text-sm text-red-600 font-medium">Rejected</div>
              <div className="text-xs text-red-500">Not approved</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-700 mb-1">{stats.cancelled}</div>
              <div className="text-sm text-gray-600 font-medium">Cancelled</div>
              <div className="text-xs text-gray-500">User cancelled</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-700 mb-1">{stats.expired}</div>
              <div className="text-sm text-orange-600 font-medium">Expired</div>
              <div className="text-xs text-orange-500">Seat lock expired</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Filter className="w-6 h-6 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-800">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
                placeholder="Search bookings..."
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="seat_locked">Seat Locked</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center space-x-2"
              >
                {viewMode === 'table' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                <span>{viewMode === 'table' ? 'Cards' : 'Table'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">No bookings found</h3>
              <p className="text-slate-600 text-lg">No bookings match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedBookings.size === bookings.length && bookings.length > 0}
                        onChange={selectAllBookings}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trip Details
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {bookings.map((booking, index) => {
                    const statusBadge = getStatusBadge(booking);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <motion.tr 
                        key={booking._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedBookings.has(booking._id)}
                            onChange={() => toggleBookingSelection(booking._id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                        </td>
                        
                        {/* Booking Details */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">
                                  {booking._id.slice(-4).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-slate-900">
                                #{booking._id.slice(-8)}
                              </div>
                              <div className="text-sm text-slate-500 flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{booking.numberOfParticipants || booking.passengers?.length || 1} passengers</span>
                              </div>
                              <div className="text-sm text-slate-500">
                                {formatDate(booking.bookingDate)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Customer Info */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-slate-900">
                              {booking.contactDetails?.name || 'No Name Provided'}
                            </div>
                            <div className="text-sm text-slate-600 flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{booking.contactDetails?.email || 'No Email'}</span>
                            </div>
                            <div className="text-sm text-slate-600 flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{booking.contactDetails?.phone || 'No Phone'}</span>
                            </div>
                            {booking.user && (
                              <div className="text-xs text-slate-500 flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>User ID: {booking.user._id?.slice(-8) || 'Unknown'}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Trip Details */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-slate-900">
                              {booking.trip?.title || 'Trip Not Found'}
                            </div>
                            <div className="text-sm text-slate-600 flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {booking.trip?.startLocation || 'Unknown'} → {booking.trip?.endLocation || 'Unknown'}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(booking.trip?.departureDate)}</span>
                            </div>
                            {booking.trip?.returnDate && (
                              <div className="text-sm text-slate-600 flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Return: {formatDate(booking.trip.returnDate)}</span>
                              </div>
                            )}
                            {booking.trip?.price && (
                              <div className="text-sm font-medium text-green-600">
                                Trip Price: {formatCurrency(booking.trip.price)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Payment Details */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-lg font-bold text-slate-900">
                              {formatCurrency(booking.payment?.paidAmount || 0)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {booking.payment?.paymentType === 'seat_lock' ? 'Seat Lock Payment' : 'Full Payment'}
                            </div>
                            
                            {/* Show seat lock amount if applicable */}
                            {booking.payment?.paymentType === 'seat_lock' && booking.payment?.seatLockAmount > 0 && (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Lock: {formatCurrency(booking.payment.seatLockAmount)}
                              </div>
                            )}
                            
                            {/* Show remaining amount if applicable */}
                            {booking.payment?.remainingAmount > 0 && (
                              <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Remaining: {formatCurrency(booking.payment.remainingAmount)}
                              </div>
                            )}
                            
                            {/* Show total booking amount */}
                            {booking.payment?.totalAmount && booking.payment.totalAmount !== booking.payment.paidAmount && (
                              <div className="text-xs text-gray-500">
                                Total: {formatCurrency(booking.payment.totalAmount)}
                              </div>
                            )}
                            {booking.payment?.transactionId && (
                              <div className="text-xs text-slate-500 font-mono">
                                TXN: {booking.payment.transactionId.slice(-8)}
                              </div>
                            )}
                            <div className="mt-2">
                              {getPaymentStatusBadge(booking.payment?.paymentStatus)}
                            </div>
                            {booking.payment?.paymentMode && (
                              <div className="text-xs text-slate-500">
                                Mode: {booking.payment.paymentMode}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${statusBadge.color} shadow-sm`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {statusBadge.text}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => openBookingDetails(booking)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveBooking(booking._id)}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking._id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => toggleRowExpansion(booking._id)}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                              title="More Details"
                            >
                              {expandedRows.has(booking._id) ? 
                                <ChevronUp className="w-5 h-5" /> : 
                                <ChevronDown className="w-5 h-5" />
                              }
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-700 font-medium">
                Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                  disabled={pagination.current === 1}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold">
                  {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                  disabled={pagination.current === pagination.pages}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bookings;