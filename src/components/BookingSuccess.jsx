import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Download,
  Share2,
  Home,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Gift,
  Trophy,
  Zap,
  Star,
  PartyPopper
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const BookingSuccess = ({ booking, trip, onClose }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        setShowConfetti(false);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
      });
    }, 50);

    return () => clearInterval(confettiInterval);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getBookingStatusMessage = () => {
    const paymentType = booking.payment?.paymentType || 'full';
    const paymentStatus = booking.payment?.paymentStatus || booking.status;
    const status = booking.status;

    // Status-based messages
    if (status === 'confirmed' || paymentStatus === 'verified') {
      return {
        title: '🎉 Booking Confirmed! 🎉',
        description: 'Your seat is secured! We\'ve sent the confirmation to your email.'
      };
    } else if (status === 'pending' && paymentType === 'seat_lock') {
      return {
        title: '🔒 Seat Locked! 🔒',
        description: 'Your seat is reserved! Complete the remaining payment before the trip to confirm your booking.'
      };
    } else if (status === 'pending') {
      return {
        title: '📧 Booking Received! 📧',
        description: 'Your booking has been received and is awaiting admin confirmation. You\'ll receive an email once approved.'
      };
    } else if (status === 'seat_locked') {
      return {
        title: '🔒 Seat Locked! 🔒',
        description: 'Your seat is reserved! Pay the remaining amount to complete your booking.'
      };
    } else {
      return {
        title: '✅ Booking Successful! ✅',
        description: 'Your booking has been processed. Check your email for details.'
      };
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement PDF receipt download
    alert('Receipt download will be implemented soon!');
  };

  const handleShareBooking = async () => {
    const shareData = {
      title: `${trip.title} - Booking Confirmed!`,
      text: `I just booked an amazing trip to ${trip.destination}! 🎉`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Booking details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
              backgroundSize: '40px 40px' 
            }}></div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative z-10 mb-4"
          >
            <div className="inline-block p-6 bg-white/20 backdrop-blur-sm rounded-full">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white mb-2 relative z-10"
          >
            {getBookingStatusMessage().title}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-emerald-50 text-lg relative z-10"
          >
            {getBookingStatusMessage().description}
          </motion.p>

          {/* Booking ID Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-block bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl px-6 py-3 relative z-10"
          >
            <p className="text-emerald-50 text-sm mb-1">Booking ID</p>
            <p className="text-white text-2xl font-mono font-bold">
              {booking.bookingId || 'BK' + Date.now().toString().slice(-8)}
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Trip Details Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
              {trip.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Route</p>
                    <p className="font-semibold text-slate-800">
                      {trip.startLocation} → {trip.endLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Departure Date</p>
                    <p className="font-semibold text-slate-800">
                      {formatDate(trip.departureDate || trip.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Passengers</p>
                    <p className="font-semibold text-slate-800">
                      {booking.passengers?.length || 1} {booking.passengers?.length === 1 ? 'Person' : 'People'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Type</p>
                    <p className="font-semibold text-slate-800 capitalize">
                      {booking.payment?.paymentType === 'full' ? 'Full Payment' : 'Seat Lock'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount Paid</p>
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(booking.payment?.paidAmount || booking.payment?.totalAmount || 0)}
                    </p>
                  </div>
                </div>

                {booking.payment?.paymentType === 'seat_lock' && booking.payment?.remainingAmount > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Remaining Amount</p>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(booking.payment?.remainingAmount || 0)}
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        Pay within 10 days to confirm your seat
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Alert */}
          {booking.payment?.paymentType === 'full' ? (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-500 rounded-full">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-emerald-900 mb-1">
                    ✅ Your Booking is Confirmed!
                  </h4>
                  <p className="text-emerald-700 text-sm">
                    Full payment received. Your seat is secured! Check your email for detailed trip information and itinerary.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-500 rounded-full animate-pulse">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-amber-900 mb-1">
                    ⚡ Seat Locked - Action Required
                  </h4>
                  <p className="text-amber-700 text-sm mb-3">
                    Your seat is locked for 10 days. Complete payment to confirm your booking.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 border border-amber-200">
                    <p className="text-amber-800 font-semibold">
                      Remaining: {formatCurrency(booking.payment?.remainingAmount || 0)}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Lock expires on {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareBooking}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg font-semibold"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/my-trips')}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-semibold"
            >
              <Calendar className="w-5 h-5" />
              <span>View My Trips</span>
            </motion.button>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200"
          >
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-slate-600" />
              What's Next?
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Check Your Email</p>
                  <p className="text-slate-600 text-xs">
                    We've sent detailed trip information, packing list, and itinerary to {booking.contactDetails?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Stay Connected</p>
                  <p className="text-slate-600 text-xs">
                    Our team will contact you at {booking.contactDetails?.phone} for trip updates
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Join Trip Group</p>
                  <p className="text-slate-600 text-xs">
                    Connect with fellow travelers and stay updated on trip details
                  </p>
                </div>
              </div>

              {booking.payment?.paymentType === 'seat_lock' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Complete Payment</p>
                    <p className="text-slate-600 text-xs">
                      Pay the remaining amount within 10 days to confirm your booking
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;

