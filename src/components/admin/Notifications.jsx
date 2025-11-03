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
  CreditCard,
  X,
  Loader
} from 'lucide-react';
import axios from 'axios';
import notificationService from '../../services/notificationService';

import { API_BASE_URL } from '../../utils/apiConfig';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    userId: '', // Single user ID for now
    link: ''
  });

  const notificationTypes = [
    { value: 'booking', label: 'Booking', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'payment', label: 'Payment', icon: CreditCard, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'trip', label: 'Trip', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { value: 'system', label: 'System', icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { value: 'offer', label: 'Offer', icon: Gift, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'announcement', label: 'Announcement', icon: Bell, color: 'text-pink-600', bgColor: 'bg-pink-50' }
  ];

  const tabs = [
    { id: 'create', label: 'Create Notification', icon: Plus },
    { id: 'history', label: 'All Notifications', icon: Clock }
  ];

  useEffect(() => {
    fetchUsers();
    if (activeTab === 'history') {
      fetchAllNotifications();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllNotifications = async () => {
    try {
      setIsLoading(true);
      // Fetch notifications for all users through admin API
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/notifications/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message || !notificationData.userId) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      await notificationService.createNotification(
        notificationData.userId,
        notificationData.title,
        notificationData.message,
        notificationData.type,
        notificationData.link || null,
        {}
      );

      // Reset form
      setNotificationData({
        title: '',
        message: '',
        type: 'announcement',
        userId: '',
        link: ''
      });

      alert('Notification sent successfully!');
      if (activeTab === 'history') {
        fetchAllNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
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

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim();
    return name.includes(searchLower) || 
           user.email.toLowerCase().includes(searchLower) ||
           user.phone?.includes(searchLower);
  });

  const selectedUser = allUsers.find(u => u._id === notificationData.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
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
              <p className="text-gray-600">Manage and send notifications to users</p>
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                              <Icon className="w-5 h-5 mx-auto mb-2" />
                              <p className="text-xs font-medium">{type.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Select User */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Send To User *</label>
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left hover:border-gray-400 transition-colors"
                      >
                        {selectedUser 
                          ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.name
                          : 'Select a user...'}
                      </button>
                      {notificationData.userId && (
                        <button
                          onClick={() => handleInputChange('userId', '')}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={notificationData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Enter your notification message"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Link (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link (Optional)</label>
                      <input
                        type="text"
                        value={notificationData.link}
                        onChange={(e) => handleInputChange('link', e.target.value)}
                        placeholder="e.g., /explore-trips or /my-trips"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Where should users be directed when they click the notification?
                      </p>
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
                    {selectedUser && (
                      <p className="mt-2 text-xs text-gray-500">
                        To: {selectedUser.firstName || ''} {selectedUser.lastName || ''}
                      </p>
                    )}
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
                      disabled={sending || !notificationData.title || !notificationData.message || !notificationData.userId}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{sending ? 'Sending...' : 'Send Notification'}</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                                <Icon className={`w-5 h-5 ${getNotificationColor(notification.type)}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>User: {notification.user?.name || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{formatTime(notification.createdAt)}</span>
                                  <span>•</span>
                                  <span className={`flex items-center space-x-1 ${
                                    notification.isRead ? 'text-green-600' : 'text-blue-600'
                                  }`}>
                                    {notification.isRead ? (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Read</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-4 h-4" />
                                        <span>Unread</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Selection Modal */}
        <AnimatePresence>
          {showUserModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUserModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select User</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Users List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        handleInputChange('userId', user._id);
                        setShowUserModal(false);
                      }}
                      className="w-full p-4 text-left bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(user.firstName || user.name)?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <CheckCircle className={`w-5 h-5 ${
                          notificationData.userId === user._id ? 'text-green-500' : 'text-gray-300'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
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
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Type: {notificationTypes.find(t => t.value === previewData?.type)?.label}</p>
                    {selectedUser && <p>To: {selectedUser.firstName} {selectedUser.lastName}</p>}
                    {previewData?.link && <p>Link: {previewData.link}</p>}
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
