import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Timer,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';

const BookingStatusTimeline = ({ booking, currentStatus }) => {
  const getStatusSteps = (booking) => {
    const steps = [
      {
        id: 'booked',
        title: 'Booking Created',
        description: 'Your booking request has been submitted',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200'
      }
    ];

    if (booking.payment.paymentType === 'seat_lock') {
      steps.push({
        id: 'seat_locked',
        title: 'Seat Locked',
        description: 'Your seat has been reserved with partial payment',
        icon: CreditCard,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200'
      });
    }

    steps.push(
      {
        id: 'payment_verified',
        title: 'Payment Verified',
        description: 'Your payment has been verified and processed',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-200'
      },
      {
        id: 'confirmed',
        title: 'Booking Confirmed',
        description: 'Your trip is confirmed and ready to go!',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      }
    );

    return steps;
  };

  const getCurrentStepIndex = (status, paymentStatus) => {
    const statusMap = {
      'pending': paymentStatus === 'verified' ? 2 : 1,
      'confirmed': 3,
      'cancelled': -1,
      'completed': 3
    };
    return statusMap[status] || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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

  const steps = getStatusSteps(booking);
  const currentStepIndex = getCurrentStepIndex(booking.status, booking.payment.paymentStatus);
  const isExpired = booking.payment.paymentType === 'seat_lock' && 
                   booking.payment.seatLockExpiry && 
                   new Date() > new Date(booking.payment.seatLockExpiry);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Booking Progress</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            booking.status === 'confirmed' ? 'bg-emerald-500' :
            booking.status === 'cancelled' ? 'bg-red-500' :
            isExpired ? 'bg-gray-500' : 'bg-amber-500 animate-pulse'
          }`} />
          <span className="text-sm font-medium text-slate-600">
            {booking.status === 'confirmed' ? 'Active' :
             booking.status === 'cancelled' ? 'Cancelled' :
             isExpired ? 'Expired' : 'In Progress'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const isCancelled = booking.status === 'cancelled';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? `${step.bgColor} ${step.borderColor}` :
                  isCurrent ? `${step.bgColor} ${step.borderColor} ring-4 ring-opacity-50` :
                  isCancelled ? 'bg-red-100 border-red-200' :
                  'bg-gray-100 border-gray-200'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isCompleted ? step.color :
                    isCurrent ? step.color :
                    isCancelled ? 'text-red-600' :
                    'text-gray-400'
                  }`} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-16 mt-2 ${
                    isCompleted ? 'bg-emerald-300' :
                    isCancelled ? 'bg-red-300' :
                    'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-semibold ${
                    isCompleted ? 'text-slate-800' :
                    isCurrent ? 'text-slate-800' :
                    isCancelled ? 'text-red-800' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    {isCancelled && index === currentStepIndex && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <p className={`text-sm mt-1 ${
                  isCompleted ? 'text-slate-600' :
                  isCurrent ? 'text-slate-600' :
                  isCancelled ? 'text-red-600' :
                  'text-gray-400'
                }`}>
                  {step.description}
                </p>

                {/* Status Specific Information */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    {step.id === 'seat_locked' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <Timer className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Seat Lock Expires</p>
                            <p className="text-sm text-amber-700">
                              {formatDate(booking.payment.seatLockExpiry)} • 
                              Remaining: {formatCurrency(booking.payment.remainingAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.id === 'payment_verified' && booking.status === 'pending' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Awaiting Admin Approval</p>
                            <p className="text-sm text-blue-700">
                              Your payment is verified. Admin will confirm your booking soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.status === 'cancelled' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Booking Cancelled</p>
                            <p className="text-sm text-red-700">
                              Your booking has been cancelled. Contact support for assistance.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isExpired && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Seat Lock Expired</p>
                            <p className="text-sm text-gray-700">
                              Your seat reservation has expired. Please contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Timestamps */}
                <div className="mt-3 text-xs text-gray-500">
                  {step.id === 'booked' && (
                    <span>Booked on {formatDate(booking.bookingDate)}</span>
                  )}
                  {step.id === 'seat_locked' && booking.payment.paymentType === 'seat_lock' && (
                    <span>Locked on {formatDate(booking.bookingDate)}</span>
                  )}
                  {step.id === 'payment_verified' && booking.payment.paymentStatus === 'verified' && (
                    <span>Verified on {formatDate(booking.bookingDate)}</span>
                  )}
                  {step.id === 'confirmed' && booking.status === 'confirmed' && (
                    <span>Confirmed on {formatDate(booking.adminApproval?.approvedAt || booking.bookingDate)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-slate-200"
      >
        <div className="flex flex-wrap gap-3">
          {booking.status === 'pending' && booking.payment.paymentType === 'seat_lock' && !isExpired && (
            <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors text-sm font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Payment
            </button>
          )}
          
          {booking.status === 'confirmed' && (
            <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </button>
          )}
          
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingStatusTimeline;
