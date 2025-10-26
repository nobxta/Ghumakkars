import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Timer,
  Info,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

const StatusNotification = ({ 
  isOpen, 
  onClose, 
  booking, 
  statusType, 
  message, 
  actionRequired = false,
  onAction = null 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const timer = setTimeout(() => setProgress(100), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getStatusConfig = (type) => {
    const configs = {
      seat_locked: {
        icon: Clock,
        title: 'Seat Locked Successfully! 🎉',
        subtitle: 'Your seat has been reserved',
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        progressColor: 'bg-amber-500'
      },
      payment_pending: {
        icon: CreditCard,
        title: 'Payment Verification Pending ⏳',
        subtitle: 'We are verifying your payment',
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        progressColor: 'bg-blue-500'
      },
      booking_confirmed: {
        icon: CheckCircle,
        title: 'Booking Confirmed! ✅',
        subtitle: 'Your trip is confirmed and ready',
        color: 'from-emerald-500 to-green-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-800',
        iconColor: 'text-emerald-600',
        progressColor: 'bg-emerald-500'
      },
      booking_rejected: {
        icon: XCircle,
        title: 'Booking Rejected ❌',
        subtitle: 'Your booking could not be confirmed',
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        progressColor: 'bg-red-500'
      },
      seat_expired: {
        icon: Timer,
        title: 'Seat Lock Expired ⏰',
        subtitle: 'Your seat reservation has expired',
        color: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        progressColor: 'bg-gray-500'
      },
      payment_required: {
        icon: AlertTriangle,
        title: 'Payment Required! 💳',
        subtitle: 'Complete your payment to confirm booking',
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        progressColor: 'bg-orange-500'
      }
    };

    return configs[type] || configs.payment_pending;
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

  const config = getStatusConfig(statusType);
  const Icon = config.icon;

  if (!isOpen || !booking) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`${config.bgColor} ${config.borderColor} border-2 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className={`h-full ${config.progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>

          {/* Header */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${config.color} shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-2xl font-bold ${config.textColor}`}
                  >
                    {config.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-lg ${config.textColor} opacity-80`}
                  >
                    {config.subtitle}
                  </motion.p>
                </div>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            {/* Booking Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{booking.trip?.title}</p>
                      <p className="text-sm text-gray-600">
                        {booking.trip?.startLocation} → {booking.trip?.endLocation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Departure Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.trip?.departureDate || booking.trip?.startDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Passengers</p>
                      <p className="text-sm text-gray-600">
                        {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Amount Paid</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(booking.payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking ID */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Booking ID: <span className="font-mono font-semibold">#{booking._id.slice(-8)}</span>
                </p>
              </div>
            </motion.div>

            {/* Status Specific Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              {statusType === 'seat_locked' && (
                <div className="bg-amber-100 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Timer className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Seat Lock Details</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Your seat is locked for <strong>10 days</strong>. Complete your payment before{' '}
                        <strong>{formatDate(booking.payment.seatLockExpiry)}</strong> to confirm your booking.
                      </p>
                      <p className="text-sm text-amber-700 mt-2">
                        Remaining amount: <strong>{formatCurrency(booking.payment.remainingAmount)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {statusType === 'booking_rejected' && (
                <div className="bg-red-100 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Rejection Reason</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {message || 'Your booking could not be confirmed due to payment verification issues or seat unavailability.'}
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        Please contact support for assistance or try booking again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {statusType === 'payment_required' && (
                <div className="bg-orange-100 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Payment Required</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Complete your payment to confirm your booking. Remaining amount:{' '}
                        <strong>{formatCurrency(booking.payment.remainingAmount)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {statusType === 'booking_confirmed' && (
                <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-800">Booking Confirmed!</h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        Your trip is confirmed! You will receive your travel documents via email shortly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 mt-8"
            >
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold border border-gray-200 flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Booking Details
              </button>
              
              {actionRequired && onAction && (
                <button
                  onClick={onAction}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r ${config.color} text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center`}
                >
                  {statusType === 'payment_required' && <CreditCard className="w-4 h-4 mr-2" />}
                  {statusType === 'seat_locked' && <RefreshCw className="w-4 h-4 mr-2" />}
                  {statusType === 'booking_rejected' && <Mail className="w-4 h-4 mr-2" />}
                  {statusType === 'booking_confirmed' && <Download className="w-4 h-4 mr-2" />}
                  {statusType === 'payment_required' ? 'Pay Now' :
                   statusType === 'seat_locked' ? 'Complete Payment' :
                   statusType === 'booking_rejected' ? 'Contact Support' :
                   statusType === 'booking_confirmed' ? 'Download Ticket' : 'Take Action'}
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusNotification;
