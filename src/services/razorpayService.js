import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class RazorpayService {
  constructor() {
    this.loaded = false;
    this.Razorpay = null;
  }

  async loadScript() {
    if (this.loaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.loaded = true;
        this.Razorpay = window.Razorpay;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  }

  async createOrder(amount, tripId, bookingId = null) {
    try {
      const token = localStorage.getItem('token');
      const requestBody = { tripId, amount };
      if (bookingId) {
        requestBody.bookingId = bookingId;
      }
      const response = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async verifyPayment(orderId, paymentId, signature) {
    try {
      console.log('🔍 razorpayService.verifyPayment called with:', {
        orderId,
        paymentId,
        signature: signature ? `${signature.substring(0, 20)}...` : 'missing'
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        orderId,
        paymentId,
        signature
      };

      console.log('📤 Sending POST to:', `${API_BASE_URL}/payments/verify`);
      console.log('📦 Request body (without signature details)');

      const response = await axios.post(
        `${API_BASE_URL}/payments/verify`,
        requestBody,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Verify payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  }

  async openCheckout(order, userDetails, keyId, onSuccess, onFailure) {
    try {
      await this.loadScript();

      // Use keyId from parameters (from API response) or fallback to env variable
      const razorpayKeyId = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        throw new Error('Razorpay key ID not found. Please configure in admin settings.');
      }

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Ghumakkars',
        description: 'Trip Booking Payment',
        order_id: order.id,
        handler: async (response) => {
          console.log('🎉 Razorpay handler called with:', response);
          try {
            alert('✅ Payment successful! Processing...');
            await onSuccess(response);
          } catch (error) {
            console.error('❌ Payment success callback error:', error);
            alert('❌ Error in payment callback: ' + error.message);
            onFailure(error);
          }
        },
        prefill: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.phone || ''
        },
        theme: {
          color: '#8B5CF6'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
          }
        }
      };

      const razorpay = new this.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay checkout:', error);
      onFailure(error);
    }
  }

  async getPaymentSettings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      throw error;
    }
  }
}

export default new RazorpayService();

