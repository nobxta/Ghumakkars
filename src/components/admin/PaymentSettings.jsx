import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  X,
  QrCode,
  Smartphone,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [qrImageFile, setQrImageFile] = useState(null);
  const [qrImagePreview, setQrImagePreview] = useState(null);
  
  const [settings, setSettings] = useState({
    qrCode: {
      image: '',
      upiId: '',
      merchantName: '',
      isActive: true
    },
    upiSettings: {
      upiId: '',
      merchantName: '',
      isActive: true
    },
    paymentMethods: {
      upi: true,
      card: false,
      netbanking: false
    },
    seatLockSettings: {
      enabled: true,
      defaultAmount: 1000,
      expiryHours: 168 // 7 days
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
        if (response.data.data.qrCode?.image) {
          setQrImagePreview(response.data.data.qrCode.image);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load payment settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQRImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setQrImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadQRImage = async () => {
    if (!qrImageFile) return settings.qrCode.image;
    
    try {
      const formData = new FormData();
      formData.append('image', qrImageFile);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/user/upload-image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('📥 Upload response:', response.data);
      return response.data.url; // Backend returns "url" not "imageUrl"
    } catch (error) {
      console.error('QR upload error:', error);
      throw new Error('Failed to upload QR code image');
    }
  };

  const handleSaveQRSettings = async () => {
    setError('');
    setSuccess('');
    
    // Validation
    if (!settings.qrCode.upiId || !settings.qrCode.merchantName) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!qrImagePreview) {
      setError('Please upload a QR code image');
      return;
    }
    
    setSaving(true);
    try {
      // Upload QR image if new file selected
      let qrImageUrl = settings.qrCode.image;
      if (qrImageFile) {
        console.log('🔄 Uploading to Cloudinary...');
        qrImageUrl = await uploadQRImage();
        console.log('✅ Cloudinary URL:', qrImageUrl);
        
        // Update state with the new image URL
        setSettings(prev => ({
          ...prev,
          qrCode: {
            ...prev.qrCode,
            image: qrImageUrl
          }
        }));
      }
      
      // If still no image URL, show error
      if (!qrImageUrl) {
        setError('Please upload a QR code image first');
        setSaving(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Debug: Log what we're sending
      console.log('📤 Sending to API:', {
        image: qrImageUrl,
        upiId: settings.qrCode.upiId,
        merchantName: settings.qrCode.merchantName,
        isActive: settings.qrCode.isActive
      });
      
      const response = await axios.put(
        `${API_URL}/api/payment-settings/qr-code`,
        {
          image: qrImageUrl,
          upiId: settings.qrCode.upiId,
          merchantName: settings.qrCode.merchantName,
          isActive: settings.qrCode.isActive
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('QR Code settings saved successfully!');
        setSettings(response.data.data);
        setQrImageFile(null);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.errors 
        ? error.response.data.errors.map(e => e.msg).join(', ')
        : error.response?.data?.message || 'Failed to save QR settings';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUPISettings = async () => {
    setError('');
    setSuccess('');
    
    if (!settings.upiSettings.upiId || !settings.upiSettings.merchantName) {
      setError('Please fill all required fields');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/payment-settings/upi`,
        settings.upiSettings,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('UPI settings saved successfully!');
        setSettings(response.data.data);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(error.response?.data?.message || 'Failed to save UPI settings');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Payment Settings</h1>
        <p className="text-slate-600">Configure QR Code and UPI settings for trip bookings</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center"
        >
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800 font-medium">{success}</span>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800 font-medium">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* QR Code Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">QR Code Settings</h2>
                <p className="text-purple-100 text-sm">Upload QR code for UPI payments</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* QR Code Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  QR Code Image <span className="text-red-500">*</span>
                </label>
                
                {qrImagePreview ? (
                  <div className="space-y-3">
                    <div className="relative border-2 border-slate-200 rounded-xl overflow-hidden bg-white p-4">
                      <img
                        src={qrImagePreview}
                        alt="QR Code Preview"
                        className="w-full h-64 object-contain"
                      />
                      <button
                        onClick={() => {
                          setQrImagePreview(null);
                          setQrImageFile(null);
                          setSettings(prev => ({ ...prev, qrCode: { ...prev.qrCode, image: '' } }));
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <label className="block">
                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <span className="text-sm text-blue-600 font-medium">Change QR Code</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQRImageChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium mb-1">Click to upload QR code</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRImageChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.qrCode.upiId}
                    onChange={(e) => setSettings({
                      ...settings,
                      qrCode: { ...settings.qrCode, upiId: e.target.value }
                    })}
                    placeholder="example@upi"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Merchant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.qrCode.merchantName}
                    onChange={(e) => setSettings({
                      ...settings,
                      qrCode: { ...settings.qrCode, merchantName: e.target.value }
                    })}
                    placeholder="Ghumakkars"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <input
                    type="checkbox"
                    id="qrActive"
                    checked={settings.qrCode.isActive}
                    onChange={(e) => setSettings({
                      ...settings,
                      qrCode: { ...settings.qrCode, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="qrActive" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Enable QR Code Payments
                  </label>
                </div>

                <button
                  onClick={handleSaveQRSettings}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save QR Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* UPI Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">UPI Settings</h2>
                <p className="text-green-100 text-sm">Configure UPI payment details</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.upiSettings.upiId}
                  onChange={(e) => setSettings({
                    ...settings,
                    upiSettings: { ...settings.upiSettings, upiId: e.target.value }
                  })}
                  placeholder="example@upi"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Merchant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.upiSettings.merchantName}
                  onChange={(e) => setSettings({
                    ...settings,
                    upiSettings: { ...settings.upiSettings, merchantName: e.target.value }
                  })}
                  placeholder="Ghumakkars"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSaveUPISettings}
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save UPI Settings
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentSettings;

