import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  BarChart3,
  Settings,
  Copy,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const WhatsApp = () => {
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    sentToday: 0,
    failedToday: 0,
    lastActivity: null
  });
  const [activeTab, setActiveTab] = useState('send');
  const [showFormatting, setShowFormatting] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, selectedText: '' });
  const [textareaRef, setTextareaRef] = useState(null);

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      selectedText: selectedText,
      start: start,
      end: end
    });
  };

  // Close context menu when clicking elsewhere
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, selectedText: '' });
  };

  // Apply formatting to selected text
  const applyFormatting = (formatType) => {
    const { start, end, selectedText } = contextMenu;
    let formattedText = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `*${selectedText}*`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'strikethrough':
        formattedText = `~${selectedText}~`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'brackets':
        formattedText = `『${selectedText}』`;
        break;
      case 'quotes':
        formattedText = `«${selectedText}»`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const beforeText = message.substring(0, start);
    const afterText = message.substring(end);
    setMessage(beforeText + formattedText + afterText);
    closeContextMenu();
  };

  // Insert symbol at cursor position
  const insertSymbolAtCursor = (symbol) => {
    const { start, end } = contextMenu;
    const beforeText = message.substring(0, start);
    const afterText = message.substring(end);
    setMessage(beforeText + symbol + afterText);
    closeContextMenu();
  };

  // Insert formatting into message
  const insertFormatting = (text, cursorPosition) => {
    const beforeText = message.substring(0, cursorPosition);
    const afterText = message.substring(cursorPosition);
    setMessage(beforeText + text + afterText);
    return cursorPosition + text.length;
  };

  // Format message for display preview
  const getPreviewText = () => {
    let preview = message;
    preview = preview.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    preview = preview.replace(/_(.*?)_/g, '<em>$1</em>');
    preview = preview.replace(/~(.*?)~/g, '<span style="text-decoration: line-through;">$1</span>');
    preview = preview.replace(/`(.*?)`/g, '<code>$1</code>');
    return preview;
  };

  // Fetch status
  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('📱 No token found for status check');
        return;
      }

      const { API_BASE_URL } = await import('../../utils/apiConfig');
      const response = await fetch(`${API_BASE_URL}/whatsapp/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('📱 Status fetch failed:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('📱 Status update:', data.data);
        setStatus(data.data.status || 'disconnected');
        if (data.data.qrCode) {
          setQrCode(data.data.qrCode);
          if (data.data.status === 'qr_pending') {
            // Only show success message if QR code is new (wasn't there before)
            const prevQR = qrCode;
            if (!prevQR) {
              setResponse({ type: 'success', text: 'QR Code ready! Scan with WhatsApp to connect.' });
            }
          }
        } else {
          // Clear QR code if status changed away from qr_pending
          if (data.data.status !== 'qr_pending') {
            setQrCode(null);
          }
        }
      } else {
        console.error('📱 Status fetch error:', data.message);
      }
    } catch (error) {
      console.error('📱 Error fetching status:', error);
    }
  };

  // Fetch message history
  const fetchMessageHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { API_BASE_URL } = await import('../../utils/apiConfig');
      const response = await fetch(`${API_BASE_URL}/whatsapp/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessageHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const { API_BASE_URL } = await import('../../utils/apiConfig');
      const response = await fetch(`${API_BASE_URL}/whatsapp/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setResponse({ type: 'success', text: 'Copied to clipboard!' });
    setTimeout(() => setResponse(null), 2000);
  };

  // Download QR code
  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrCode}`;
      link.download = 'whatsapp-qr-code.png';
      link.click();
    }
  };

  // Insert demo/template message
  const insertTemplate = (template) => {
    const templates = {
      booking: `★ *Booking Confirmation* ★

Hey *{user}*, your booking for 
*{trip}* is confirmed! ☀

➣ Amount: ₹{amount}
➣ Participants: {participants}
➮ Booking ID: {bookingId}

Thank you for choosing Ghumakkars! ♡`,
      notification: `☆ *Important Update* ☆

Dear customer,

『 {message} 』

➣ See details in your dashboard
☀ Have a great day!`,
      welcome: `♫ *Welcome to Ghumakkars!* ♫

Hey {user}! 🎉

We're excited to have you join us on:
➮ *{trip}*
➣ Date: {date}
☀ Get ready for an amazing adventure!

See you soon! ♡`,
      simple: `Hello! 👋

*{message}*

Thank you!`
    };
    setMessage(templates[template] || '');
  };

  // Login (generate QR)
  const login = async () => {
    setIsLoggingIn(true);
    setResponse(null);
    setQrCode(null); // Clear any existing QR code
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResponse({ type: 'error', text: 'Authentication required. Please login again.' });
        setIsLoggingIn(false);
        return;
      }

      const { API_BASE_URL } = await import('../../utils/apiConfig');
      console.log('📱 WhatsApp Login - Calling:', `${API_BASE_URL}/whatsapp/login`);
      
      const response = await fetch(`${API_BASE_URL}/whatsapp/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📱 WhatsApp Login - Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📱 WhatsApp Login - Error Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setResponse({ type: 'error', text: errorData.message || `Failed: ${response.status}` });
        } catch {
          setResponse({ type: 'error', text: `Failed to generate QR code: ${response.status} ${response.statusText}` });
        }
        setIsLoggingIn(false);
        return;
      }
      
      const data = await response.json();
      console.log('📱 WhatsApp Login - Response Data:', data);
      
      if (data.success) {
        setResponse({ type: 'success', text: 'QR Code generation started! Checking status...' });
        // Start polling for status updates immediately
        setIsPolling(true);
        // Fetch status immediately and then continue polling
        await fetchStatus();
        // Continue polling every 3 seconds
        setTimeout(() => {
          if (!qrCode && status === 'disconnected') {
            setResponse({ type: 'warning', text: 'QR code is being generated. Please wait...' });
          }
        }, 2000);
      } else {
        setResponse({ type: 'error', text: data.message || 'Failed to generate QR code' });
      }
    } catch (error) {
      console.error('📱 WhatsApp Login - Exception:', error);
      setResponse({ type: 'error', text: `Failed to generate QR code: ${error.message}. Please check your connection and try again.` });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoggingOut(true);
    setResponse(null);
    
    try {
      const token = localStorage.getItem('token');
      const { API_BASE_URL } = await import('../../utils/apiConfig');
      const response = await fetch(`${API_BASE_URL}/whatsapp/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setResponse({ type: 'success', text: 'Successfully logged out from WhatsApp' });
        setStatus('disconnected');
        setQrCode(null);
        setIsPolling(false);
      } else {
        setResponse({ type: 'error', text: data.message || 'Failed to logout' });
      }
    } catch (error) {
      setResponse({ type: 'error', text: 'Failed to logout' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      setResponse({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      const { API_BASE_URL } = await import('../../utils/apiConfig');
      const response = await fetch(`${API_BASE_URL}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ number: phoneNumber, message })
      });

      const data = await response.json();
      setResponse({ type: data.success ? 'success' : 'error', text: data.message });
      
      if (data.success) {
        setPhoneNumber('');
        setMessage('');
      }
    } catch (error) {
      setResponse({ type: 'error', text: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchMessageHistory();
    fetchStats();
    
    // Poll for status updates when disconnected or qr_pending
    const interval = setInterval(() => {
      if (isPolling && (status === 'disconnected' || status === 'qr_pending' || status === 'connecting')) {
        fetchStatus();
      }
    }, 3000);

    // Close context menu when clicking outside
    const handleClickOutside = () => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [status, isPolling, contextMenu.show]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'qr_pending': return 'bg-blue-100 text-blue-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '✅ Connected';
      case 'connecting': return '⏳ Connecting...';
      case 'qr_pending': return '📱 Scan QR Code';
      case 'disconnected': return '❌ Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">WhatsApp Integration</h1>
                <p className="text-gray-600 mt-2 text-lg">Advanced messaging and communication management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { fetchStatus(); fetchStats(); }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.sentToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Today</p>
                <p className="text-3xl font-bold text-red-600">{stats.failedToday}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Activity</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : 'Never'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Connection Status</h2>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${getStatusColor(status)} border-2`}>
                <div className="flex items-center space-x-3">
                  {status === 'connected' && <CheckCircle className="w-6 h-6" />}
                  {status === 'connecting' && <RefreshCw className="w-6 h-6 animate-spin" />}
                  {status === 'qr_pending' && <Smartphone className="w-6 h-6" />}
                  {status === 'disconnected' && <XCircle className="w-6 h-6" />}
                  <span className="font-semibold">{getStatusText(status)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {status === 'disconnected' && (
                  <button
                    onClick={login}
                    disabled={isLoggingIn}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                      isLoggingIn
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoggingIn ? 'Generating QR...' : 'Login'}</span>
                  </button>
                )}
                
                {status === 'connected' && (
                  <button
                    onClick={logout}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                      isLoggingOut
                        ? 'bg-red-400 text-white cursor-wait'
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                )}
              </div>

              {/* QR Code Display */}
              <AnimatePresence>
                {status === 'qr_pending' && qrCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">QR Code</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          {showQR ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={downloadQR}
                          className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {showQR && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center space-y-4"
                      >
                        <img 
                          src={`data:image/png;base64,${qrCode}`} 
                          alt="WhatsApp QR Code" 
                          className="border-4 border-blue-500 rounded-xl shadow-lg max-w-full h-auto"
                        />
                        <p className="text-sm text-gray-600 text-center">
                          Scan with WhatsApp → Settings → Linked Devices
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Response Messages */}
              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border-2 ${
                      response.type === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {response.type === 'success' ? 
                        <CheckCircle className="w-5 h-5" /> : 
                        <XCircle className="w-5 h-5" />
                      }
                      <span className="font-medium">{response.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Send Message Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Send Custom Message</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number (with country code)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., 919876543210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Format: Country code + number (e.g., 91 for India)</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Message Content
                  </label>
                  <button
                    onClick={() => setShowFormatting(!showFormatting)}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    {showFormatting ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showFormatting ? 'Hide' : 'Show'} Formatting Tools</span>
                  </button>
                </div>

                {/* Formatting Tools */}
                {showFormatting && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    {/* Templates */}
                    <div>
                      <span className="text-xs font-semibold text-gray-600 mb-2 block">Quick Templates:</span>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => insertTemplate('booking')} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs hover:bg-blue-100 text-blue-700">📋 Booking</button>
                        <button onClick={() => insertTemplate('welcome')} className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-xs hover:bg-green-100 text-green-700">👋 Welcome</button>
                        <button onClick={() => insertTemplate('notification')} className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs hover:bg-purple-100 text-purple-700">🔔 Notification</button>
                        <button onClick={() => insertTemplate('simple')} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 text-gray-700">💬 Simple</button>
                      </div>
                    </div>
                    
                    {/* Text Styles */}
                    <div>
                      <span className="text-xs font-semibold text-gray-600 mb-2 block">Text Styles:</span>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setMessage(message + '*bold*')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50">*Bold*</button>
                        <button onClick={() => setMessage(message + '_italic_')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs italic hover:bg-gray-50">_Italic_</button>
                        <button onClick={() => setMessage(message + '~strikethrough~')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50 line-through">~Strike~</button>
                        <button onClick={() => setMessage(message + '`code`')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50">`Code`</button>
                      </div>
                    </div>
                    
                    {/* Premium Symbols */}
                    <div>
                      <span className="text-xs font-semibold text-gray-600 mb-2 block">Premium Symbols:</span>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setMessage(message + '★')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">★</button>
                        <button onClick={() => setMessage(message + '☆')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">☆</button>
                        <button onClick={() => setMessage(message + '♡')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">♡</button>
                        <button onClick={() => setMessage(message + '♫')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">♫</button>
                        <button onClick={() => setMessage(message + '☀')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">☀</button>
                        <button onClick={() => setMessage(message + '➣')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">➣</button>
                        <button onClick={() => setMessage(message + '➮')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">➮</button>
                      </div>
                    </div>
                    
                    {/* Special Symbols */}
                    <div>
                      <span className="text-xs font-semibold text-gray-600 mb-2 block">Special Characters:</span>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setMessage(message + '『')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">『</button>
                        <button onClick={() => setMessage(message + '』')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">』</button>
                        <button onClick={() => setMessage(message + '»')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">»</button>
                        <button onClick={() => setMessage(message + '«')} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-base hover:bg-gray-50">«</button>
                        <button onClick={() => setMessage(message + '\n')} className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50">↵ Line Break</button>
                      </div>
                    </div>
                  </div>
                )}

                <textarea
                  ref={setTextareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onContextMenu={handleContextMenu}
                  placeholder="Enter your message here... Use formatting tools above or right-click to format selected text!↵↵Example:*Bold Text*↵_Italic Text_↵☀➣➮♡★☆"
                  rows="8"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono text-sm"
                />
                
                {/* Context Menu */}
                {contextMenu.show && (
                  <div
                    className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px]"
                    style={{
                      left: contextMenu.x,
                      top: contextMenu.y,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Format Options */}
                    {contextMenu.selectedText && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                          Format "{contextMenu.selectedText.length > 20 ? contextMenu.selectedText.substring(0, 20) + '...' : contextMenu.selectedText}"
                        </div>
                        <button
                          onClick={() => applyFormatting('bold')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="font-bold">*</span>
                          <span>Bold</span>
                        </button>
                        <button
                          onClick={() => applyFormatting('italic')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="italic">_</span>
                          <span>Italic</span>
                        </button>
                        <button
                          onClick={() => applyFormatting('strikethrough')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="line-through">~</span>
                          <span>Strikethrough</span>
                        </button>
                        <button
                          onClick={() => applyFormatting('code')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="font-mono bg-gray-100 px-1 rounded">`</span>
                          <span>Code</span>
                        </button>
                        <button
                          onClick={() => applyFormatting('brackets')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span>『』</span>
                          <span>Brackets</span>
                        </button>
                        <button
                          onClick={() => applyFormatting('quotes')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span>«»</span>
                          <span>Quotes</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    
                    {/* Symbol Insertion */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                      Insert Symbol
                    </div>
                    <div className="grid grid-cols-4 gap-1 px-2">
                      <button
                        onClick={() => insertSymbolAtCursor('★')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Star"
                      >
                        ★
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('☆')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Empty Star"
                      >
                        ☆
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('♡')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Heart"
                      >
                        ♡
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('♫')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Music"
                      >
                        ♫
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('☀')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Sun"
                      >
                        ☀
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('➣')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Arrow"
                      >
                        ➣
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('➮')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Arrow"
                      >
                        ➮
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('『')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Left Bracket"
                      >
                        『
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('』')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Right Bracket"
                      >
                        』
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('»')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Right Quote"
                      >
                        »
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('«')}
                        className="p-2 hover:bg-gray-50 rounded text-lg"
                        title="Left Quote"
                      >
                        «
                      </button>
                      <button
                        onClick={() => insertSymbolAtCursor('\n')}
                        className="p-2 hover:bg-gray-50 rounded text-xs font-mono"
                        title="Line Break"
                      >
                        ↵
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Live Preview */}
                {message && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Live Preview:</p>
                    <div className="p-3 bg-white rounded-lg border border-slate-300 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{__html: getPreviewText()}} />
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Characters: {message.length}</p>
                  <button
                    onClick={() => copyToClipboard(message)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Copy Message
                  </button>
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={loading || status !== 'connected'}
                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
                  status !== 'connected'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : loading
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Sending...' : 'Send Custom Message'}</span>
              </button>

              {status !== 'connected' && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">You need to be connected to WhatsApp to send messages</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Formatting Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Formatting Guide</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Right-Click Formatting</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <strong>Select text</strong> in the message box</p>
                <p>• <strong>Right-click</strong> on selected text</p>
                <p>• Choose formatting: Bold, Italic, Strikethrough, Code</p>
                <p>• Or add brackets 『』 or quotes «»</p>
                <p>• Insert symbols at cursor position</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Quick Formatting</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <code className="bg-white px-2 py-1 rounded">*text*</code> = <strong>Bold</strong></p>
                <p>• <code className="bg-white px-2 py-1 rounded">_text_</code> = <em>Italic</em></p>
                <p>• <code className="bg-white px-2 py-1 rounded">~text~</code> = <span className="line-through">Strikethrough</span></p>
                <p>• <code className="bg-white px-2 py-1 rounded">`code`</code> = <code>Monospace</code></p>
                <p>• Premium symbols: ★☆♡♫☀➣➮『』»«</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Message History</h2>
            </div>
            <button
              onClick={fetchMessageHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {messageHistory.length > 0 ? (
            <div className="space-y-4">
              {messageHistory.slice(0, 5).map((msg, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {msg.status === 'sent' ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> : 
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                      <span className="font-medium text-gray-900">{msg.number}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No messages sent yet</p>
              <p className="text-gray-400 text-sm">Start sending messages to see them here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsApp;

