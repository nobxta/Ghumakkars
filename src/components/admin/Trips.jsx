import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Star,
  Settings,
  RefreshCw,
  X,
  Check,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import tripService from '../../services/tripService';
import bookingService from '../../services/bookingService';
import TripOverviewModal from './TripOverviewModal';

// Dropdown Menu Component for Actions
const ActionMenu = ({ trip, onEdit, onView, onViewBookings, onDelete, onTogglePublish, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    {
      label: 'Edit Trip',
      icon: Edit,
      onClick: () => { onEdit(); setIsOpen(false); },
      color: 'text-indigo-600 hover:bg-indigo-50'
    },
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => { onView(); setIsOpen(false); },
      color: 'text-slate-600 hover:bg-slate-50'
    },
    {
      label: 'View Bookings',
      icon: Users,
      onClick: () => { onViewBookings(); setIsOpen(false); },
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      label: trip.isPublished ? 'Unpublish' : 'Publish',
      icon: trip.isPublished ? Lock : Globe,
      onClick: () => { onTogglePublish(); setIsOpen(false); },
      color: trip.isPublished ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
    },
    {
      label: 'Delete Trip',
      icon: Trash2,
      onClick: () => { onDelete(); setIsOpen(false); },
      color: 'text-red-600 hover:bg-red-50',
      divider: true
    }
  ];

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-600" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${isMobile ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50`}
          >
            <div className="py-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <React.Fragment key={index}>
                    {action.divider && <div className="my-2 border-t border-slate-200" />}
                    <button
                      onClick={action.onClick}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition-colors ${action.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedTripBookings, setSelectedTripBookings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Trips', color: 'gray', icon: Grid },
    { value: 'draft', label: 'Draft', color: 'yellow', icon: Edit, description: 'Created but not published' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue', icon: Calendar, description: 'Published, departure in future' },
    { value: 'active', label: 'Active', color: 'green', icon: CheckCircle, description: 'Published and ready' },
    { value: 'ongoing', label: 'Ongoing', color: 'indigo', icon: Clock, description: 'Currently happening' },
    { value: 'completed', label: 'Completed', color: 'purple', icon: Star, description: 'Trip finished' },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: XCircle, description: 'Cancelled by admin' },
    { value: 'deleted', label: 'Deleted', color: 'gray', icon: Trash2, description: 'Hidden from users' }
  ];

  const categories = ['all', 'Adventure', 'Spiritual', 'Cultural', 'Nature', 'Photography', 'Wellness'];

  useEffect(() => {
    fetchTrips();
  }, [filters]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAdminTrips(filters);
      if (response.success) {
        setTrips(response.data);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleStatusUpdate = async () => {
    if (!selectedTrip || !newStatus) return;

    try {
      const response = await tripService.updateTripStatus(
        selectedTrip._id,
        newStatus,
        cancellationReason
      );
      
      if (response.success) {
        setShowStatusModal(false);
        setSelectedTrip(null);
        setNewStatus('');
        setCancellationReason('');
        fetchTrips();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleTogglePublish = async (tripId, currentPublishedStatus) => {
    try {
      await tripService.updateTrip(tripId, { isPublished: !currentPublishedStatus });
      await fetchTrips();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      await tripService.deleteTrip(tripToDelete._id);
      await fetchTrips();
      setShowDeleteModal(false);
      setTripToDelete(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const openDeleteModal = (trip) => {
    setTripToDelete(trip);
    setShowDeleteModal(true);
  };

  const openStatusModal = (trip) => {
    setSelectedTrip(trip);
    setNewStatus(trip.status);
    setCancellationReason('');
    setShowStatusModal(true);
  };

  const openBookingsModal = async (trip) => {
    setSelectedTripId(trip._id);
    setShowOverviewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const IconComponent = statusConfig?.icon || AlertCircle;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorClasses[statusConfig?.color || 'gray']}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {statusConfig?.label || status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.startLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.endLocation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showAddTrip) {
    const AddNewTrip = React.lazy(() => import('./AddNewTrip_Enhanced'));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>}>
        <AddNewTrip />
      </React.Suspense>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Trip Management</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage all your trips and bookings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/trips/add')}
          className="hidden md:flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Trip</span>
        </motion.button>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Trips', value: trips.length, icon: MapPin, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: trips.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Ongoing', value: trips.filter(t => t.status === 'ongoing').length, icon: Clock, color: 'from-indigo-500 to-purple-500' },
          { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, icon: Star, color: 'from-purple-500 to-pink-500' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">View Mode</label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-inner' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-inner' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Add Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddTrip(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add Trip</span>
        </motion.button>
      )}

      {/* Trips Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading trips...</p>
          </div>
        </div>
      ) : filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-12 text-center"
        >
          <ImageIcon className="mx-auto h-16 w-16 text-slate-400 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">No trips found</h3>
          <p className="text-slate-600 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new trip'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/admin/trips/add')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Trip</span>
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className={`${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }`}>
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`group bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Trip Image */}
                  <div className={`relative ${viewMode === 'grid' ? 'h-56' : 'w-64 flex-shrink-0'} bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden`}>
                    {trip.coverImage ? (
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-slate-400" />
                      </div>
                    )}

                    {/* Published Badge */}
                    {trip.isPublished ? (
                      <div className="absolute top-3 left-3 flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                        <Globe className="w-4 h-4" />
                        <span>Live</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                        <Lock className="w-4 h-4" />
                        <span>Draft</span>
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-black text-green-600">{formatPrice(trip.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Content */}
                  <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                    <div className="flex-1">
                      {/* Title */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-2 flex-1 pr-2">
                          {trip.title}
                        </h3>
                        {/* Three-dot menu only on mobile */}
                        {isMobile && (
                          <ActionMenu
                            trip={trip}
                            onEdit={() => navigate(`/admin/trips/edit/${trip._id}`)}
                            onView={() => navigate(`/trip/${trip.urlSlug || trip._id}`)}
                            onViewBookings={() => openBookingsModal(trip)}
                            onDelete={() => openDeleteModal(trip)}
                            onTogglePublish={() => handleTogglePublish(trip._id, trip.isPublished)}
                            isMobile={isMobile}
                          />
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{trip.summary}</p>

                      {/* Trip Info */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="truncate font-medium">{trip.startLocation} → {trip.endLocation}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}</span>
                        </div>

                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{trip.currentParticipants}/{trip.maxParticipants} participants</span>
                          <div className="ml-auto">
                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${(trip.currentParticipants / trip.maxParticipants) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      {trip.status === 'cancelled' && trip.cancellation?.cancellationReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                          <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-red-900 mb-1">Cancellation Reason:</p>
                              <p className="text-xs text-red-700 font-medium">{trip.cancellation.cancellationReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Desktop Only */}
                      {!isMobile && (
                        <div className="space-y-2 mt-4">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/admin/trips/edit/${trip._id}`)}
                              className="flex items-center justify-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => navigate(`/trip/${trip.urlSlug || trip._id}`)}
                              className="flex items-center justify-center space-x-1 bg-slate-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-slate-700 transition-colors font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => openBookingsModal(trip)}
                              className="flex items-center justify-center space-x-1 bg-purple-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors font-medium"
                            >
                              <Users className="w-4 h-4" />
                              <span>Bookings</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(trip)}
                              className="flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-red-700 transition-colors font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleTogglePublish(trip._id, trip.isPublished)}
                            className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-sm transition-colors font-medium ${
                              trip.isPublished 
                                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {trip.isPublished ? (
                              <>
                                <Lock className="w-4 h-4" />
                                <span>Unpublish</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4" />
                                <span>Publish</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700 font-medium">
                  Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalTrips || 0)} of {pagination.totalTrips || 0} trips
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange((pagination.currentPage || 1) - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="hidden md:flex gap-2">
                    {Array.from({ length: Math.min(pagination.totalPages || 1, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                            page === (pagination.currentPage || 1)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                              : 'border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange((pagination.currentPage || 1) + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-800">Update Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Trip</label>
                <p className="text-slate-800 font-semibold bg-slate-50 px-4 py-3 rounded-xl">{selectedTrip.title}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  {statusOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'cancelled' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cancellation Reason</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  Update Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && tripToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-800">Delete Trip</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 mb-4 font-medium">Are you sure you want to delete this trip?</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1">{tripToDelete.title}</p>
                  <p className="text-sm text-slate-600">{tripToDelete.startLocation} → {tripToDelete.endLocation}</p>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-900 text-sm font-bold">
                  ⚠️ Warning: This action cannot be undone!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTripToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTrip}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  Delete Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Modal */}
      <AnimatePresence>
        {showBookingsModal && selectedTripBookings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Trip Bookings</h3>
                  <p className="text-slate-600 font-medium mt-1">{selectedTripBookings.title}</p>
                </div>
                <button
                  onClick={() => setShowBookingsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">No bookings yet for this trip</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {(booking.user?.firstName || booking.user?.name)?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">
                                {booking.user?.firstName 
                                  ? `${booking.user.firstName} ${booking.user.lastName || ''}`.trim()
                                  : booking.user?.name || 'N/A'
                                }
                              </h4>
                              <p className="text-sm text-slate-600">{booking.user?.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {booking.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                            <p className="font-semibold text-slate-800">{booking.user?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Participants</p>
                            <p className="font-semibold text-slate-800">{booking.numberOfParticipants || 1} person(s)</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                            <p className="font-semibold text-green-600">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.payment?.amount || 0)}
                            </p>
                          </div>
                        </div>

                        {booking.payment && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Payment Type</p>
                                <p className="font-medium text-slate-800">
                                  {booking.payment.paymentType === 'full' ? 'Full Payment' : 'Seat Lock'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                                <p className={`font-medium ${
                                  booking.payment.paymentStatus === 'verified' ? 'text-green-600' :
                                  booking.payment.paymentStatus === 'pending' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {booking.payment.paymentStatus}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Booked On</p>
                                <p className="font-medium text-slate-800">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 font-medium">
                    Total Bookings: <span className="font-bold text-slate-800">{bookings.length}</span>
                  </p>
                  <button
                    onClick={() => setShowBookingsModal(false)}
                    className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Overview Modal */}
      <TripOverviewModal
        tripId={selectedTripId}
        isOpen={showOverviewModal}
        onClose={() => {
          setShowOverviewModal(false);
          setSelectedTripId(null);
        }}
        onStatusChange={handleStatusUpdate}
      />
    </div>
  );
};

export default Trips;
