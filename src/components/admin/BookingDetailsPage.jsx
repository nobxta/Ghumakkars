import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  FileText,
  Shield,
  Eye,
  Download,
  Copy,
  MessageSquare,
  Mail as MailIcon,
  Send,
  Edit,
  Trash2,
  Verified,
  X,
  Calendar as CalendarIcon,
  Building2,
  Package,
  Receipt
} from 'lucide-react';
import bookingService from '../../services/bookingService';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      console.log('Response from API:', response);
      if (response.success) {
        // The API returns { data: { booking } }
        setBooking(response.data?.booking || response.data);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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
    if (!booking || !booking.payment) {
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
    
    const { status, payment } = booking;
    
    if (status === 'rejected') {
      return { text: 'Rejected', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
    
    if (status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-gray-100 text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
    
    if (status === 'confirmed') {
      if (payment.paymentType === 'full') {
        return { text: '✓ Confirmed (Full Payment)', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      } else if (payment.paymentType === 'seat_lock') {
        return { text: '✓ Confirmed (Seat Lock)', color: 'bg-emerald-100 text-emerald-800', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
      }
    }
    
    if (status === 'pending') {
      if (payment.paymentType === 'seat_lock') {
        return { text: '⚡ Seat Locked (Pending Approval)', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
      } else if (payment.paymentType === 'full') {
        return { text: '⏳ Pending (Full Payment)', color: 'bg-amber-100 text-amber-800', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
      }
    }
    
    if (status === 'completed') {
      return { text: '✓ Completed', color: 'bg-indigo-100 text-indigo-800', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' };
    }

    return { text: 'Unknown Status', color: 'bg-gray-100 text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this booking?')) return;
    
    try {
      setActionLoading(true);
      await bookingService.approveBooking(id);
      alert('Booking approved successfully!');
      fetchBookingDetails();
    } catch (err) {
      alert(err.message || 'Failed to approve booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter the reason for rejecting this booking:');
    if (!reason || !reason.trim()) return;
    
    try {
      setActionLoading(true);
      await bookingService.rejectBooking(id, reason);
      alert('Booking rejected successfully!');
      fetchBookingDetails();
    } catch (err) {
      alert(err.message || 'Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      setActionLoading(true);
      await bookingService.markAsPaid(id);
      alert('Booking marked as paid successfully!');
      fetchBookingDetails();
    } catch (err) {
      alert(err.message || 'Failed to mark as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setActionLoading(true);
      await bookingService.markAsPaid(id);
      setShowVerifyModal(false);
      alert('Payment verified successfully!');
      fetchBookingDetails();
    } catch (err) {
      alert(err.message || 'Failed to verify payment');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking && !loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Booking Not Found</h2>
          <p className="text-gray-600 mb-6 text-center">{error || 'The booking you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const statusBadge = booking ? getStatusBadge(booking) : { text: 'Loading...', color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/bookings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-sm text-gray-600">ID: {booking?._id?.slice(-12) || 'Loading...'}</p>
              </div>
            </div>
            {booking && (
              <div className={`px-4 py-2 rounded-lg font-medium ${statusBadge.color}`}>
                {statusBadge.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <DollarSign className="w-6 h-6 mr-2" />
                  Payment Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.payment?.amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.payment?.paymentType === 'seat_lock' ? 'Seat Lock' : 'Full Payment'}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  {booking.payment?.paymentType === 'seat_lock' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Seat Lock Amount</span>
                        <span className="font-medium text-gray-900">{formatCurrency(booking.payment?.seatLockAmount || 0)}</span>
                      </div>
                      {booking.payment?.remainingAmount > 0 && (
                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-orange-800">Remaining Amount</span>
                          <span className="font-bold text-lg text-orange-900">{formatCurrency(booking.payment?.remainingAmount)}</span>
                        </div>
                      )}
                      {booking.payment?.seatLockExpiry && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Seat Lock Expires</span>
                          <span className="font-medium text-orange-600">{booking.payment?.seatLockExpiry ? formatDate(booking.payment.seatLockExpiry) : 'N/A'}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.payment?.paymentStatus === 'verified' ? 'bg-green-100 text-green-800' :
                      booking.payment?.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.payment?.paymentStatus === 'verified' ? '✓ Verified' : 
                       booking.payment?.paymentStatus === 'rejected' ? '✗ Rejected' : 
                       '⏳ Pending Verification'}
                    </span>
                  </div>

                  {booking.payment?.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transaction ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{booking.payment?.transactionId || 'N/A'}</span>
                        <button
                          onClick={() => copyToClipboard(booking.payment?.transactionId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {booking.payment?.paymentMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Mode</span>
                      <span className="font-medium text-gray-900">{booking.payment?.paymentMode || 'N/A'}</span>
                    </div>
                  )}
                </div>

                {/* Razorpay Details */}
                {booking.payment?.razorpayPayment && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-2">Razorpay Transaction</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {booking.payment?.razorpayPayment?.orderId && (
                        <div>
                          <span className="text-gray-600">Order ID:</span>
                          <p className="font-mono">{booking.payment.razorpayPayment.orderId}</p>
                        </div>
                      )}
                      {booking.payment?.razorpayPayment?.paymentId && (
                        <div>
                          <span className="text-gray-600">Payment ID:</span>
                          <p className="font-mono">{booking.payment.razorpayPayment.paymentId}</p>
                        </div>
                      )}
                      {booking.payment?.razorpayPayment?.method && (
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <p className="capitalize">{booking.payment.razorpayPayment.method}</p>
                        </div>
                      )}
                      {booking.payment?.razorpayPayment?.status && (
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="capitalize">{booking.payment.razorpayPayment.status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Verification */}
                {booking.payment?.paymentStatus === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-1">Payment Verification Required</h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          Review the payment details above and transaction proof before verifying this payment.
                        </p>
                        <button
                          onClick={() => setShowVerifyModal(true)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                        >
                          <Verified className="w-4 h-4" />
                          <span>Verify Payment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Customer Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Customer Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{booking.contactDetails?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-semibold text-gray-900">{booking.contactDetails?.email || 'N/A'}</p>
                      <button
                        onClick={() => copyToClipboard(booking.contactDetails?.email)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-semibold text-gray-900">{booking.contactDetails?.phone || 'N/A'}</p>
                      <button
                        onClick={() => copyToClipboard(booking.contactDetails?.phone)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking Date</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(booking.bookingDate)}</p>
                  </div>
                </div>

                {booking.contactDetails?.emergencyContact && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="font-medium text-gray-900">{booking.contactDetails.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{booking.contactDetails.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Relationship</p>
                        <p className="font-medium text-gray-900">{booking.contactDetails.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Trip Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Trip Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trip Title</p>
                  <p className="text-xl font-semibold text-gray-900">{booking.trip?.title || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Route</p>
                    <p className="font-medium text-gray-900">
                      {booking.trip?.startLocation} → {booking.trip?.endLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trip Price</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(booking.trip?.price || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Departure Date</p>
                    <p className="font-medium text-gray-900">
                      {booking.trip?.departureDate ? formatDate(booking.trip.departureDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Return Date</p>
                    <p className="font-medium text-gray-900">
                      {booking.trip?.returnDate ? formatDate(booking.trip.returnDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Passengers Card */}
            {booking.passengers && booking.passengers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    Passenger Details ({booking.passengers.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.passengers.map((passenger, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold">{index + 1}</span>
                            </div>
                            <p className="font-semibold text-gray-900">{passenger.name}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600">Age:</span>
                            <span className="ml-2 font-medium text-gray-900">{passenger.age} years</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Gender:</span>
                            <span className="ml-2 font-medium text-gray-900 capitalize">{passenger.gender || 'Not specified'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-2 font-medium text-gray-900">{passenger.phone}</span>
                          </div>
                          {passenger.college && (passenger.college.name || passenger.college.id) && (
                            <div className="text-sm">
                              <span className="text-gray-600">College:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {passenger.college.name || 'Not specified'}
                                {passenger.college.id && ` (${passenger.college.id})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions Sidebar - Right Side */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Admin Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve Booking</span>
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Booking</span>
                    </button>
                    <button
                      onClick={handleMarkPaid}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Verified className="w-5 h-5" />
                      <span>Mark as Paid</span>
                    </button>
                  </>
                )}

                <div className="border-t pt-3 space-y-2">
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    disabled={booking.payment?.paymentStatus === 'verified'}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Verify Payment</span>
                  </button>
                  <button
                    onClick={() => alert('Send reminder functionality')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono font-medium">{booking._id?.slice(-12) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium">{booking.numberOfParticipants || booking.passengers?.length || 1}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Booking Date</span>
                  <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                </div>
                {booking.adminApproval?.approvedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Approved At</span>
                    <span className="font-medium">{booking.adminApproval?.approvedAt ? formatDate(booking.adminApproval.approvedAt) : 'N/A'}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Verify Payment Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Verify Payment</h3>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">Payment Details</h4>
                </div>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>Amount:</strong> {formatCurrency(booking.payment?.amount || 0)}</p>
                  <p><strong>Type:</strong> {booking.payment?.paymentType === 'seat_lock' ? 'Seat Lock' : 'Full Payment'}</p>
                  {booking.payment?.transactionId && (
                    <p><strong>Transaction ID:</strong> {booking.payment?.transactionId || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any notes about this verification..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Verify Payment'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPage;
