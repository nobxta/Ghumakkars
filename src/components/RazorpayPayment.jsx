import { useState, useEffect } from 'react';
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import razorpayService from '../services/razorpayService';

const RazorpayPayment = ({ 
  amount, 
  tripId, 
  contactDetails, 
  passengers, 
  onSuccess, 
  onFailure,
  couponCode,
  walletUsedAmount,
  specialRequirements,
  razorpayKeyId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order
      const orderResponse = await razorpayService.createOrder(amount, tripId);
      
      if (!orderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      // Open Razorpay checkout with keyId from response or props
      await razorpayService.openCheckout(
        orderResponse.order,
        contactDetails,
        orderResponse.keyId || razorpayKeyId,
        async (razorpayResponse) => {
          try {
            // Verify payment
            const bookingData = {
              tripId,
              contactDetails,
              passengers,
              couponCode,
              walletUsedAmount,
              specialRequirements
            };

            const verifyResponse = await razorpayService.verifyPayment(
              razorpayResponse.razorpay_order_id,
              razorpayResponse.razorpay_payment_id,
              razorpayResponse.razorpay_signature,
              null,
              bookingData
            );

            if (verifyResponse.success) {
              onSuccess(verifyResponse);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message || 'Failed to verify payment');
            onFailure(error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Payment error:', error);
          setError('Payment cancelled or failed');
          setLoading(false);
          onFailure(error);
        }
      );
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment');
      setLoading(false);
      onFailure(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Card Preview */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Secure Payment
          </h3>
          <div className="flex items-center justify-center space-x-2 text-3xl font-bold text-purple-600">
            <span>₹</span>
            <span>{amount}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Via Razorpay - India's most trusted payment gateway
          </p>
        </div>

        {/* Security Features */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Why Razorpay is Safe
          </h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>256-bit SSL encryption for secure transactions</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>PCI-DSS certified payment infrastructure</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Instant booking confirmation</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Multiple payment options (UPI, Cards, Net Banking, Wallets)</span>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay Securely via Razorpay</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Your payment is secured by Razorpay
        </p>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Available Payment Methods
        </h4>
        <div className="flex flex-wrap gap-2">
          {['UPI', 'Credit/Debit Cards', 'Net Banking', 'Wallets', 'Pay Later'].map((method) => (
            <span
              key={method}
              className="inline-flex items-center px-3 py-1 bg-white rounded-full text-xs font-medium text-blue-700 border border-blue-200"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;

