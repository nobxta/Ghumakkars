import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  User, 
  Phone, 
  Calendar, 
  Star, 
  CreditCard, 
  CheckCircle,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  QrCode,
  Mail,
  Shield,
  Gift,
  Wallet,
  Percent,
  Timer,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Heart,
  Globe,
  Camera,
  Navigation,
  Plane,
  Car,
  Train,
  Bus
} from 'lucide-react';
import tripService from '../services/tripService';
import bookingService from '../services/bookingService';
import couponService from '../services/couponService';
import paymentSettingsService from '../services/paymentSettingsService';
import { useAuth } from '../contexts/AuthContext';

const BookingPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Trip data
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking steps
  const [step, setStep] = useState(1);
  
  // Contact details
  const [contactDetails, setContactDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  
  // Passengers
  const [passengers, setPassengers] = useState([{
    name: user?.name || '',
    phone: user?.phone || '',
    age: '',
    gender: '',
    college: {
      name: '',
      id: '',
      notPreferToSay: false,
      customCollege: ''
    }
  }]);
  
  // Payment
  const [paymentType, setPaymentType] = useState('full');
  const [transactionId, setTransactionId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  
  // Admin settings
  const [adminSettings, setAdminSettings] = useState({
    paymentQR: null,
    upiId: null,
    merchantName: 'Ghumakkars'
  });
  
  // Loading and submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [tripCountdown, setTripCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [bookingCountdown, setBookingCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  
  // Options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];
  
  const relationshipOptions = [
    'Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Other'
  ];
  
  const collegeOptions = [
    // Mathura Famous Colleges & Universities
    'GLA University', 'Krishna Institute of Engineering and Technology', 'Bharat Institute of Technology',
    'Institute of Engineering and Technology', 'Dayanand College', 'Radha Raman College',
    'Krishna College of Engineering', 'Mathura Institute of Technology', 'Bharat College of Engineering',
    'Krishna Institute of Management', 'Mathura College of Management', 'Bharat Institute of Management',
    'GLA Institute of Technology and Management', 'Krishna College of Pharmacy', 'Bharat College of Pharmacy',
    'Mathura Institute of Pharmacy', 'GLA College of Education', 'Krishna College of Education',
    'Bharat College of Education', 'Mathura Institute of Education', 'GLA College of Law',
    'Krishna College of Law', 'Bharat College of Law', 'Mathura Institute of Law',
    
    // Other Famous Universities
    'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
    'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT Indore', 'IIT Mandi',
    'IIT Patna', 'IIT Ropar', 'IIT Bhubaneswar', 'IIT Gandhinagar', 'IIT Jodhpur',
    'IIT Varanasi', 'IIT Bhilai', 'IIT Goa', 'IIT Jammu', 'IIT Dharwad',
    'DU', 'JNU', 'JMI', 'AMU', 'BHU', 'Other'
  ];

  // Load trip data
  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        console.log('Loading trip with ID:', tripId);
        const response = await tripService.getTripById(tripId);
        console.log('Trip API response:', response);
        
        if (response.success) {
          const tripData = response.data;
          console.log('Trip data:', tripData);
          setTrip(tripData);
          
          // Calculate countdown timers
          const now = new Date();
          const tripStart = new Date(tripData.departureDate);
          // Booking ends 5 days before departure
          const bookingEnd = new Date(tripData.departureDate);
          bookingEnd.setDate(bookingEnd.getDate() - 5);
          
          // Trip countdown
          const tripDiff = tripStart - now;
          if (tripDiff > 0) {
            setTripCountdown({
              days: Math.floor(tripDiff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((tripDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((tripDiff % (1000 * 60 * 60)) / (1000 * 60))
            });
          }
          
          // Booking countdown
          const bookingDiff = bookingEnd - now;
          if (bookingDiff > 0) {
            setBookingCountdown({
              days: Math.floor(bookingDiff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((bookingDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((bookingDiff % (1000 * 60 * 60)) / (1000 * 60))
            });
          }
        } else {
          setError('Failed to load trip details');
        }
        
        // Load admin payment settings from backend
        try {
          const paymentSettingsRes = await paymentSettingsService.getPublicSettings();
          if (paymentSettingsRes.success && paymentSettingsRes.data) {
            setAdminSettings({
              paymentQR: paymentSettingsRes.data.qrCode?.image || null,
              upiId: paymentSettingsRes.data.qrCode?.upiId || null,
              merchantName: paymentSettingsRes.data.qrCode?.merchantName || 'Ghumakkars'
            });
          }
        } catch (err) {
          console.error('Failed to load payment settings:', err);
        }
      } catch (err) {
        setError('Failed to load trip details');
        console.error('Load trip error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  // Calculate amounts
  const calculateAmounts = () => {
    if (!trip) return { totalAmount: 0, seatLockAmount: 0, remainingAmount: 0, originalPrice: 0, currentPrice: 0, referralDiscount: 0 };
    
    // Get current price (considering early bird)
    const isEarlyBirdValid = trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil);
    const currentPrice = isEarlyBirdValid ? trip.earlyBirdPrice : trip.price;
    const originalPrice = trip.originalPrice || trip.price;
    
    const baseAmount = currentPrice * passengers.length;
    let discountAmount = 0;
    
    if (coupon && coupon.discountType === 'percentage') {
      discountAmount = (baseAmount * coupon.discountValue) / 100;
    } else if (coupon && coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }
    
    let totalAmount = Math.max(0, baseAmount - discountAmount);
    
    // Apply referral discount for new users (₹100 off first booking)
    let referralDiscount = 0;
    if (user && user.referredBy && user.tripHistory && user.tripHistory.length === 0) {
      // This is a new user's first booking, apply ₹100 discount
      referralDiscount = Math.min(100, totalAmount);
      totalAmount = Math.max(0, totalAmount - referralDiscount);
    }
    
    // Use trip's seatLockAmount if available, otherwise calculate 20% (matching backend)
    const seatLockAmount = trip.seatLockAmount ? 
      (trip.seatLockAmount * passengers.length) : 
      Math.ceil(totalAmount * 0.2);
    
    const remainingAmount = totalAmount - seatLockAmount;
    
    // Debug logging for frontend calculation
    console.log('Frontend Payment Calculation Debug:', {
      isEarlyBirdValid,
      originalPrice: originalPrice * passengers.length,
      currentPrice: currentPrice * passengers.length,
      totalAmount,
      seatLockAmount,
      remainingAmount,
      passengers: passengers.length,
      tripSeatLockAmount: trip.seatLockAmount,
      referralDiscount
    });
    
    return { 
      totalAmount, 
      seatLockAmount, 
      remainingAmount, 
      originalPrice: originalPrice * passengers.length,
      currentPrice: currentPrice * passengers.length,
      referralDiscount
    };
  };

  const { totalAmount, seatLockAmount, remainingAmount, referralDiscount } = calculateAmounts();

  // Check if can proceed to next step
  const canProceed = () => {
    switch (step) {
      case 1:
        return contactDetails.name && contactDetails.phone && contactDetails.emergencyContact.name && contactDetails.emergencyContact.phone;
      case 2:
        return passengers.every(p => p.name && p.phone && p.age && p.gender && (p.college.notPreferToSay || p.college.name || p.college.customCollege));
      case 3:
        return paymentType && (paymentType === 'full' || paymentType === 'seat_lock');
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (step < 4 && canProceed()) {
      setStep(step + 1);
    } else if (step === 4) {
      handleSubmitBooking();
    }
  };


  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponError('');
      const { totalAmount } = calculateAmounts();
      const couponData = await couponService.applyCoupon(couponCode, tripId, totalAmount);
      setCoupon(couponData);
    } catch (err) {
      setCouponError(err.message);
      setCoupon(null);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');
      
      // Validation
      if (!transactionId.trim()) {
        setSubmitError('Please enter a transaction ID');
        setSubmitting(false);
        return;
      }

      const bookingData = {
        tripId: tripId,
        contactDetails,
        passengers: passengers.map(p => ({
          name: p.name,
          phone: p.phone,
          age: p.age
        })),
        paymentType: paymentType,
        transactionId: transactionId.trim(),
        walletUsedAmount: useWallet ? Math.min(walletAmount, totalAmount) : 0
      };

      // Only add couponCode if there's a coupon
      if (coupon && coupon.code) {
        bookingData.couponCode = coupon.code;
      }

      const booking = await bookingService.createBooking(bookingData);
      
      // Navigate to success page or show success message
      navigate(`/booking-success/${booking._id}`);
      
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Trip not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header - Compact on Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center px-3 sm:px-4 py-2 bg-white/60 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </motion.button>
            <div className="text-center">
              <h1 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Book Trip
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">Step {step} of 4</p>
            </div>
            <div className="w-16 sm:w-24"></div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-8 pb-20 sm:pb-8 relative z-10">

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {[
                { number: 1, title: 'Contact Details', icon: User, description: 'Your information' },
                { number: 2, title: 'Passengers', icon: Users, description: 'Travel companions' },
                { number: 3, title: 'Payment', icon: CreditCard, description: 'Payment method' },
                { number: 4, title: 'Confirmation', icon: CheckCircle, description: 'Review & confirm' }
              ].map((stepInfo, index) => (
                <div key={stepInfo.number} className="flex items-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      step >= stepInfo.number 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-white/60 backdrop-blur-sm text-slate-600 border-2 border-slate-200'
                    }`}
                  >
                    {step >= stepInfo.number ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <stepInfo.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                    {step === stepInfo.number && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full -z-10 opacity-20"
                      />
                    )}
                  </motion.div>
                  <div className="ml-3 hidden lg:block">
                    <div className={`text-sm font-semibold ${
                      step >= stepInfo.number ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {stepInfo.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {stepInfo.description}
                    </div>
                  </div>
                  {stepInfo.number < 4 && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step > stepInfo.number ? '3rem' : '1.5rem' }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`h-1 mx-2 sm:mx-4 rounded-full ${
                        step > stepInfo.number 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                          : 'bg-slate-200'
                      }`} 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
        </motion.div>

        {/* Removed secondary Trip Summary card per request */}

        {/* Step Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-6 lg:p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Contact Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-4 sm:mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3"
                  >
                    <User className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Contact Information</h3>
                  <p className="text-slate-600 text-xs sm:text-base">Your contact details for this booking</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-semibold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={contactDetails.name}
                        onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-base sm:text-lg"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-semibold text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={contactDetails.email}
                        onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-base sm:text-lg"
                        placeholder="Enter your email"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-semibold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={contactDetails.phone}
                        onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-base sm:text-lg"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-slate-200 pt-8"
                >
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 text-blue-500 mr-3" />
                    <h4 className="text-xl font-semibold text-slate-800">Emergency Contact</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Name</label>
                      <input
                        type="text"
                        value={contactDetails.emergencyContact.name}
                        onChange={(e) => setContactDetails({
                          ...contactDetails, 
                          emergencyContact: {...contactDetails.emergencyContact, name: e.target.value}
                        })}
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-lg"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={contactDetails.emergencyContact.phone}
                        onChange={(e) => setContactDetails({
                          ...contactDetails, 
                          emergencyContact: {...contactDetails.emergencyContact, phone: e.target.value}
                        })}
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-lg"
                        placeholder="Emergency contact phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Relationship</label>
                      <select
                        value={contactDetails.emergencyContact.relationship}
                        onChange={(e) => setContactDetails({
                          ...contactDetails, 
                          emergencyContact: {...contactDetails.emergencyContact, relationship: e.target.value}
                        })}
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-lg"
                      >
                        <option value="">Select relationship</option>
                        {relationshipOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            )}

            {/* Step 2: Passengers */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-4 sm:mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3"
                  >
                    <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Passenger Details</h3>
                  <p className="text-slate-600 text-xs sm:text-base">Add details for all passengers traveling with you</p>
                </div>

                {/* Add Passenger Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const newPassenger = {
                        name: '',
                        phone: '',
                        age: '',
                        gender: '',
                        college: { name: '', id: '', notPreferToSay: false, customCollege: '' }
                      };
                      setPassengers([...passengers, newPassenger]);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center mx-auto text-lg"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Add Passenger ({passengers.length})
                  </motion.button>
                </motion.div>

                {/* Passenger Forms */}
                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <h4 className="text-xl font-semibold text-slate-800">Passenger {index + 1}</h4>
                        </div>
                        {passengers.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const newPassengers = passengers.filter((_, i) => i !== index);
                              setPassengers(newPassengers);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="text"
                              value={passenger.name}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].name = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                              placeholder="Enter name"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="tel"
                              value={passenger.phone}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].phone = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                              placeholder="Enter phone"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Age <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="number"
                              value={passenger.age}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].age = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                              placeholder="Enter age"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => {
                              const newPassengers = [...passengers];
                              newPassengers[index].gender = e.target.value;
                              setPassengers(newPassengers);
                            }}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                          >
                            <option value="">Select gender</option>
                            {genderOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <div className="flex items-center mb-4">
                          <Star className="w-5 h-5 text-amber-500 mr-2" />
                          <h5 className="text-lg font-semibold text-slate-800">College Information</h5>
                        </div>
                        
                        <div className="mb-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={passenger.college.notPreferToSay}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].college.notPreferToSay = e.target.checked;
                                if (e.target.checked) {
                                  newPassengers[index].college.name = '';
                                  newPassengers[index].college.id = '';
                                }
                                setPassengers(newPassengers);
                              }}
                              className="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-slate-700 font-medium">Prefer not to say</span>
                          </label>
                        </div>

                        {!passenger.college.notPreferToSay && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">College Name</label>
                              <select
                                value={passenger.college.name}
                                onChange={(e) => {
                                  const newPassengers = [...passengers];
                                  newPassengers[index].college.name = e.target.value;
                                  if (e.target.value !== 'Other') {
                                    newPassengers[index].college.customCollege = '';
                                  }
                                  setPassengers(newPassengers);
                                }}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                              >
                                <option value="">Select college</option>
                                {collegeOptions.map((college) => (
                                  <option key={college} value={college}>{college}</option>
                                ))}
                              </select>
                            </div>
                            
                            {passenger.college.name === 'Other' && (
                              <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Enter College Name</label>
                                <input
                                  type="text"
                                  value={passenger.college.customCollege}
                                  onChange={(e) => {
                                    const newPassengers = [...passengers];
                                    newPassengers[index].college.customCollege = e.target.value;
                                    setPassengers(newPassengers);
                                  }}
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                                  placeholder="Enter your college name"
                                />
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">College ID (Optional)</label>
                              <input
                                type="text"
                                value={passenger.college.id}
                                onChange={(e) => {
                                  const newPassengers = [...passengers];
                                  newPassengers[index].college.id = e.target.value;
                                  setPassengers(newPassengers);
                                }}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                                placeholder="Enter college ID"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Payment Details</h3>
                <p className="text-xs sm:text-base text-gray-600">Choose your payment method and apply coupons</p>
              </div>

              {/* Payment Type */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Payment Type</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentType('full')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors ${
                      paymentType === 'full' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-semibold">Full Payment</div>
                        <div className="text-sm text-gray-600">Pay complete amount now</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentType('seat_lock')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors ${
                      paymentType === 'seat_lock' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-semibold">Seat Lock (30%)</div>
                        <div className="text-sm text-gray-600">Pay 30% now, rest later</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Coupon Code</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter coupon code"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
                  >
                    Apply
                  </button>
                </div>
                
                {couponError && (
                  <p className="text-red-600 text-sm mt-2">{couponError}</p>
                )}
                
                {coupon && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-green-800">{coupon.code}</div>
                        <div className="text-sm text-green-600">
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`
                          }
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h4>
                
                {/* QR Code */}
                {adminSettings.paymentQR ? (
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img 
                        src={adminSettings.paymentQR} 
                        alt="Payment QR Code" 
                        className="w-48 h-48 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-600 mt-2">Scan QR Code to Pay</p>
                      {adminSettings.merchantName && (
                        <p className="text-xs text-gray-500 mt-1">Pay to: {adminSettings.merchantName}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                    <p className="text-sm text-yellow-700">Payment QR code not configured. Please contact admin.</p>
                  </div>
                )}

                {/* UPI ID */}
                {adminSettings.upiId && (
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Or send payment to UPI ID:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono">
                        {adminSettings.upiId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(adminSettings.upiId)}
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction ID Input */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction ID / UTR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID after payment"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 After making the payment, enter the transaction ID/UTR number here
                  </p>
                  {submitError && submitError.includes('transaction') && (
                    <p className="text-sm text-red-500 mt-1">{submitError}</p>
                  )}
                </div>

                {/* Amount Summary */}
                <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Base Amount ({passengers.length} passengers):</span>
                      <span className="font-semibold">₹{trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil) ? trip.earlyBirdPrice * passengers.length : trip.price * passengers.length}</span>
                    </div>
                    
                    {trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil) && trip.originalPrice && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Early Bird Discount:</span>
                        <span className="font-semibold">-₹{(trip.originalPrice - trip.earlyBirdPrice) * passengers.length}</span>
                      </div>
                    )}
                    
                    {coupon && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Coupon Discount ({coupon.code}):</span>
                        <span className="font-semibold">-₹{coupon.discountType === 'percentage' 
                          ? Math.round(((trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil) ? trip.earlyBirdPrice : trip.price) * passengers.length * coupon.discountValue) / 100)
                          : coupon.discountValue
                        }</span>
                      </div>
                    )}
                    
                    {referralDiscount > 0 && (
                      <div className="flex justify-between items-center text-purple-600">
                        <span className="flex items-center">
                          <Gift className="w-4 h-4 mr-1" />
                          Referral Welcome Discount:
                        </span>
                        <span className="font-semibold">-₹{referralDiscount}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">₹{totalAmount}</span>
                      </div>
                      
                      {paymentType === 'seat_lock' && (
                        <>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-slate-600">Seat Lock Amount:</span>
                            <span className="font-semibold text-blue-600">₹{seatLockAmount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Remaining Amount:</span>
                            <span className="font-semibold">₹{remainingAmount}</span>
                          </div>
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">
                              💡 Pay ₹{seatLockAmount} now to secure your seat. Remaining ₹{remainingAmount} to be paid before trip departure.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-4 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Confirm Booking</h3>
                <p className="text-sm sm:text-base text-gray-600">Review your booking details before confirming</p>
              </div>

              {/* Booking Summary */}
              <div className="space-y-6">
                {/* Trip Details */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                  <h4 className="text-lg font-semibold mb-4">Trip Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Trip:</span>
                      <span className="ml-2 font-semibold">{trip.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Route:</span>
                      <span className="ml-2 font-semibold">{trip.startLocation} → {trip.endLocation}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dates:</span>
                      <span className="ml-2 font-semibold">
                        {trip.departureDate ? new Date(trip.departureDate).toLocaleDateString() : '-'} - {trip.returnDate ? new Date(trip.returnDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-semibold">{trip.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Transport:</span>
                      <span className="ml-2 font-semibold">{trip.transportMode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Passengers:</span>
                      <span className="ml-2 font-semibold">{passengers.length}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                  <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-semibold">{contactDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-semibold">{contactDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-semibold">{contactDetails.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                  <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Payment Type:</span>
                      <span className="font-semibold">
                        {paymentType === 'full' ? 'Full Payment' : 'Seat Lock (30%)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount to Pay:</span>
                      <span className="font-semibold text-blue-600">
                        ₹{paymentType === 'full' ? totalAmount : seatLockAmount}
                      </span>
                    </div>
                    {paymentType === 'seat_lock' && (
                      <div className="flex justify-between">
                        <span>Remaining Amount:</span>
                        <span className="font-semibold">₹{remainingAmount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="bg-green-500 text-white px-12 py-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg flex items-center mx-auto"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Confirm Booking
                    </>
                  )}
                </button>
                
                {submitError && (
                  <p className="text-red-600 text-sm mt-4">{submitError}</p>
                )}
              </div>

            </motion.div>
          )}
          </AnimatePresence>
          
        </motion.div>
      </div>

      {/* Desktop Navigation Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden sm:block bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(step - 1)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </motion.button>
              )}
              <div className="text-sm text-gray-500">
                Step {step} of 4
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                canProceed()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 4 ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Floating Sticky Navigation Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-lg z-50 p-4 sm:hidden"
      >
        <div className="flex gap-3 max-w-6xl mx-auto">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 font-semibold flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
              canProceed()
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {step === 4 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
};

export default BookingPage;
