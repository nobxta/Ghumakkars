import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  Filter,
  Reply,
  Eye,
  MoreVertical,
  Send,
  Tag,
  UserCheck,
  ChevronDown,
  MoreHorizontal,
  Check,
  CheckCheck,
  Archive,
  FileText
} from 'lucide-react';
import contactService from '../../services/contactService';

const Support = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef(null);

  // Load contacts and stats
  useEffect(() => {
    loadContacts();
    loadStats();
  }, [searchTerm, statusFilter]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedContact && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedContact, selectedContact?.adminReplies]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await contactService.getAllContacts(params);
      setContacts(response.data.contacts);
      
      // Update selected contact if it exists in the new list
      if (selectedContact) {
        const updated = response.data.contacts.find(c => c._id === selectedContact._id);
        if (updated) setSelectedContact(updated);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contactService.getContactStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedContact) return;
    
    // Check minimum length requirement
    if (replyMessage.trim().length < 5) {
      alert('Reply must be at least 5 characters long.');
      return;
    }
    
    try {
      setReplying(true);
      await contactService.replyToContact(selectedContact._id, replyMessage);
      setReplyMessage('');
      
      // Reload contacts to get updated data
      await loadContacts();
      
      // Reload stats
      await loadStats();
      
      // Show success message
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      
      // Show more specific error message
      if (error.message.includes('Validation failed')) {
        alert('Reply must be at least 5 characters long.');
      } else if (error.message.includes('Admin role required')) {
        alert('Access denied. Admin role required.');
        window.location.href = '/admin/login';
      } else if (error.message.includes('Access denied') || error.message.includes('token')) {
        alert('Authentication error. Please log in again.');
        // Redirect to login
        window.location.href = '/admin/login';
      } else {
        alert(`Failed to send reply: ${error.message}`);
      }
    } finally {
      setReplying(false);
    }
  };

  const updateStatus = async (contactId, status) => {
    try {
      await contactService.updateContactStatus(contactId, status);
      await loadContacts();
      await loadStats();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-1 flex gap-4">
        {/* Left Sidebar - Contact List */}
        <div className="w-1/3 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600">
            <h2 className="text-xl font-bold text-white">Support Chat</h2>
            <p className="text-sm text-purple-100">{contacts.length} conversations</p>
          </div>
          
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading conversations...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedContact?._id === contact._id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getStatusColor(contact.status)}`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                          <span className="text-xs text-gray-500">{formatDate(contact.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(contact.status)}`}>
                            {contact.status.replace('_', ' ')}
                          </span>
                          {contact.adminReplies?.length > 0 && (
                            <span className="text-xs text-purple-600 font-medium">
                              {contact.adminReplies.length} replies
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedContact.name}</h3>
                      <p className="text-sm text-purple-100">{selectedContact.email}</p>
                    </div>
                  </div>
                  
                  {/* Status Selector */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedContact.status}
                      onChange={(e) => updateStatus(selectedContact._id, e.target.value)}
                      className="px-3 py-1.5 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="mt-3 flex items-center space-x-4 text-sm text-purple-100">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{selectedContact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedContact.subject}</span>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                {/* Original User Message */}
                <div className="mb-6">
                  <div className="flex items-start space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{selectedContact.name}</span>
                        <span className="text-xs text-gray-500">{formatTime(selectedContact.createdAt)}</span>
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-4 max-w-3xl">
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Replies */}
                {selectedContact.adminReplies?.map((reply, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex justify-end"
                  >
                    <div className="flex items-start space-x-2 max-w-3xl">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1 justify-end">
                          <span className="text-xs text-gray-500">Support Team</span>
                          <CheckCheck className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">{formatTime(reply.repliedAt)}</span>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md p-4">
                          <p className="whitespace-pre-wrap">{reply.message}</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 justify-end">
                          <span className="text-xs text-gray-400">via Email</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || replying}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg"
                  >
                    {replying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚡ Replies are sent via email to the user
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Select a conversation</h3>
                <p className="text-sm text-gray-500">Choose a contact from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;