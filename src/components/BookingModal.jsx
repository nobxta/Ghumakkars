import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Percent,
  Wallet,
  QrCode,
  ChevronRight,
  ChevronLeft,
  Info,
  Shield,
  Timer,
  Star,
  Gift,
  Zap,
  ArrowRight,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bookingService from '../services/bookingService';
import userService from '../services/userService';
import couponService from '../services/couponService';
import paymentSettingsService from '../services/paymentSettingsService';
import draftBookingService from '../services/draftBookingService';
import passengerTemplateService from '../services/passengerTemplateService';
import useRealTimeSeats from '../hooks/useRealTimeSeats';
import {
  SeatAvailabilityBanner,
  DraftBookingNotification,
  AutoSaveIndicator,
  PassengerTemplateSelector,
  BookingCountdownTimer,
  QuickRebookBanner
} from './BookingEnhancements';

const BookingModal = ({ isOpen, onClose, trip, previousBooking = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // New enhancement states
  const [hasDraft, setHasDraft] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [passengerTemplates, setPassengerTemplates] = useState([]);
  const seatsData = useRealTimeSeats(trip?._id, 30000); // Poll every 30 seconds

  // Form data
  const [contactDetails, setContactDetails] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [passengers, setPassengers] = useState([{
    name: '',
    phone: '',
    age: '',
    college: {
      name: '',
      id: '',
      notPreferToSay: false
    }
  }]);

  const [paymentType, setPaymentType] = useState('full');
  const [transactionId, setTransactionId] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Payment options
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  // Trip timing calculations
  const [tripCountdown, setTripCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [bookingCountdown, setBookingCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  const collegeOptions = [
    'GLA University',
    'Sanskriti University',
    'BSA College',
    'Hindustan College',
    'Rajiv Academy',
    'Other'
  ];

  const relationshipOptions = [
    'Father',
    'Mother',
    'Brother/Sister',
    'Friend',
    'Guardian',
    'Other'
  ];

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
      loadAdminSettings();
      calculateCountdowns();
      checkForDraft();
      loadPassengerTemplates();
    }
  }, [isOpen, user, trip]);

  useEffect(() => {
    const interval = setInterval(calculateCountdowns, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [trip]);

  const calculateCountdowns = () => {
    if (!trip) return;

    const now = new Date();
    const tripDate = new Date(trip.departureDate || trip.startDate);
    const bookingCloseDate = new Date(tripDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before trip

    // Trip countdown
    const tripDiff = tripDate - now;
    if (tripDiff > 0) {
      setTripCountdown({
        days: Math.floor(tripDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((tripDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((tripDiff % (1000 * 60 * 60)) / (1000 * 60))
      });
    }

    // Booking close countdown
    const bookingDiff = bookingCloseDate - now;
    if (bookingDiff > 0) {
      setBookingCountdown({
        days: Math.floor(bookingDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((bookingDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((bookingDiff % (1000 * 60 * 60)) / (1000 * 60))
      });
    }
  };

  const loadAdminSettings = async () => {
    try {
      const response = await paymentSettingsService.getPublicSettings();
      if (response.success && response.data) {
        const settings = response.data;
        setAdminSettings({
          paymentQRCode: settings.qrCode?.image || null,
          upiId: settings.upiSettings?.upiId || settings.qrCode?.upiId || null,
          merchantName: settings.upiSettings?.merchantName || settings.qrCode?.merchantName || 'Ghumakkars',
          paymentMethods: settings.paymentMethods || { upi: true, card: false, netbanking: false }
        });
      } else {
        // Fallback if no settings configured
        setAdminSettings({
          paymentQRCode: null,
          upiId: null,
          merchantName: 'Ghumakkars',
          paymentMethods: { upi: true, card: false, netbanking: false }
        });
      }
    } catch (error) {
      console.error('Failed to load payment settings:', error);
      // Use fallback settings on error
      setAdminSettings({
        paymentQRCode: null,
        upiId: null,
        merchantName: 'Ghumakkars',
        paymentMethods: { upi: true, card: false, netbanking: false }
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.user) {
        const user = response.user;
        setUserProfile(user);
        
        // Build full name from firstName and lastName
        const fullName = user.firstName 
          ? `${user.firstName} ${user.lastName || ''}`.trim()
          : user.name || '';
        
        // Calculate age from date of birth if available
        let age = '';
        if (user.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(user.dateOfBirth);
          age = (today.getFullYear() - birthDate.getFullYear()).toString();
        }
        
        // Auto-fill contact details with user profile data
        setContactDetails({
          name: fullName,
          email: user.email || '',
          phone: user.phone || '',
          emergencyContact: {
            name: user.emergencyContact?.name || '',
            phone: user.emergencyContact?.phone || '',
            relationship: user.emergencyContact?.relationship || ''
          }
        });
        
        // Auto-fill first passenger with user details
        setPassengers([{
          name: fullName,
          phone: user.phone || '',
          age: age,
          college: {
            name: user.collegeName || '',
            id: user.collegeId || '',
            notPreferToSay: false
          }
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const checkForDraft = () => {
    if (!trip?._id) return;
    const draft = draftBookingService.getDraft(trip._id);
    setHasDraft(!!draft);
  };

  const loadDraftBooking = () => {
    if (!trip?._id) return;
    const draft = draftBookingService.getDraft(trip._id);
    if (draft) {
      setContactDetails(draft.contactDetails || contactDetails);
      setPassengers(draft.passengers || passengers);
      setPaymentType(draft.paymentType || 'full');
      setSpecialRequirements(draft.specialRequirements || '');
      setHasDraft(false);
      alert('✅ Saved booking loaded successfully!');
    }
  };

  const dismissDraft = () => {
    if (!trip?._id) return;
    draftBookingService.deleteDraft(trip._id);
    setHasDraft(false);
  };

  const loadPassengerTemplates = () => {
    const templates = passengerTemplateService.getQuickTemplates(userProfile);
    setPassengerTemplates(templates);
  };

  const handleQuickRebook = () => {
    if (!previousBooking) return;
    
    setContactDetails(previousBooking.contactDetails || contactDetails);
    setPassengers(previousBooking.passengers || passengers);
    setSpecialRequirements(previousBooking.specialRequirements || '');
    alert('✅ Previous booking details loaded!');
  };

  const selectPassengerTemplate = (template) => {
    const newPassenger = {
      name: template.name,
      phone: template.phone,
      age: template.age,
      college: template.college
    };
    setPassengers([...passengers, newPassenger]);
  };

  const handleContactChange = (field, value) => {
    console.log('Changing contact:', field, value);
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setContactDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setContactDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Trigger auto-save
    triggerAutoSave();
  };

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (!trip?._id) return;
    
    setAutoSaving(true);
    setTimeout(() => {
      const draftData = {
        contactDetails,
        passengers,
        paymentType,
        specialRequirements
      };
      draftBookingService.saveDraft(trip._id, draftData);
      setLastSaved(new Date().toISOString());
      setAutoSaving(false);
    }, 1000); // Debounce 1 second
  };


  const calculateAmounts = () => {
    const totalPassengers = passengers.length;
    
    // Check for early bird pricing (only if enabled AND before valid until date)
    const now = new Date();
    const isEarlyBirdValid = 
      trip.isEarlyBird && 
      trip.earlyBirdPrice && 
      trip.earlyBirdValidUntil && 
      now < new Date(trip.earlyBirdValidUntil);
    
    const basePrice = trip.price;
    const currentPrice = isEarlyBirdValid ? trip.earlyBirdPrice : basePrice;
    
    let subtotal = basePrice * totalPassengers;
    let totalAmount = currentPrice * totalPassengers;
    const defaultSeatLockAmount = trip.seatLockAmount || (currentPrice * 0.2);
    let seatLockAmount = defaultSeatLockAmount * totalPassengers;
    
    let earlyBirdDiscount = 0;
    if (isEarlyBirdValid) {
      earlyBirdDiscount = (basePrice - trip.earlyBirdPrice) * totalPassengers;
    }
    
    // Apply coupon discount (only if no early bird OR coupon is stackable)
    let couponDiscount = 0;
    if (appliedCoupon) {
      const baseForCoupon = currentPrice * totalPassengers;
      couponDiscount = appliedCoupon.type === 'percentage' 
        ? (baseForCoupon * appliedCoupon.value) / 100
        : appliedCoupon.value;
      totalAmount = Math.max(0, totalAmount - couponDiscount);
    }
    
    // Check for new user discount (₹100 off first booking)
    let newUserDiscount = 0;
    const isFirstBooking = userProfile && (!userProfile.tripHistory || userProfile.tripHistory.length === 0);
    if (isFirstBooking && !appliedCoupon) {
      // New user gets ₹100 off (but not if they already have a coupon)
      newUserDiscount = Math.min(100, totalAmount);
      totalAmount = Math.max(0, totalAmount - newUserDiscount);
    }
    
    // Apply wallet balance
    let walletAmount = 0;
    if (useWalletBalance && userProfile?.wallet?.balance) {
      walletAmount = Math.min(userProfile.wallet.balance, totalAmount);
    }
    
    const remainingAmount = paymentType === 'seat_lock' ? totalAmount - seatLockAmount : 0;
    const paidAmount = paymentType === 'full' ? totalAmount - walletAmount : seatLockAmount - walletAmount;

    return {
      subtotal,
      totalAmount,
      seatLockAmount,
      remainingAmount,
      paidAmount: Math.max(0, paidAmount),
      walletAmount,
      earlyBirdDiscount,
      couponDiscount,
      newUserDiscount,
      discountAmount: earlyBirdDiscount + couponDiscount + newUserDiscount,
      isEarlyBirdValid,
      isFirstBooking
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!trip._id) {
        throw new Error('Trip ID is missing');
      }
      if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
        throw new Error('Please fill in all contact details');
      }
      if (passengers.some(p => !p.name || !p.phone || !p.age)) {
        throw new Error('Please fill in all passenger details');
      }
      if (!transactionId.trim()) {
        throw new Error('Transaction ID is required');
      }

      const amounts = calculateAmounts();
      
      const bookingData = {
        tripId: trip._id,
        contactDetails,
        passengers: passengers.map(p => ({
          ...p,
          age: parseInt(p.age)
        })),
        paymentType,
        transactionId,
        specialRequirements,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        walletUsedAmount: useWalletBalance ? amounts.walletAmount : 0
      };

      const response = await bookingService.createBooking(bookingData);
      
      alert('Booking created successfully! We will verify your payment and confirm soon.');
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const totalAmount = trip.price * passengers.length;
      const response = await couponService.applyCoupon(couponCode, trip._id, totalAmount);
      
      if (response.success) {
        setAppliedCoupon(response.data.coupon);
        alert(`Coupon applied! ${response.data.coupon.description || 'Discount applied successfully'}`);
      }
    } catch (error) {
      alert('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const resetForm = () => {
    setStep(1);
    setPassengers([{
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      age: userProfile?.age || '',
      college: {
        name: userProfile?.college?.name || '',
        id: userProfile?.college?.id || '',
        notPreferToSay: userProfile?.college?.notPreferToSay || false
      }
    }]);
    setPaymentType('full');
    setTransactionId('');
    setSpecialRequirements('');
    setCouponCode('');
    setAppliedCoupon(null);
    setUseWalletBalance(false);
  };

  const amounts = calculateAmounts();

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: 'Contact Details', icon: User },
    { id: 2, title: 'Passengers', icon: Users },
    { id: 3, title: 'Payment', icon: CreditCard },
    { id: 4, title: 'Confirmation', icon: CheckCircle }
  ];

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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Book Your Trip</h2>
                <p className="text-blue-100 mt-1">{trip.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = step >= stepItem.id;
                const isCompleted = step > stepItem.id;
                
                return (
                  <div key={stepItem.id} className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' :
                        isActive ? 'bg-white text-blue-600' :
                        'bg-white/20 text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-white' : 'text-blue-200'
                    }`}>
                      {stepItem.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ml-4 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trip Info Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
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
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Departure</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(trip.departureDate || trip.startDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Timer className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trip in</p>
                  <p className="font-semibold text-slate-800">
                    {tripCountdown.days}d {tripCountdown.hours}h {tripCountdown.minutes}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Enhancement Components */}
            <div className="mb-6 space-y-4">
              {/* Seat Availability Banner */}
              <SeatAvailabilityBanner seatsData={seatsData} />
              
              {/* Draft Booking Notification */}
              <DraftBookingNotification 
                hasDraft={hasDraft}
                onLoadDraft={loadDraftBooking}
                onDismiss={dismissDraft}
              />
              
              {/* Quick Rebook Banner */}
              <QuickRebookBanner 
                previousBooking={previousBooking}
                onQuickRebook={handleQuickRebook}
              />
              
              {/* Booking Countdown */}
              {bookingCountdown.days <= 7 && (
                <BookingCountdownTimer 
                  deadline={new Date(new Date(trip.departureDate || trip.startDate).getTime() - 7 * 24 * 60 * 60 * 1000)}
                />
              )}
              
              {/* Auto-save Indicator */}
              <div className="flex justify-end">
                <AutoSaveIndicator isSaving={autoSaving} lastSaved={lastSaved} />
              </div>
            </div>
            {/* Step 1: Contact Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Contact Information</h3>
                  <p className="text-slate-600">Please provide your contact details for booking confirmation</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={contactDetails.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={contactDetails.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={contactDetails.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-slate-600" />
                    Emergency Contact (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Name</label>
                      <input
                        type="text"
                        value={contactDetails.emergencyContact.name}
                        onChange={(e) => handleContactChange('emergencyContact.name', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={contactDetails.emergencyContact.phone}
                        onChange={(e) => handleContactChange('emergencyContact.phone', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Emergency contact phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Relationship</label>
                      <input
                        type="text"
                        value={contactDetails.emergencyContact.relationship}
                        onChange={(e) => handleContactChange('emergencyContact.relationship', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Type relationship or select from suggestions"
                        list="relationship-list"
                        autoComplete="off"
                      />
                      <datalist id="relationship-list">
                        {relationshipOptions.map(option => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                      <p className="text-xs text-slate-500">
                        Examples: Father, Mother, Brother, Sister, Friend, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center"
                  >
                    Next: Add Passengers
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Passengers - ENHANCED VERSION */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Add Passengers</h3>
                  <p className="text-gray-600">Enter details for each passenger</p>
                </div>

                {/* Passenger Template Selector */}
                <PassengerTemplateSelector 
                  templates={passengerTemplates}
                  onSelectTemplate={selectPassengerTemplate}
                />

                {/* Add Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const newPassenger = {
                        name: '',
                        phone: '',
                        age: '',
                        college: { name: '', id: '', notPreferToSay: false }
                      };
                      setPassengers([...passengers, newPassenger]);
                      triggerAutoSave();
                    }}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Add Passenger ({passengers.length})
                  </button>
                </div>

                {/* Passenger Forms */}
                {passengers.map((passenger, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Passenger {index + 1}</h4>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => {
                            const newPassengers = passengers.filter((_, i) => i !== index);
                            setPassengers(newPassengers);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].name = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={passenger.phone}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].phone = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter phone"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Age *</label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].age = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter age"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="mb-3">
                        <label className="flex items-center">
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
                            className="mr-2"
                          />
                          Prefer not to say
                        </label>
                      </div>

                      {!passenger.college.notPreferToSay && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">College Name</label>
                            <input
                              type="text"
                              value={passenger.college.name}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].college.name = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              placeholder="Enter college name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">College ID</label>
                            <input
                              type="text"
                              value={passenger.college.id}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].college.id = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              placeholder="Enter college ID"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Options</h3>
                  <p className="text-slate-600">Choose your payment method and apply any discounts</p>
                </div>
                
                {/* Coupon Code Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-blue-600" />
                    Coupon Code
                  </h4>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </motion.button>
                  </div>
                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-emerald-100 border border-emerald-200 rounded-xl"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-emerald-800 font-semibold">Coupon Applied!</p>
                          <p className="text-emerald-700 text-sm">{appliedCoupon.description}</p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Wallet Balance Section - Enhanced */}
                {userProfile?.wallet?.balance > 0 && (
                  <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 border-2 border-emerald-400 text-white overflow-hidden shadow-lg">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold">Ghumakkars Wallet</h4>
                            <p className="text-xs opacity-90">Available Balance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{userProfile.wallet.balance}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <p className="font-semibold text-sm mb-1">
                              {useWalletBalance 
                                ? `₹${Math.min(userProfile.wallet.balance, amounts.totalAmount)} will be deducted`
                                : 'Pay less with your wallet balance'}
                            </p>
                            <p className="text-xs opacity-90">
                              {useWalletBalance 
                                ? 'Your wallet balance will be applied automatically' 
                                : 'Enable to use your wallet balance for this booking'}
                            </p>
                          </div>
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={useWalletBalance}
                                onChange={(e) => setUseWalletBalance(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-white/30 rounded-full peer peer-checked:bg-white/50 transition-all"></div>
                              <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-lg"></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {useWalletBalance && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center space-x-2 text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm"
                        >
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">
                            You're saving ₹{Math.min(userProfile.wallet.balance, amounts.totalAmount)} on this booking! 🎉
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Summary - Enhanced */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border-2 border-slate-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-slate-600" />
                    Booking Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Passengers:</span>
                      <span className="font-semibold text-slate-800">{passengers.length} {passengers.length === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Price per person:</span>
                      <span className="font-semibold text-slate-800">₹{trip.price}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-3 pb-2">
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Subtotal:</span>
                        <span className="font-bold text-slate-800">₹{trip.price * passengers.length}</span>
                      </div>
                    </div>
                    
                    {/* Discounts Section */}
                    {(amounts.earlyBirdDiscount > 0 || amounts.newUserDiscount > 0 || appliedCoupon || (useWalletBalance && amounts.walletAmount > 0)) && (
                      <div className="space-y-2 pb-2">
                        {amounts.earlyBirdDiscount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-center bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
                          >
                            <span className="text-amber-700 font-medium text-sm flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              Early Bird Discount:
                            </span>
                            <span className="font-bold text-amber-700">-₹{amounts.earlyBirdDiscount}</span>
                          </motion.div>
                        )}
                        {amounts.newUserDiscount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg border border-purple-200"
                          >
                            <span className="text-purple-700 font-medium text-sm flex items-center gap-1">
                              <Gift className="w-4 h-4" />
                              New User Discount:
                            </span>
                            <span className="font-bold text-purple-700">-₹{amounts.newUserDiscount}</span>
                          </motion.div>
                        )}
                        {appliedCoupon && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200"
                          >
                            <span className="text-emerald-700 font-medium text-sm flex items-center gap-1">
                              <Percent className="w-4 h-4" />
                              Coupon Discount ({appliedCoupon.type === 'percentage' ? appliedCoupon.value + '%' : '₹' + appliedCoupon.value}):
                            </span>
                            <span className="font-bold text-emerald-700">-₹{amounts.couponDiscount}</span>
                          </motion.div>
                        )}
                        {useWalletBalance && amounts.walletAmount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                          >
                            <span className="text-blue-700 font-medium text-sm flex items-center gap-1">
                              <Wallet className="w-4 h-4" />
                              Wallet Balance:
                            </span>
                            <span className="font-bold text-blue-700">-₹{amounts.walletAmount}</span>
                          </motion.div>
                        )}
                      </div>
                    )}
                    
                    <div className="border-t-2 border-slate-300 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-900 font-bold text-lg">Total After Discounts:</span>
                        <span className="text-slate-900 font-bold text-2xl">₹{amounts.totalAmount}</span>
                      </div>
              <div className="text-xs text-slate-500 text-right">
                {amounts.discountAmount > 0 && (
                  <span>
                    You saved ₹{amounts.discountAmount + (useWalletBalance ? amounts.walletAmount : 0)}! 🎉
                  </span>
                )}
              </div>
                    </div>
                    
                    {/* Payment Amount Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-blue-900 font-semibold text-sm">Amount to Pay Now:</p>
                          <p className="text-blue-700 text-xs">
                            {paymentType === 'full' ? 'Full payment' : 'Seat lock amount'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-900 font-bold text-xl">₹{amounts.paidAmount}</p>
                          {paymentType === 'seat_lock' && (
                            <p className="text-blue-700 text-xs">₹{amounts.remainingAmount} remaining</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">
                      <strong>Note:</strong> Seat lock is ₹{trip.seatLockAmount || (trip.price * 0.2)} per person. 
                      {paymentType === 'seat_lock' && ' Remaining amount must be paid before the trip.'}
                    </div>
                  </div>
                </div>

                {/* Payment Type Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800">Choose Payment Option</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentType === 'full' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="full"
                        checked={paymentType === 'full'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-4">
                        <div className="font-semibold text-slate-800">Pay Full Amount</div>
                        <div className="text-sm text-slate-600">₹{amounts.paidAmount} (One-time payment)</div>
                      </div>
                    </motion.label>
                    
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentType === 'seat_lock' 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="seat_lock"
                        checked={paymentType === 'seat_lock'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div className="ml-4">
                        <div className="font-semibold text-slate-800">Pay Seat Lock Amount</div>
                        <div className="text-sm text-slate-600">
                          ₹{amounts.paidAmount} now, ₹{amounts.remainingAmount} later
                        </div>
                        <div className="text-xs text-amber-600 mt-1 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Seat lock expires in 10 days. Non-refundable.
                        </div>
                      </div>
                    </motion.label>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Payment QR Code
                  </h4>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-48 h-48 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {adminSettings?.paymentQRCode ? (
                        <img
                          src={adminSettings.paymentQRCode}
                          alt="Payment QR Code"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
                        style={{ display: adminSettings?.paymentQRCode ? 'none' : 'flex' }}
                      >
                        <div className="text-center">
                          <QrCode className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                          <p className="text-sm text-slate-600 font-medium">QR Code</p>
                          <p className="text-xs text-slate-500">Scan to pay ₹{amounts.paidAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4">
                    Scan this QR code to make payment of <span className="font-semibold text-slate-800">₹{amounts.paidAmount}</span>
                  </p>
                  
                  {/* UPI ID Section */}
                  {adminSettings?.upiId ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Alternative Payment Method
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <p className="text-sm text-blue-800">
                            <strong>UPI ID:</strong> {adminSettings.upiId}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(adminSettings.upiId);
                              alert('UPI ID copied to clipboard!');
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Copy UPI ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-blue-600">
                          You can also send payment directly to this UPI ID
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-sm text-amber-800 text-center">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Payment details not configured. Please contact admin.
                      </p>
                    </div>
                  )}
                  
                  {/* Payment Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <h5 className="text-sm font-semibold text-amber-900 mb-2 flex items-center justify-center">
                      <Info className="w-4 h-4 mr-2" />
                      Payment Instructions
                    </h5>
                    <ul className="text-xs text-amber-800 space-y-1 text-left">
                      <li>• Scan QR code with any UPI app (PhonePe, Google Pay, Paytm)</li>
                      {adminSettings?.upiId && <li>• Or send payment to UPI ID: {adminSettings.upiId}</li>}
                      <li>• Enter exact amount: ₹{amounts.paidAmount}</li>
                      <li>• Copy transaction ID from your payment app</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter transaction ID from payment app"
                    />
                    <p className="text-xs text-slate-500 text-left">
                      You can find this in your payment app after successful transaction
                    </p>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Special Requirements (Optional)</label>
                  <textarea
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(4)}
                    disabled={!transactionId.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center"
                  >
                    Next: Confirm Booking
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </motion.button>
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
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirm Your Booking</h3>
                  <p className="text-slate-600">Please review your booking details before confirming</p>
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Booking Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trip:</span>
                        <span className="font-semibold">{trip.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Contact Name:</span>
                        <span className="font-semibold">{contactDetails.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="font-semibold">{contactDetails.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Phone:</span>
                        <span className="font-semibold">{contactDetails.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Passengers:</span>
                        <span className="font-semibold">{passengers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Type:</span>
                        <span className="font-semibold capitalize">{paymentType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount to Pay:</span>
                        <span className="font-semibold">₹{amounts.paidAmount}</span>
                      </div>
                      {paymentType === 'seat_lock' && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Remaining Amount:</span>
                          <span className="font-semibold">₹{amounts.remainingAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transaction ID:</span>
                        <span className="font-semibold">{transactionId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h5 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Important Terms & Conditions
                  </h5>
                  <ul className="text-sm text-amber-700 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
                      Booking confirmation is subject to payment verification
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
                      Seat lock amount is non-refundable once paid
                    </li>
                    {paymentType === 'seat_lock' && (
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
                        Remaining amount must be paid before trip departure
                      </li>
                    )}
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
                      Cancellation policy applies as per terms and conditions
                    </li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;