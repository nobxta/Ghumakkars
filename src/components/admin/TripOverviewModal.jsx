import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  MapPin,
  Edit,
  Eye
} from 'lucide-react';
import tripService from '../../services/tripService';

const TripOverviewModal = ({ tripId, isOpen, onClose, onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (isOpen && tripId) {
      fetchOverview();
    }
  }, [isOpen, tripId]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripOverview(tripId);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch trip overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      await onStatusChange(tripId, newStatus, cancellationReason);
      setShowStatusModal(false);
      setNewStatus('');
      setCancellationReason('');
      fetchOverview();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'yellow' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'ongoing', label: 'Ongoing', color: 'purple' },
    { value: 'completed', label: 'Completed', color: 'indigo' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
            >
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : data ? (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                          {data.trip.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(data.trip.departureDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>to {formatDate(data.trip.returnDate)}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            data.trip.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {data.trip.isPublished ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-slate-50">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Total Earnings</p>
                          <p className="text-lg font-black text-slate-800">
                            {formatCurrency(data.earnings.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Seats Booked</p>
                          <p className="text-lg font-black text-slate-800">
                            {data.seatInfo.currentParticipants}/{data.seatInfo.maxParticipants}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Bookings</p>
                          <p className="text-lg font-black text-slate-800">
                            {data.bookingStats.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Rating</p>
                          <p className="text-lg font-black text-slate-800">
                            {data.reviews.avgRating || 'N/A'}
                            <span className="text-xs text-slate-500 ml-1">
                              ({data.reviews.count})
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {/* Seat Availability */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Seat Availability
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Max Participants</span>
                          <span className="font-bold text-slate-800">{data.seatInfo.maxParticipants}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Booked Seats</span>
                          <span className="font-bold text-blue-600">{data.seatInfo.currentParticipants}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Available Seats</span>
                          <span className="font-bold text-green-600">{data.seatInfo.availableSeats}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${data.seatInfo.percentBooked}%` }}
                          />
                        </div>
                        <p className="text-sm text-slate-600 text-center">
                          {data.seatInfo.percentBooked}% Booked
                        </p>
                      </div>
                    </div>

                    {/* Earnings Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Earnings Breakdown
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-green-700 mb-1">Total Earned</p>
                          <p className="text-2xl font-black text-green-800">
                            {formatCurrency(data.earnings.total)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Confirmed</p>
                          <p className="text-2xl font-black text-blue-800">
                            {formatCurrency(data.earnings.confirmed)}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <p className="text-xs text-yellow-700 mb-1">Pending</p>
                          <p className="text-2xl font-black text-yellow-800">
                            {formatCurrency(data.earnings.pending)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Statistics */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                        Booking Statistics
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-black text-slate-800">{data.bookingStats.total}</p>
                          <p className="text-xs text-slate-600">Total</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-black text-green-600">{data.bookingStats.confirmed}</p>
                          <p className="text-xs text-green-700">Confirmed</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-black text-yellow-600">{data.bookingStats.pending}</p>
                          <p className="text-xs text-yellow-700">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-black text-orange-600">{data.bookingStats.seatLocked}</p>
                          <p className="text-xs text-orange-700">Seat Lock</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-2xl font-black text-red-600">{data.bookingStats.cancelled}</p>
                          <p className="text-xs text-red-700">Cancelled</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-black text-gray-600">{data.bookingStats.rejected}</p>
                          <p className="text-xs text-gray-700">Rejected</p>
                        </div>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Bookings</h3>
                      {data.bookings.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                          <p className="text-slate-600">No bookings yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {data.bookings.slice(0, 10).map((booking) => (
                            <div
                              key={booking._id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {booking.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{booking.user?.name || 'N/A'}</p>
                                  <p className="text-xs text-slate-600">{booking.user?.email || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">
                                  {formatCurrency(booking.payment?.amount || 0)}
                                </p>
                                <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {booking.status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reviews */}
                    {data.reviews.list.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-600" />
                          Recent Reviews ({data.reviews.count})
                        </h3>
                        <div className="space-y-3">
                          {data.reviews.list.slice(0, 5).map((review) => (
                            <div
                              key={review._id}
                              className="p-4 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-slate-800">{review.user?.name || 'Anonymous'}</p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-slate-700">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Change Status</span>
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Current: <span className="font-bold">{data.trip.status}</span></span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-600">Failed to load trip overview</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-800 mb-4">Change Trip Status</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {(newStatus === 'cancelled' || newStatus === 'deleted') && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TripOverviewModal;

