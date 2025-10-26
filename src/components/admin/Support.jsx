import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import contactService from '../../services/contactService';

const Support = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Load contacts and stats
  useEffect(() => {
    loadContacts();
    loadStats();
  }, [searchTerm, statusFilter, priorityFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      const response = await contactService.getAllContacts(params);
      setContacts(response.data.contacts);
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
    
    try {
      setReplying(true);
      await contactService.replyToContact(selectedContact._id, replyMessage);
      setReplyMessage('');
      setShowReplyModal(false);
      loadContacts();
      loadStats();
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const updateStatus = async (contactId, status) => {
    try {
      await contactService.updateContactStatus(contactId, status);
      loadContacts();
      loadStats();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Manage customer queries and provide support</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {stats.statusStats?.map((stat) => (
            <div key={stat._id} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{stat._id}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(stat._id)}`}>
                  {stat._id === 'new' && <MessageSquare className="w-6 h-6" />}
                  {stat._id === 'in_progress' && <Clock className="w-6 h-6" />}
                  {stat._id === 'resolved' && <CheckCircle className="w-6 h-6" />}
                  {stat._id === 'closed' && <AlertCircle className="w-6 h-6" />}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button
              onClick={loadContacts}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-5 h-5 inline mr-2" />
              Apply Filters
            </button>
          </div>
        </motion.div>

        {/* Contacts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading contacts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <motion.tr
                      key={contact._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="font-medium text-purple-600">{contact.subject}</div>
                          <div className="text-gray-600 truncate">{contact.message}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(contact.priority)}`}>
                          {contact.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(contact);
                              setShowReplyModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(contact);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReplyModal && selectedContact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reply to {selectedContact.name}</h3>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Original Message:</p>
                  <p className="text-gray-900">{selectedContact.message}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type your reply here..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || replying}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {replying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Reply
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Details Modal */}
        <AnimatePresence>
          {selectedContact && !showReplyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Contact Details</h3>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedContact.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedContact.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedContact.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{formatDate(selectedContact.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900 font-medium">{selectedContact.subject}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Status & Priority</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedContact.status)}`}>
                          {selectedContact.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedContact.priority)}`}>
                          {selectedContact.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                
                {selectedContact.adminReplies && selectedContact.adminReplies.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Replies</h4>
                    <div className="space-y-4">
                      {selectedContact.adminReplies.map((reply, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">
                              {reply.repliedBy?.name || 'Admin'}
                            </span>
                            <span className="text-sm text-blue-600">
                              {formatDate(reply.repliedAt)}
                            </span>
                          </div>
                          <p className="text-blue-800">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyModal(true);
                      setSelectedContact(selectedContact);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Support;