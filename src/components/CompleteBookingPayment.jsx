import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wallet,
  Download,
  Copy,
  Shield,
  DollarSign
} from 'lucide-react';
import bookingService from '../services/bookingService';
import tripService from '../services/tripService';
import paymentSettingsService from '../services/paymentSettingsService';
import razorpayService from '../services/razorpayService';

const CompleteBookingPayment = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    qrCode: {
      image: null,
      upiId: null,
      merchantName: 'Ghumakkars'
    },
    paymentMode: 'manual_qr'
  });

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const bookingResponse = await bookingService.getBookingById(bookingId);
      const bookingData = bookingResponse.data?.booking || bookingResponse.booking || bookingResponse;
      setBooking(bookingData);
      
      // Fetch trip details
      let tripId = null;
      if (bookingData.trip) {
        if (typeof bookingData.trip === 'string') {
          tripId = bookingData.trip;
        } else if (typeof bookingData.trip === 'object' && bookingData.trip._id) {
          tripId = bookingData.trip._id;
        }
      }
      
      if (tripId) {
        const tripData = await tripService.getTripById(tripId);
        setTrip(tripData.data || tripData);
      }
      
      // Fetch payment settings (public endpoint)
      const settings = await paymentSettingsService.getPublicSettings();
      if (settings.success && settings.data) {
        setAdminSettings({
          qrCode: settings.data.qrCode || { image: null, upiId: null, merchantName: 'Ghumakkars' },
          paymentMode: settings.data.paymentMode || 'manual_qr',
          razorpaySettings: settings.data.razorpaySettings || {}
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setSubmitting(true);
      
      const remainingAmount = booking.payment?.remainingAmount || 0;
      
      if (remainingAmount <= 0) {
        alert('No remaining amount to pay');
        setSubmitting(false);
        return;
      }

      // Get trip ID
      let tripId = null;
      if (booking.trip) {
        tripId = typeof booking.trip === 'string' ? booking.trip : booking.trip._id;
      } else if (trip?._id) {
        tripId = trip._id;
      }

      if (!tripId) {
        throw new Error('Trip ID not found');
      }

      // Create Razorpay order - amount in rupees (backend converts to paise), tripId, and bookingId
      const orderResponse = await razorpayService.createOrder(
        remainingAmount, // Amount in rupees (backend will convert to paise)
        tripId,
        booking._id
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency || 'INR',
        name: adminSettings.merchantName || 'Ghumakkars',
        description: `Complete payment for booking - ${trip?.title || 'Trip'}`,
        order_id: orderResponse.order.id,
        handler: async function (response) {
          try {
            // Use the complete-remaining-payment endpoint for remaining payments
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No authentication token found');
            }

            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/complete-remaining-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                bookingId: booking._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });

            const result = await verifyResponse.json();

            if (result.success) {
              alert('Payment successful! Your booking has been updated.');
              navigate(`/booking-details/${booking._id}`);
            } else {
              alert('Payment verification failed: ' + (result.message || 'Unknown error'));
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed: ' + (err.message || 'Please contact support.'));
          }
        },
        prefill: {
          email: booking.contactDetails?.email,
          contact: booking.contactDetails?.phone,
          name: booking.contactDetails?.name
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        alert('Payment failed. Please try again.');
      });
      
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQRPayment = async () => {
    try {
      if (!transactionId.trim()) {
        alert('Please enter your transaction ID');
        return;
      }

      setSubmitting(true);
      
      // Submit payment with transaction ID
      const response = await bookingService.updateBookingPayment(bookingId, {
        transactionId: transactionId.trim(),
        amount: booking.payment.remainingAmount,
        paymentStatus: 'pending'
      });

      if (response.success) {
        alert('Payment submitted successfully! Admin will verify your payment.');
        navigate(`/booking-details/${bookingId}`);
      } else {
        throw new Error(response.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert(error.message || 'Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
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

  const remainingAmount = booking.payment?.remainingAmount || 0;

  if (remainingAmount <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Payment Due</h2>
          <p className="text-gray-600 mb-6">Your booking is fully paid.</p>
          <button
            onClick={() => navigate(`/booking-details/${bookingId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Booking Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Booking Details</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
                <p className="text-gray-600 mt-2">Pay the remaining amount to secure your booking</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Remaining Amount</p>
                <p className="text-3xl font-bold text-orange-600">₹{remainingAmount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          {adminSettings.paymentMode === 'manual_qr' ? (
            /* QR Code Payment */
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <QrCode className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Pay via QR Code</h2>
              </div>

              <div className="space-y-6">
                {/* QR Code Display */}
                {adminSettings.qrCode?.image && (
                  <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <img
                      src={adminSettings.qrCode.image}
                      alt="Payment QR Code"
                      className="w-64 h-64 rounded-xl shadow-lg"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Scan this QR code to pay via UPI
                    </p>
                  </div>
                )}

                {/* UPI ID */}
                {adminSettings.qrCode?.upiId && (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">UPI ID</p>
                        <p className="text-lg font-bold text-blue-600">{adminSettings.qrCode.upiId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(adminSettings.qrCode.upiId, 'upi')}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {copied === 'upi' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction ID Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your UPI transaction ID"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    After payment, copy the transaction ID from your UPI app and paste it here
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleQRPayment}
                  disabled={submitting || !transactionId.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Confirm Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Razorpay Payment */
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Pay via Razorpay</h2>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Amount to Pay</p>
                    <p className="text-3xl font-bold text-indigo-600">₹{remainingAmount}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Instant payment confirmation</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Multiple payment options</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <p>Your payment is secured with Razorpay's encrypted payment gateway</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Booking Info */}
        {trip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Trip</p>
                <p className="font-bold text-gray-900">{trip.title}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Route</p>
                <p className="font-bold text-gray-900">{trip.startLocation} → {trip.endLocation}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Passengers</p>
                <p className="font-bold text-gray-900">{booking.passengers?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompleteBookingPayment;

