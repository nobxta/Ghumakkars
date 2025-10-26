import React, { useState, useEffect } from 'react';
import cloudStorageService from '../../services/cloudStorageService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('payment');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    paymentQRCode: '',
    upiId: '',
    companyName: 'Ghumakkars',
    companyEmail: '',
    companyPhone: '',
    companyAddress: ''
  });

  useEffect(() => {
    // Load existing settings from localStorage or API
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setLoading(true);
    try {
      const uploadedUrl = await cloudStorageService.uploadImage(file);
      setSettings(prev => ({ ...prev, paymentQRCode: uploadedUrl }));
      alert('QR code uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload QR code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'payment', name: 'Payment Settings', icon: '💳' },
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Configuration</h2>
                <p className="text-gray-600 mb-6">Configure payment methods and QR codes for trip bookings</p>
              </div>

              {/* QR Code Upload */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment QR Code</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {settings.paymentQRCode ? (
                      <div className="flex items-center space-x-4">
                        <img
                          src={settings.paymentQRCode}
                          alt="Payment QR Code"
                          className="w-32 h-32 border border-gray-200 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Current QR Code</p>
                          <button
                            onClick={() => setSettings(prev => ({ ...prev, paymentQRCode: '' }))}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="text-xs text-gray-500">No QR Code</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New QR Code
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={loading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* UPI ID */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">UPI Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={settings.upiId}
                      onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))}
                      placeholder="yourname@paytm or yourname@phonepe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID for payment reference
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Payment Instructions</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>• Users will scan the QR code to make payments</p>
                  <p>• UPI ID will be displayed for manual payment reference</p>
                  <p>• All payments should be verified before confirming bookings</p>
                  <p>• Keep QR code updated with current payment details</p>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                <p className="text-gray-600 mb-6">Configure basic system information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email
                  </label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
                <p className="text-gray-600 mb-6">Configure email templates and SMTP settings</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Email Settings Coming Soon</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Email configuration will be available in the next update. Currently using default SMTP settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
                <p className="text-gray-600 mb-6">Configure notification preferences and alerts</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Notification Settings Coming Soon</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Advanced notification settings will be available in the next update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;