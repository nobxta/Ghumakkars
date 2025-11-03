import React, { useState, useEffect, useMemo } from 'react';
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
import userService from '../services/userService';
import razorpayService from '../services/razorpayService';
import { useAuth } from '../contexts/AuthContext';
import useMaintenanceCheck from '../hooks/useMaintenanceCheck';
import MaintenancePopup from './MaintenancePopup';

const BookingPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMaintenanceMode, maintenanceData, handleMaintenanceAction } = useMaintenanceCheck();
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  
  // Trip data
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Wallet balance (fetched separately)
  const [walletBalance, setWalletBalance] = useState(0);
  
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
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // Admin settings
  const [adminSettings, setAdminSettings] = useState({
    paymentQR: null,
    upiId: null,
    merchantName: 'Ghumakkars',
    paymentMode: 'manual_qr', // or 'razorpay'
    razorpayKeyId: null // Will be set from API response
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

  // Load user profile data to pre-fill booking form
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const [profileResponse, walletResponse] = await Promise.all([
          userService.getProfile(),
          userService.getWallet().catch((err) => {
            console.log('Error fetching wallet:', err);
            return { balance: 0, transactions: [] };
          })
        ]);
        
        // Set wallet balance
        console.log('📦 Wallet API response:', walletResponse);
        console.log('📦 Profile response stats:', profileResponse?.stats);
        const balance = walletResponse?.balance || profileResponse?.stats?.walletBalance || 0;
        setWalletBalance(balance);
        console.log('✅ Wallet balance set to:', balance);
        
        if (profileResponse && profileResponse.user) {
          const profile = profileResponse.user;
          
          // Build full name from firstName and lastName
          const fullName = profile.firstName 
            ? `${profile.firstName} ${profile.lastName || ''}`.trim()
            : profile.name || '';
          
          // Calculate age from date of birth if available
          let age = '';
          if (profile.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(profile.dateOfBirth);
            age = (today.getFullYear() - birthDate.getFullYear()).toString();
          }
          
          // Pre-fill contact details
          setContactDetails({
            name: fullName,
            email: profile.email || '',
            phone: profile.phone || '',
            emergencyContact: {
              name: profile.emergencyContact?.name || '',
              phone: profile.emergencyContact?.phone || '',
              relationship: profile.emergencyContact?.relationship || ''
            }
          });
          
          // Pre-fill first passenger
          setPassengers([{
            name: fullName,
            phone: profile.phone || '',
            age: age,
            gender: profile.gender || '',
            college: {
              name: profile.collegeName || '',
              id: profile.collegeId || '',
              notPreferToSay: false,
              customCollege: ''
            }
          }]);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    
    loadUserProfile();
  }, [user]);

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
              merchantName: paymentSettingsRes.data.qrCode?.merchantName || 'Ghumakkars',
              paymentMode: paymentSettingsRes.data.paymentMode || 'manual_qr',
              razorpayKeyId: paymentSettingsRes.data.razorpayKeyId || null
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

  /**
   * Smart Payment Calculator
   * Calculates payment amounts based on base price, seat lock price, discount, and payment type
   * @param {number} basePrice - Total trip price before discounts
   * @param {number} seatLockPrice - Amount required to lock a seat
   * @param {string} paymentType - 'full' or 'seat_lock'
   * @param {string} discountType - 'percentage' or 'flat'
   * @param {number} discountValue - Discount amount
   * @param {string} seatLockMode - 'fixed' or 'auto-adjust' (default: 'auto-adjust')
   */
  const calculatePaymentAmounts = (basePrice, seatLockPrice, paymentType, discountType, discountValue, seatLockMode = 'auto-adjust') => {
    // Step 1: Calculate discount amount
    let discountAmount = 0;
    if (discountValue > 0) {
      if (discountType === 'percentage') {
        discountAmount = (basePrice * discountValue) / 100;
      } else if (discountType === 'flat') {
        discountAmount = Math.min(discountValue, basePrice); // Don't exceed base price
      }
    }
    
    // Step 2: Calculate discounted total
    const discountedTotal = Math.max(0, basePrice - discountAmount);
    
    // Step 3: Handle based on payment type
    let seatLockToPay = 0;
    let remainingToPay = 0;
    let finalAmountToPay = 0;
    
    if (paymentType === 'full') {
      // Full payment: Pay the entire discounted amount
      finalAmountToPay = discountedTotal;
      seatLockToPay = 0;
      remainingToPay = 0;
    } else {
      // Seat lock payment
      if (seatLockMode === 'fixed') {
        // Fixed mode: seat lock price never changes
        seatLockToPay = Math.min(seatLockPrice, discountedTotal);
        remainingToPay = Math.max(0, discountedTotal - seatLockToPay);
      } else {
        // Auto-adjust mode: smart logic
        if (discountedTotal >= seatLockPrice) {
          // Normal case: discount doesn't affect seat lock
          seatLockToPay = seatLockPrice;
          remainingToPay = discountedTotal - seatLockPrice;
        } else {
          // Discount reduced total below seat lock price
          // User only pays the discounted total amount
          seatLockToPay = discountedTotal;
          remainingToPay = 0;
        }
      }
      
      // Amount to pay now is the seat lock amount
      finalAmountToPay = seatLockToPay;
    }
    
    return {
      basePrice,
      discountedTotal,
      discountAmount,
      discountType,
      discountValue,
      seatLockToPay,
      remainingToPay,
      finalAmountToPay,
      totalDiscount: discountAmount
    };
  };

  // Calculate amounts
  const calculateAmounts = () => {
    if (!trip) return { totalAmount: 0, seatLockAmount: 0, remainingAmount: 0, originalPrice: 0, currentPrice: 0, referralDiscount: 0, couponDiscount: 0 };
    
    // Get current price (considering early bird)
    const isEarlyBirdValid = trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil);
    const currentPrice = isEarlyBirdValid ? trip.earlyBirdPrice : trip.price;
    const originalPrice = trip.originalPrice || trip.price;
    
    const basePrice = currentPrice * passengers.length;
    
    // Calculate seat lock price (per passenger basis)
    const seatLockPrice = trip.seatLockAmount ? 
      (trip.seatLockAmount * passengers.length) : 
      Math.ceil(basePrice * 0.2);
    
    // Calculate referral discount (for new users - ₹100 off first booking)
    let referralDiscount = 0;
    if (user && user.referredBy && user.tripHistory && user.tripHistory.length === 0) {
      referralDiscount = Math.min(100, basePrice);
    }
    
    // Amount after referral discount
    const amountAfterReferral = Math.max(0, basePrice - referralDiscount);
    
    // Determine coupon discount type and value
    let discountType = null;
    let discountValue = 0;
    
    if (coupon && coupon.discountValue) {
      discountType = coupon.discountType === 'percentage' ? 'percentage' : 'flat';
      discountValue = coupon.discountValue;
    }
    
    // Apply early bird discount as a percentage discount
    let earlyBirdDiscount = 0;
    if (isEarlyBirdValid && trip.originalPrice) {
      const earlyBirdDiscountPercent = ((trip.originalPrice - trip.earlyBirdPrice) / trip.originalPrice) * 100;
      if (earlyBirdDiscountPercent > 0) {
        discountType = 'percentage';
        discountValue = discountValue + earlyBirdDiscountPercent;
      }
    }
    
    // Calculate payment amounts using smart calculator
    const paymentCalc = calculatePaymentAmounts(
      amountAfterReferral,
      seatLockPrice,
      paymentType || 'full',
      discountType || 'flat',
      discountValue,
      'auto-adjust' // Can be made configurable by admin
    );
    
    // Calculate coupon discount for display
    let couponDiscount = 0;
    if (coupon && coupon.discountValue && amountAfterReferral > 0) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = (amountAfterReferral * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'flat') {
        couponDiscount = Math.min(coupon.discountValue, amountAfterReferral);
      }
    }
    
    // Debug logging
    console.log('Payment Calculation Debug:', {
      basePrice,
      seatLockPrice,
      referralDiscount,
      couponDiscount,
      paymentType: paymentType || 'full',
      discountType,
      discountValue,
      paymentCalc
    });
    
    return {
      ...paymentCalc,
      originalPrice: originalPrice * passengers.length,
      currentPrice: currentPrice * passengers.length,
      referralDiscount,
      couponDiscount,
      seatLockAmount: paymentCalc.seatLockToPay,
      remainingAmount: paymentCalc.remainingToPay,
      totalAmount: paymentCalc.discountedTotal
    };
  };

  // Memoize payment calculations
  const amounts = useMemo(() => {
    const paymentCalc = calculateAmounts();
    
    return {
      ...paymentCalc,
      paidAmount: paymentCalc.finalAmountToPay,
      baseAmount: paymentCalc.basePrice,
      totalAmount: paymentCalc.discountedTotal,
      seatLockAmount: paymentCalc.seatLockToPay,
      remainingAmount: paymentCalc.remainingToPay,
      // Keep old field names for backward compatibility
      referralDiscount: paymentCalc.referralDiscount || 0,
      couponDiscount: paymentCalc.couponDiscount || 0
    };
  }, [trip, passengers.length, coupon, paymentType]);

  // Check if can proceed to next step
  const canProceed = () => {
    switch (step) {
      case 1:
        return contactDetails.name && contactDetails.phone && contactDetails.emergencyContact.name && contactDetails.emergencyContact.phone;
      case 2:
        return passengers.every(p => {
          const age = parseInt(p.age);
          return p.name && p.phone && p.age && age >= 15 && p.gender && (p.college.notPreferToSay || p.college.name || p.college.customCollege);
        });
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
      const result = await couponService.applyCoupon(couponCode, tripId, totalAmount);
      
      // Set coupon with proper data structure
      if (result.success && result.data) {
        setCoupon({
          code: result.data.coupon.code,
          discountType: result.data.coupon.type, // 'percentage' or 'fixed'
          discountValue: result.data.coupon.value,
          discountAmount: result.data.discountAmount,
          finalAmount: result.data.finalAmount,
          description: result.data.coupon.description
        });
      } else {
        throw new Error('Failed to apply coupon');
      }
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
    // Check maintenance mode before allowing booking
    const maintenanceCheck = handleMaintenanceAction(() => {});
    if (maintenanceCheck.blocked) {
      setShowMaintenancePopup(true);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      
      // Validation - Only require transaction ID for manual QR payment mode
      // NOT required for Razorpay (handled via webhook) or free bookings
      if (adminSettings.paymentMode === 'manual_qr' && !transactionId.trim() && amounts.paidAmount > 0) {
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
          age: p.age,
          gender: p.gender || '',
          college: p.college || { name: '', id: '', notPreferToSay: false }
        })),
        paymentType: paymentType,
        transactionId: transactionId.trim() || (amounts.paidAmount <= 0 ? 'free_booking' : 'auto_confirmed'),
        walletUsedAmount: useWallet ? Math.min(walletAmount, amounts.discountedTotal) : 0,
        specialRequirements: specialRequirements || ''
      };

      // Add coupon and referral discounts
      if (amounts.couponDiscount > 0) {
        bookingData.couponDiscount = amounts.couponDiscount;
      }
      if (amounts.referralDiscount > 0) {
        bookingData.referralDiscount = amounts.referralDiscount;
      }
      if (coupon && coupon.code) {
        bookingData.couponCode = coupon.code;
      }

      // For manual QR payments, we need to create the booking directly
      // The prebook endpoint is only for Razorpay flow
      const booking = await bookingService.createBooking(bookingData);
      
      console.log('Booking response:', booking);
      
      // Navigate to success page or show success message
      // Check if booking has an _id or bookingId field
      const bookingId = booking._id || booking.bookingId || booking.booking?._id;
      if (bookingId) {
        navigate(`/booking-success/${bookingId}`);
      } else {
        // If no booking ID, just show success message or navigate to bookings list
        console.error('No booking ID in response:', booking);
        navigate('/my-trips');
      }
      
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
                              min="15"
                              value={passenger.age}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                const ageValue = e.target.value;
                                // Only allow values >= 15
                                if (ageValue === '' || parseInt(ageValue) >= 15) {
                                  newPassengers[index].age = ageValue;
                                  setPassengers(newPassengers);
                                }
                              }}
                              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                              placeholder="Enter age (min: 15)"
                            />
                          </div>
                          {passenger.age && parseInt(passenger.age) < 15 && (
                            <p className="text-xs text-red-500 mt-1">
                              ⚠️ Minimum age is 15 years. You must be at least 15 years old to book.
                            </p>
                          )}
                          {(!passenger.age || parseInt(passenger.age) >= 15) && (
                            <p className="text-xs text-gray-500 mt-1">
                              Minimum age required: 15 years
                            </p>
                          )}
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

              {/* Payment Type - Enhanced Design */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Payment Options</h4>
                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                    {passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}
                  </div>
                </div>
                
                {/* Check if discounted total is less than seat lock amount */}
                {(() => {
                  const seatLockPrice = trip.seatLockAmount 
                    ? (trip.seatLockAmount * passengers.length)
                    : Math.ceil(amounts.baseAmount * 0.2);
                  const isDiscountTooHigh = amounts.discountedTotal < seatLockPrice && amounts.discountedTotal > 0;
                  
                  // Auto-switch to full payment if discount makes seat lock impossible
                  if (isDiscountTooHigh && paymentType === 'seat_lock' && paymentType !== 'full') {
                    setTimeout(() => setPaymentType('full'), 0);
                  }
                  
                  const showSeatLock = !isDiscountTooHigh;
                  
                  return (
                    <>
                      {/* Info banner if discount is too high */}
                      {isDiscountTooHigh && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-4"
                        >
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-800 mb-1">
                                Amazing! Your discount is greater than the seat lock amount
                              </p>
                              <p className="text-xs text-green-700">
                                With your discount, you only need to pay ₹{Math.round(amounts.discountedTotal)}. Full payment is required.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div className={`grid gap-4 ${showSeatLock ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentType('full')}
                    className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                      paymentType === 'full' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                        : 'border-gray-300 hover:border-blue-300 hover:shadow-md bg-white'
                    }`}
                  >
                    {paymentType === 'full' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${paymentType === 'full' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <CreditCard className={`w-6 h-6 ${paymentType === 'full' ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-lg mb-1 ${paymentType === 'full' ? 'text-blue-700' : 'text-gray-800'}`}>
                          Full Payment
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Pay complete amount now and get instant confirmation
                        </div>
                        <div className={`text-xs font-semibold ${paymentType === 'full' ? 'text-blue-700' : 'text-gray-500'}`}>
                          ₹{Math.round(amounts.discountedTotal)}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                  
                  {showSeatLock && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentType('seat_lock')}
                      className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        paymentType === 'seat_lock' 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                          : 'border-gray-300 hover:border-blue-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {paymentType === 'seat_lock' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${paymentType === 'seat_lock' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Clock className={`w-6 h-6 ${paymentType === 'seat_lock' ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-lg mb-1 ${paymentType === 'seat_lock' ? 'text-blue-700' : 'text-gray-800'}`}>
                            Reserve Seat
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Pay a portion now, balance before trip
                          </div>
                          <div className="text-xs space-y-1">
                            <div className={`font-semibold ${paymentType === 'seat_lock' ? 'text-blue-700' : 'text-gray-500'}`}>
                              Now: ₹{Math.round(amounts.seatLockToPay)}
                            </div>
                            <div className="text-gray-500">
                              Later: ₹{Math.round(amounts.remainingAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )}
                      </div>
                    </>
                  );
                })()}
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

              {/* Payment Method Instructions - Clean & Premium */}
              {adminSettings.paymentMode === 'razorpay' ? (
                /* Razorpay Mode - Minimal & Premium */
                <div className="border-t pt-8">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Secure Payment Gateway
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Click "Pay Now" below to complete your booking
                    </p>
                    
                    {/* Minimal Features */}
                    <div className="flex items-center justify-center gap-6 mb-6 text-xs text-gray-500">
                      <Shield className="w-4 h-4" /> Secure
                      <Zap className="w-4 h-4" /> Instant
                      <CheckCircle className="w-4 h-4" /> Confirmed
                    </div>
                  </div>
                </div>
              ) : (
                /* QR Code Payment - Clean & Minimal */
                <div className="border-t pt-8">
                  {adminSettings.paymentQR ? (
                    <div className="max-w-md mx-auto">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan to Pay</h3>
                        <p className="text-sm text-gray-600">Use any UPI app to complete payment</p>
                      </div>
                      
                      {/* QR Code */}
                      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 mb-6">
                        <img 
                          src={adminSettings.paymentQR} 
                          alt="Payment QR" 
                          className="w-full max-w-xs mx-auto object-contain"
                        />
                      </div>
                      
                      {/* UPI ID */}
                      {adminSettings.upiId && (
                        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
                          <p className="text-xs text-gray-600 mb-2">Or send to:</p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="bg-white px-4 py-2 rounded-lg font-mono text-sm font-semibold border border-blue-200">
                              {adminSettings.upiId}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(adminSettings.upiId);
                                alert('UPI ID copied!');
                              }}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Transaction ID */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter after payment"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-yellow-50 rounded-xl">
                      <AlertCircle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
                      <p className="text-sm text-yellow-700">Payment QR not configured</p>
                    </div>
                  )}
                </div>
              )}

            {/* Enhanced Payment Summary Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Payment Summary</h4>
                      <p className="text-sm text-blue-100">{passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Base Price */}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    Base Amount
                  </span>
                  <span className="text-lg font-bold text-gray-800">₹{Math.round(amounts.baseAmount)}</span>
                </div>
                
                {/* Discounts Section */}
                <div className="space-y-2">
                  {trip.isEarlyBird && trip.earlyBirdValidUntil && new Date() <= new Date(trip.earlyBirdValidUntil) && trip.originalPrice && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                    >
                      <span className="flex items-center text-amber-700 font-medium">
                        <Star className="w-4 h-4 mr-2 text-amber-500" />
                        Early Bird Discount
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm line-through text-amber-500">₹{Math.round((trip.originalPrice) * passengers.length)}</span>
                        <span className="font-bold text-amber-700">-₹{Math.round((trip.originalPrice - trip.earlyBirdPrice) * passengers.length)}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {coupon && coupon.code && amounts.couponDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    >
                      <span className="flex items-center text-green-700 font-medium">
                        <Percent className="w-4 h-4 mr-2 text-green-500" />
                        Coupon {coupon.code}
                      </span>
                      <span className="font-bold text-green-700">-₹{Math.round(amounts.couponDiscount)}</span>
                    </motion.div>
                  )}
                  
                  {amounts.referralDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                    >
                      <span className="flex items-center text-purple-700 font-medium">
                        <Gift className="w-4 h-4 mr-2 text-purple-500" />
                        Welcome Bonus
                      </span>
                      <span className="font-bold text-purple-700">-₹{Math.round(amounts.referralDiscount)}</span>
                    </motion.div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-blue-100">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">₹{Math.round(amounts.discountedTotal)}</div>
                      {amounts.baseAmount > amounts.discountedTotal && (
                        <span className="text-xs text-gray-500 line-through">₹{Math.round(amounts.baseAmount)}</span>
                      )}
                    </div>
                  </div>
                  
                  {paymentType === 'seat_lock' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-semibold">Pay Now</span>
                          <span className="text-2xl font-bold text-blue-600">₹{Math.round(amounts.seatLockToPay)}</span>
                        </div>
                        <div className="h-px bg-blue-200"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Remaining Balance</span>
                          <span className="font-semibold text-gray-700">₹{Math.round(amounts.remainingToPay)}</span>
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-blue-600 flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            Remaining amount to be paid before trip departure
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Wallet Usage Toggle - Show always but disabled if no balance */}
              <div className={`rounded-xl p-6 border-2 ${walletBalance > 0 && amounts.finalAmountToPay > 0 ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Use Wallet Balance</h4>
                        <p className="text-sm text-gray-600">
                          {walletBalance > 0 ? `Available: ₹${walletBalance}` : 'No wallet balance'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Debug: Balance = ₹{walletBalance}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        disabled={walletBalance === 0}
                        onChange={(e) => {
                          setUseWallet(e.target.checked);
                          if (e.target.checked) {
                            setWalletAmount(Math.min(walletBalance, amounts.finalAmountToPay));
                          } else {
                            setWalletAmount(0);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 ${walletBalance > 0 && amounts.finalAmountToPay > 0 ? 'peer-checked:bg-emerald-600' : 'opacity-50 cursor-not-allowed'}`}></div>
                    </label>
                  </div>
                  
                  {useWallet && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 mt-4"
                    >
                      <div className="bg-white rounded-lg p-4 border border-emerald-200">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold">₹{Math.round(amounts.finalAmountToPay)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-emerald-600">Wallet Used:</span>
                          <span className="font-bold text-emerald-600">-₹{walletAmount}</span>
                        </div>
                        <div className="h-px bg-emerald-200 my-2"></div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Final Amount:</span>
                          <span className="text-emerald-600">
                            ₹{Math.round(amounts.finalAmountToPay - walletAmount)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

              {/* Final Amount Card */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100 font-medium uppercase tracking-wide">
                      {paymentType === 'full' ? 'Total Payment Required' : 'Payment Now'}
                    </p>
                    {paymentType === 'seat_lock' && (
                      <p className="text-xs text-blue-200 mt-1">Seat Reservation Fee</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold text-white mb-1">
                      ₹{Math.round(amounts.finalAmountToPay - (useWallet ? walletAmount : 0))}
                    </div>
                    {paymentType === 'seat_lock' && amounts.remainingToPay > 0 && (
                      <p className="text-xs text-blue-200">
                        + ₹{Math.round(amounts.remainingToPay)} later
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="mt-4 pt-4 border-t border-blue-500/30">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {paymentType === 'full' 
                        ? 'Your booking will be confirmed immediately' 
                        : `Secure your seat - Pay balance before departure`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* No navigation buttons here - handled by bottom sticky buttons */}
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && !amounts && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </div>
        )}
        {step === 4 && amounts && (
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
                      <span className="ml-2 font-semibold">{trip.duration || `${trip.nights || 0} Nights ${trip.days || 1} Days`}</span>
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
                        ₹{Math.round(paymentType === 'full' ? amounts.discountedTotal : amounts.seatLockToPay)}
                      </span>
                    </div>
                    {paymentType === 'seat_lock' && amounts.remainingToPay > 0 && (
                      <div className="flex justify-between">
                        <span>Remaining Amount:</span>
                        <span className="font-semibold">₹{Math.round(amounts.remainingToPay)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button - Only for Manual QR or Free Bookings */}
              {adminSettings.paymentMode === 'manual_qr' && (
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
              )}
              
              {/* Info for Razorpay - booking already confirmed */}
              {adminSettings.paymentMode === 'razorpay' && (
                <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Booking Already Confirmed!</h4>
                  <p className="text-green-700">Your payment was processed successfully. No further action needed.</p>
                </div>
              )}

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
            
            {/* Step 3: Payment - Razorpay opens modal, QR shows continue to Step 4 */}
            {step === 3 ? (
              adminSettings.paymentMode === 'razorpay' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRazorpayModal(true)}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pay Now</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(4)}
                  disabled={amounts.paidAmount > 0 && !transactionId.trim()}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    (amounts.paidAmount > 0 && !transactionId.trim())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )
            ) : (
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
            )}
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
          
          {/* Step 3: Payment - Razorpay opens modal, QR shows continue to Step 4 */}
          {step === 3 ? (
            adminSettings.paymentMode === 'razorpay' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRazorpayModal(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay Now</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(4)}
                disabled={amounts.paidAmount > 0 && !transactionId.trim()}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
                  (amounts.paidAmount > 0 && !transactionId.trim())
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            )
          ) : (
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
          )}
        </div>
      </motion.div>

      {/* Razorpay Payment Modal with Glass Blur Background */}
      <AnimatePresence>
        {showRazorpayModal && adminSettings.paymentMode === 'razorpay' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Glass blurred overlay */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-6 border border-white/20"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowRazorpayModal(false);
                  setIsPaymentProcessing(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Payment
                </h3>
                <p className="text-gray-600">
                  {useWallet && walletAmount > 0 ? (
                    <>
                      Amount: <span className="font-bold text-purple-600">₹{Math.round(amounts.finalAmountToPay - walletAmount)}</span>
                      <br />
                      <span className="text-sm">(₹{Math.round(amounts.finalAmountToPay)} - ₹{walletAmount} wallet)</span>
                    </>
                  ) : (
                    <>Total Amount: <span className="font-bold text-purple-600">₹{Math.round(amounts.finalAmountToPay)}</span></>
                  )}
                </p>
              </div>

              {/* Payment status indicator */}
              {isPaymentProcessing ? (
                <div className="py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 font-medium">Processing your payment...</p>
                    <p className="text-sm text-gray-500">Please wait while we confirm your transaction</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setIsPaymentProcessing(true);
                      
                      // Check if amount is 0 or less - handle separately
                      if (amounts.paidAmount <= 0) {
                        const bookingData = {
                          tripId: trip._id,
                          contactDetails,
                          passengers,
                          paymentType: paymentType,
                          transactionId: 'free_booking',
                          specialRequirements,
                          couponCode: coupon?.code || null,
                          walletUsedAmount: walletAmount,
                          couponDiscount: coupon && coupon.discountType === 'percentage' 
                            ? Math.round((amounts.baseAmount * coupon.discountValue) / 100)
                            : (coupon?.discountValue || 0),
                          referralDiscount: amounts.referralDiscount
                        };

                        const result = await bookingService.createBooking(bookingData);
                        if (result.success) {
                          navigate(`/booking-success/${result.bookingId}`);
                        }
                        setShowRazorpayModal(false);
                        setIsPaymentProcessing(false);
                        return;
                      }
                      
                      console.log('🚀 Starting Razorpay payment flow...');
                      
                      // Step 1: Create pre-booking
                      const prebookData = {
                        tripId: trip._id,
                        contactDetails,
                        passengers: passengers.map(p => ({
                          name: p.name,
                          phone: p.phone,
                          age: p.age,
                          gender: p.gender || '',
                          college: p.college || { name: '', id: '', notPreferToSay: false }
                        })),
                        paymentType,
                        couponCode: coupon?.code,
                        walletUsedAmount: walletAmount,
                        specialRequirements: specialRequirements || '',
                        couponDiscount: amounts.couponDiscount,
                        referralDiscount: amounts.referralDiscount
                      };
                      
                      console.log('📦 Creating pre-booking...', prebookData);
                      const prebookResponse = await bookingService.prebook(prebookData);
                      
                      if (!prebookResponse.success) {
                        throw new Error('Failed to create pre-booking');
                      }
                      
                      const bookingId = prebookResponse.bookingId;
                      console.log('✅ Pre-booking created:', bookingId);
                      
                      // Step 2: Create Razorpay order with bookingId
                      // Calculate final amount after wallet deduction
                      const finalAmount = Math.max(amounts.finalAmountToPay - walletAmount, 0);
                      
                      const orderResponse = await razorpayService.createOrder(
                        finalAmount, 
                        trip._id,
                        bookingId
                      );
                      
                      if (!orderResponse.success) {
                        throw new Error('Failed to create payment order');
                      }

                      console.log('✅ Razorpay order created:', orderResponse.order.id);

                      // Step 3: Open Razorpay checkout
                      await razorpayService.openCheckout(
                        orderResponse.order,
                        contactDetails,
                        orderResponse.keyId || adminSettings.razorpayKeyId,
                        async (razorpayResponse) => {
                          console.log('💰 Razorpay payment successful!', razorpayResponse);
                          alert('✅ Payment received! Verifying payment...');
                          
                          // Close modal first
                          setShowRazorpayModal(false);
                          
                          try {
                            console.log('🔍 Verifying payment with:', {
                              orderId: razorpayResponse.razorpay_order_id,
                              paymentId: razorpayResponse.razorpay_payment_id,
                              signature: razorpayResponse.razorpay_signature ? 'present' : 'missing'
                            });

                            const verifyResponse = await razorpayService.verifyPayment(
                              razorpayResponse.razorpay_order_id,
                              razorpayResponse.razorpay_payment_id,
                              razorpayResponse.razorpay_signature
                            );

                            console.log('✅ verifyResponse:', verifyResponse);

                            if (verifyResponse.success && verifyResponse.bookingId) {
                              console.log('🎉 Payment verified, navigating to success page with booking ID:', verifyResponse.bookingId);
                              alert('✅ Booking confirmed! Redirecting to success page...');
                              setTimeout(() => {
                                navigate(`/booking-success/${verifyResponse.bookingId}`);
                              }, 300);
                            } else {
                              console.error('❌ Payment verification failed:', verifyResponse);
                              alert('⚠️ Payment verification failed: ' + (verifyResponse.message || 'Unknown error'));
                              setSubmitError(verifyResponse.message || 'Payment verification failed');
                              setIsPaymentProcessing(false);
                            }
                          } catch (error) {
                            console.error('❌ Error in payment verification:', error);
                            const errorMsg = error.response?.data?.message || error.message || 'Failed to verify payment';
                            alert('❌ ERROR: ' + errorMsg + '\n\nPlease contact support with your payment ID: ' + razorpayResponse.razorpay_payment_id);
                            setSubmitError(errorMsg);
                            setIsPaymentProcessing(false);
                          }
                        },
                        (error) => {
                          setSubmitError('Payment was cancelled or failed');
                          setIsPaymentProcessing(false);
                          setShowRazorpayModal(false);
                        }
                      );
                    } catch (error) {
                      setSubmitError(error.message || 'Failed to initiate payment');
                      setIsPaymentProcessing(false);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </button>
              )}

              {/* Payment methods info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center mb-3">Accepted payment methods:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-700"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Popup */}
      <MaintenancePopup
        isOpen={showMaintenancePopup}
        onClose={() => setShowMaintenancePopup(false)}
        maintenanceData={maintenanceData}
      />

    </div>
  );
};

export default BookingPage;
