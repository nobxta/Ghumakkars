import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  Star,
  Save,
  CheckCircle,
  UserPlus,
  Sparkles
} from 'lucide-react';

/**
 * Real-time Seat Availability Display Component
 */
export const SeatAvailabilityBanner = ({ seatsData }) => {
  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'critical':
        return {
          bgColor: 'from-red-500 to-rose-600',
          icon: AlertTriangle,
          text: '⚠️ Almost Sold Out!',
          pulseColor: 'bg-red-500',
          message: 'Book now before seats run out!'
        };
      case 'high':
        return {
          bgColor: 'from-orange-500 to-amber-600',
          icon: Zap,
          text: '🔥 Selling Fast!',
          pulseColor: 'bg-orange-500',
          message: 'Limited seats remaining'
        };
      case 'medium':
        return {
          bgColor: 'from-amber-500 to-yellow-600',
          icon: TrendingUp,
          text: '⚡ Filling Up',
          pulseColor: 'bg-amber-500',
          message: 'Book soon to secure your spot'
        };
      default:
        return {
          bgColor: 'from-emerald-500 to-green-600',
          icon: Users,
          text: '✅ Available',
          pulseColor: 'bg-emerald-500',
          message: 'Plenty of seats available'
        };
    }
  };

  const config = getUrgencyConfig(seatsData.urgencyLevel);
  const Icon = config.icon;

  if (seatsData.loading) {
    return (
      <div className="bg-slate-100 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${config.bgColor} rounded-xl p-4 text-white relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
          backgroundSize: '30px 30px' 
        }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`absolute inset-0 ${config.pulseColor} rounded-full animate-ping opacity-75`}></div>
            <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="font-bold text-lg">{config.text}</p>
            <p className="text-sm opacity-90">{config.message}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black">{seatsData.availableSeats}</p>
          <p className="text-xs opacity-90">seats left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 relative">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${seatsData.percentageBooked}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-white/40 rounded-full"
          ></motion.div>
        </div>
        <p className="text-xs mt-1 opacity-90 text-right">
          {seatsData.percentageBooked}% booked
        </p>
      </div>
    </motion.div>
  );
};

/**
 * Draft Booking Save/Resume Component
 */
export const DraftBookingNotification = ({ hasDraft, onLoadDraft, onDismiss }) => {
  if (!hasDraft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-500 rounded-full">
          <Save className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 mb-1">
            💾 Saved Booking Found!
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            We found a saved booking for this trip. Would you like to continue where you left off?
          </p>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoadDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Load Saved Booking
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDismiss}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold"
            >
              Start Fresh
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Auto-save Indicator
 */
export const AutoSaveIndicator = ({ isSaving, lastSaved }) => {
  if (isSaving) {
    return (
      <div className="flex items-center space-x-2 text-blue-600 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center space-x-2 text-emerald-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
};

/**
 * Passenger Template Selector
 */
export const PassengerTemplateSelector = ({ templates, onSelectTemplate }) => {
  if (!templates || templates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4"
    >
      <h5 className="font-semibold text-purple-900 mb-3 flex items-center">
        <Sparkles className="w-4 h-4 mr-2" />
        Quick Add Passengers
      </h5>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTemplate(template)}
            className="px-4 py-2 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-sm font-medium text-purple-800"
          >
            {template.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Booking Countdown Timer
 */
export const BookingCountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(deadline));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  function calculateTimeLeft(targetDate) {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  if (!timeLeft) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-center">
        <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
        <p className="font-bold text-red-800">Booking Deadline Passed</p>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`${
        isUrgent 
          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
          : 'bg-gradient-to-r from-amber-500 to-orange-600'
      } rounded-xl p-4 text-white text-center relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
          backgroundSize: '25px 25px' 
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 mr-2" />
          <p className="font-semibold text-sm">Booking Closes In</p>
        </div>
        <div className="flex justify-center space-x-4">
          {timeLeft.days > 0 && (
            <div>
              <p className="text-3xl font-black">{timeLeft.days}</p>
              <p className="text-xs opacity-90">Days</p>
            </div>
          )}
          <div>
            <p className="text-3xl font-black">{timeLeft.hours}</p>
            <p className="text-xs opacity-90">Hours</p>
          </div>
          <div>
            <p className="text-3xl font-black">{timeLeft.minutes}</p>
            <p className="text-xs opacity-90">Mins</p>
          </div>
          {isUrgent && (
            <div>
              <p className="text-3xl font-black">{timeLeft.seconds}</p>
              <p className="text-xs opacity-90">Secs</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Quick Rebook from Previous Booking
 */
export const QuickRebookBanner = ({ previousBooking, onQuickRebook }) => {
  if (!previousBooking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-500 rounded-full">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 mb-1">
              ⚡ Quick Rebook
            </h4>
            <p className="text-sm text-emerald-700 mb-2">
              Use details from your previous trip to {previousBooking.trip?.destination || 'this location'}
            </p>
            <p className="text-xs text-emerald-600">
              {previousBooking.passengers?.length || 1} passenger(s) • {previousBooking.contactDetails?.name}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onQuickRebook}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold whitespace-nowrap"
        >
          Use These Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default {
  SeatAvailabilityBanner,
  DraftBookingNotification,
  AutoSaveIndicator,
  PassengerTemplateSelector,
  BookingCountdownTimer,
  QuickRebookBanner
};

