import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Timer,
  Plane,
  Shield,
  Info,
  Download,
  Wallet,
  Gift,
  Percent
} from 'lucide-react';
import bookingService from '../services/bookingService';
import tripService from '../services/tripService';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely extract string values from objects
  const getValue = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    if (typeof value === 'object' && value._id) return value.toString();
    return 'N/A';
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        console.log('Fetching booking details for:', bookingId);
        const bookingResponse = await bookingService.getBookingById(bookingId);
        
        console.log('Booking response:', bookingResponse);
        
        if (bookingResponse) {
          // Handle the response structure: {success: true, data: {booking: {...}}}
          const bookingData = bookingResponse.data?.booking || bookingResponse.booking || bookingResponse;
          setBooking(bookingData);
          
          console.log('Booking data trip:', bookingData.trip);
          console.log('Trip type:', typeof bookingData.trip);
          
          // Extract trip ID - could be a string ID or an object with _id
          let tripId = null;
          if (bookingData.trip) {
            if (typeof bookingData.trip === 'string') {
              tripId = bookingData.trip;
            } else if (typeof bookingData.trip === 'object' && bookingData.trip._id) {
              tripId = bookingData.trip._id;
            }
          } else if (bookingData.tripId) {
            tripId = bookingData.tripId;
          }
          
          console.log('Extracted trip ID:', tripId);
          
          // If trip is already an object with all details, use it directly
          if (bookingData.trip && typeof bookingData.trip === 'object' && bookingData.trip.title) {
            console.log('Trip data is already populated, using it directly');
            setTrip(bookingData.trip);
          } else if (tripId) {
            // Fetch trip details if we have a trip ID
            try {
              const tripData = await tripService.getTripById(tripId);
              console.log('Trip data fetched:', tripData);
              setTrip(tripData.data || tripData);
            } catch (tripError) {
              console.error('Error fetching trip:', tripError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking details could not be loaded.</p>
          <button
            onClick={() => navigate('/my-trips')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    rejected: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/my-trips')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-all duration-200 group px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              <span className="font-semibold tracking-tight">Back to My Trips</span>
            </button>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-semibold tracking-wide mb-1 uppercase">Booking Reference</p>
              <p className="text-sm font-mono font-bold text-slate-900 tracking-wider">#{booking._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status Banner */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-2xl p-6 shadow-lg border-l-4 ${
            booking.status === 'confirmed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' :
            booking.status === 'pending' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-500' :
            'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {booking.status === 'confirmed' ? (
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="p-4 bg-orange-100 rounded-full">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Booking Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{booking.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 mb-2">Booking Date</p>
              <p className="text-base font-bold text-gray-900">
                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trip Information - Full Details */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b-2 border-gray-200">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Trip Details</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{trip?.title || booking.trip?.title || 'No title'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Section */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Route Information</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Departure Location</p>
                      <p className="text-lg font-bold text-gray-900 leading-tight">{trip?.startLocation || booking.trip?.startLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 shadow-sm">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Destination Location</p>
                      <p className="text-lg font-bold text-gray-900 leading-tight">{trip?.endLocation || booking.trip?.endLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Passengers</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 shadow-sm">
                  <p className="text-4xl font-extrabold text-gray-900 mb-1">{booking.passengers?.length || 0}</p>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Passenger{booking.passengers?.length !== 1 ? 's' : ''} booked
                  </p>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Travel Schedule</p>
                </div>
                <div className="space-y-3">
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Departure Date</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 leading-snug">
                      {trip?.departureDate || booking.trip?.departureDate ? 
                        new Date(trip?.departureDate || booking.trip?.departureDate).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Not specified'}
                    </p>
                  </div>
                  {trip?.returnDate && (
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 shadow-sm">
                      <div className="flex items-center space-x-3 mb-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Return Date</p>
                      </div>
                      <p className="text-base font-bold text-gray-900 leading-snug">
                        {new Date(trip.returnDate).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Section - Enhanced */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b-2 border-gray-200">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Summary</h2>
              <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
                {booking.payment?.paymentType === 'seat_lock' ? 'Partial Payment • Seat Lock' : 'Full Payment'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Total Amount */}
            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-1">Total Trip Cost</p>
                  <p className="text-xs text-gray-600 font-medium">All passengers included</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900">₹{booking.payment?.amount || 0}</p>
              </div>
            </div>

            {/* Paid Amount */}
            {booking.payment?.paymentType === 'seat_lock' && booking.payment?.seatLockAmount > 0 ? (
              <>
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-700 mb-1 uppercase tracking-wide">Amount Paid</p>
                      <p className="text-xs text-green-600 font-medium">Seat Lock Payment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-green-700">₹{booking.payment?.seatLockAmount || 0}</p>
                  </div>
                </div>
                
                {booking.payment?.remainingAmount > 0 && (
                  <div className="flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="text-sm font-bold text-orange-700 mb-1 uppercase tracking-wide">Remaining Amount</p>
                        <p className="text-xs text-orange-600 font-medium">Due before trip</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-orange-700">₹{booking.payment?.remainingAmount || 0}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-700 mb-1 uppercase tracking-wide">Amount Paid</p>
                    <p className="text-xs text-green-600 font-medium">Full payment completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-green-700">
                    ₹{booking.payment?.paidAmount || booking.payment?.amount || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Discounts */}
            {(booking.discounts?.couponDiscount > 0 || booking.discounts?.referralDiscount > 0 || booking.discounts?.walletUsedAmount > 0) && (
              <div className="mt-4 pt-4 border-t-2 border-purple-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Discounts Applied</p>
                </div>
                <div className="space-y-2">
                  {booking.discounts?.couponDiscount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-sm font-bold text-gray-700">Coupon Code</span>
                      <span className="text-base font-extrabold text-purple-700">- ₹{booking.discounts.couponDiscount}</span>
                    </div>
                  )}
                  {booking.discounts?.referralDiscount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-sm font-bold text-gray-700">Referral Reward</span>
                      <span className="text-base font-extrabold text-purple-700">- ₹{booking.discounts.referralDiscount}</span>
                    </div>
                  )}
                  {booking.discounts?.walletUsedAmount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-sm font-bold text-gray-700">Wallet Balance</span>
                      <span className="text-base font-extrabold text-purple-700">- ₹{booking.discounts.walletUsedAmount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Payment Status</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                  booking.payment?.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' :
                  booking.payment?.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {booking.payment?.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* Pay Remaining Button */}
            {booking.payment?.paymentType === 'seat_lock' && booking.payment?.remainingAmount > 0 && booking.status !== 'cancelled' && (
              <div className="mt-6 pt-6 border-t-2 border-orange-200">
                <button
                  onClick={() => {
                    // Navigate to complete payment page
                    navigate(`/complete-payment/${booking._id}`);
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3"
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Pay Remaining ₹{booking.payment.remainingAmount}</span>
                </button>
                <p className="text-center text-sm text-gray-600 mt-3">
                  Complete your payment to secure your booking
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Passenger Details - Enhanced */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b-2 border-gray-200">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Passenger Details</h2>
              <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
                {booking.passengers?.length || 0} Passenger{booking.passengers?.length !== 1 ? 's' : ''} Total
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.passengers?.map((passenger, idx) => (
              <div key={idx} className="border-2 border-gray-100 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:border-purple-300 transition-all">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base text-gray-900">{passenger.name}</p>
                    <p className="text-xs text-gray-500">Passenger {idx + 1}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Age</p>
                    <p className="font-bold text-gray-900">{passenger.age || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Gender</p>
                    <p className="font-bold text-gray-900 capitalize">{getValue(passenger.gender) || 'N/A'}</p>
                  </div>
                </div>

                {/* College Information */}
                {passenger.college && (getValue(passenger.college) !== 'N/A') && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-indigo-600" />
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">College</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">
                        {passenger.college?.name || getValue(passenger.college)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <Mail className="w-6 h-6 text-purple-600" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact Information</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email Address</p>
                <p className="font-bold text-gray-900 text-lg">{booking.contactDetails?.email || 'N/A'}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone Number</p>
                <p className="font-bold text-gray-900 text-lg">{booking.contactDetails?.phone || 'N/A'}</p>
              </div>
            </div>
            
            {/* Emergency Contact */}
            {booking.contactDetails?.emergencyContact && booking.contactDetails.emergencyContact.name && (
              <div className="mt-4 pt-4 border-t-2 border-orange-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="w-6 h-6 text-orange-600" />
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Emergency Contact</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Name</p>
                      <p className="font-bold text-gray-900 text-base">{booking.contactDetails.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Phone</p>
                      <p className="font-bold text-gray-900 text-base">{booking.contactDetails.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Relationship</p>
                      <p className="font-bold text-gray-900 text-base capitalize">{booking.contactDetails.emergencyContact.relationship}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Special Requirements */}
        {booking.specialRequirements && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Special Notes</h2>
            </div>
            <p className="text-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 leading-relaxed font-medium">
              {booking.specialRequirements}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
