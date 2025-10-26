import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Gift,
  Mail,
  Smartphone,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  UserCheck,
  UserX,
  MapPin,
  CreditCard
} from 'lucide-react';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'promo',
    targetAudience: 'all',
    specificTrips: [],
    sendTo: {
      newUsers: false,
      oldUsers: false,
      neverBooked: false,
      recentBookers: false,
      specificUsers: []
    },
    scheduledSend: false,
    scheduledDate: '',
    scheduledTime: '',
    channels: {
      email: true,
      sms: false,
      push: true
    }
  });

  const notificationTypes = [
    { value: 'promo', label: 'Promotional', icon: Gift, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'alert', label: 'Alert', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'info', label: 'Information', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Users', icon: Users, description: 'Send to all registered users' },
    { value: 'new', label: 'New Users', icon: UserCheck, description: 'Users registered in last 30 days' },
    { value: 'old', label: 'Old Users', icon: UserX, description: 'Users registered more than 6 months ago' },
    { value: 'never_booked', label: 'Never Booked', icon: CreditCard, description: 'Users who have never made a booking' },
    { value: 'recent_bookers', label: 'Recent Bookers', icon: TrendingUp, description: 'Users who booked in last 30 days' },
    { value: 'specific_trips', label: 'Specific Trips', icon: MapPin, description: 'Users interested in specific trips' },
    { value: 'custom', label: 'Custom Selection', icon: Target, description: 'Manually select users' }
  ];

  const tabs = [
    { id: 'create', label: 'Create Notification', icon: Plus },
    { id: 'history', label: 'Notification History', icon: Clock },
    { id: 'templates', label: 'Templates', icon: Edit }
  ];

  const handleInputChange = (field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSendNotification = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNotification = {
        id: Date.now(),
        ...notificationData,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipients: 1250 // Mock data
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Reset form
      setNotificationData({
        title: '',
        message: '',
        type: 'promo',
        targetAudience: 'all',
        specificTrips: [],
        sendTo: {
          newUsers: false,
          oldUsers: false,
          neverBooked: false,
          recentBookers: false,
          specificUsers: []
        },
        scheduledSend: false,
        scheduledDate: '',
        scheduledTime: '',
        channels: {
          email: true,
          sms: false,
          push: true
        }
      });
      
      alert('Notification sent successfully!');
    } catch (error) {
      alert('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewData(notificationData);
    setShowPreview(true);
  };

  const getNotificationIcon = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType ? notificationType.icon : Bell;
  };

  const getNotificationColor = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType ? notificationType.color : 'text-gray-600';
  };

  const getNotificationBgColor = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType ? notificationType.bgColor : 'bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Send targeted notifications to your users</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Create Notification Form */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Notification</h2>
                  
                  <div className="space-y-6">
                    {/* Notification Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Notification Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {notificationTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => handleInputChange('type', type.value)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                notificationData.type === type.value
                                  ? `${type.bgColor} border-current ${type.color}`
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2" />
                              <p className="text-sm font-medium">{type.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={notificationData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter notification title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        value={notificationData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Enter your notification message"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {targetAudiences.map((audience) => {
                          const Icon = audience.icon;
                          return (
                            <button
                              key={audience.value}
                              onClick={() => handleInputChange('targetAudience', audience.value)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                notificationData.targetAudience === audience.value
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className="w-5 h-5" />
                                <div>
                                  <p className="font-medium">{audience.label}</p>
                                  <p className="text-sm text-gray-500">{audience.description}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Channels */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Channels</label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationData.channels.email}
                            onChange={(e) => handleNestedInputChange('channels', 'email', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span>Email</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationData.channels.sms}
                            onChange={(e) => handleNestedInputChange('channels', 'sms', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          <span>SMS</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationData.channels.push}
                            onChange={(e) => handleNestedInputChange('channels', 'push', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Bell className="w-5 h-5 text-gray-500" />
                          <span>Push Notification</span>
                        </label>
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div>
                      <label className="flex items-center space-x-3 mb-3">
                        <input
                          type="checkbox"
                          checked={notificationData.scheduledSend}
                          onChange={(e) => handleInputChange('scheduledSend', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Schedule for later</span>
                      </label>
                      
                      {notificationData.scheduledSend && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                              type="date"
                              value={notificationData.scheduledDate}
                              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                            <input
                              type="time"
                              value={notificationData.scheduledTime}
                              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview & Actions */}
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {(() => {
                        const Icon = getNotificationIcon(notificationData.type);
                        return <Icon className={`w-5 h-5 ${getNotificationColor(notificationData.type)}`} />;
                      })()}
                      <span className="font-medium text-gray-900">
                        {notificationData.title || 'Notification Title'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notificationData.message || 'Your notification message will appear here...'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePreview}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Full Preview</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleSendNotification}
                      disabled={isLoading || !notificationData.title || !notificationData.message}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Sending...' : 'Send Notification'}</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Save as Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notification History</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                              <Icon className={`w-5 h-5 ${getNotificationColor(notification.type)}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                              <p className="text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Sent to {notification.recipients} users</span>
                                <span>•</span>
                                <span>{new Date(notification.sentAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Delivered</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notification Templates</h2>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Welcome New Users', type: 'info', description: 'Welcome message for new registrations' },
                    { title: 'Trip Reminder', type: 'alert', description: 'Reminder for upcoming trips' },
                    { title: 'Special Offer', type: 'promo', description: 'Promotional offers and discounts' },
                    { title: 'Payment Reminder', type: 'warning', description: 'Payment due notifications' },
                    { title: 'Trip Cancellation', type: 'alert', description: 'Trip cancellation notices' },
                    { title: 'Feedback Request', type: 'info', description: 'Post-trip feedback requests' }
                  ].map((template, index) => {
                    const Icon = getNotificationIcon(template.type);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${getNotificationBgColor(template.type)}`}>
                            <Icon className={`w-5 h-5 ${getNotificationColor(template.type)}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Use Template
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      {(() => {
                        const Icon = getNotificationIcon(previewData?.type);
                        return <Icon className={`w-5 h-5 ${getNotificationColor(previewData?.type)}`} />;
                      })()}
                      <span className="font-medium text-gray-900">{previewData?.title}</span>
                    </div>
                    <p className="text-gray-600">{previewData?.message}</p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Target: {targetAudiences.find(a => a.value === previewData?.targetAudience)?.label}</p>
                    <p>Channels: {Object.entries(previewData?.channels || {}).filter(([_, enabled]) => enabled).map(([channel]) => channel).join(', ')}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
