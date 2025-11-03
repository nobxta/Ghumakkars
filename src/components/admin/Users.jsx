import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const Users = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Wallet management state
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.users || []);
      
      // Calculate stats
      const totalUsers = response.users.length;
      const activeUsers = response.users.filter(user => user.isActive).length;
      const newThisMonth = response.users.filter(user => {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }).length;
      const totalRevenue = response.users.reduce((sum, user) => sum + (user.stats?.totalSpent || 0), 0);

      setUserStats({
        totalUsers,
        activeUsers,
        newThisMonth,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'new' && new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  const openUserModal = (user) => {
    // Navigate to detailed user page
    navigate(`/admin/users/${user._id}`);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
    setShowAddMoneyModal(false);
    setWalletAmount('');
    setWalletDescription('');
  };

  const handleAddMoneyToWallet = async () => {
    if (!walletAmount || parseFloat(walletAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setWalletLoading(true);
    try {
      await userService.addWalletMoney({
        userId: selectedUser._id,
        amount: parseFloat(walletAmount),
        description: walletDescription || `Manual credit by admin`
      });
      
      alert(`₹${walletAmount} added to ${selectedUser.name}'s wallet successfully!`);
      
      // Refresh users list to get updated wallet balance
      fetchUsers();
      
      // Update selected user's wallet balance
      const updatedBalance = (selectedUser.stats?.walletBalance || 0) + parseFloat(walletAmount);
      setSelectedUser({
        ...selectedUser,
        stats: {
          ...selectedUser.stats,
          walletBalance: updatedBalance
        }
      });
      
      // Close modal
      setShowAddMoneyModal(false);
      setWalletAmount('');
      setWalletDescription('');
    } catch (error) {
      console.error('Error adding wallet money:', error);
      alert(error.message || 'Failed to add money to wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and view all registered users</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.newThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(userStats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="verified">Verified Users</option>
              <option value="new">New Users (30 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {(user.firstName || user.name)?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName 
                            ? `${user.firstName} ${user.lastName || ''}`.trim()
                            : user.name
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone}</div>
                    {user.collegeName && (
                      <div className="text-sm text-gray-500">{user.collegeName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.isVerified && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('verified')}`}>
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.stats?.totalTrips || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.stats?.totalSpent || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.stats?.walletBalance || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-center mb-6">
                      {selectedUser.profilePicture ? (
                        <img
                          className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
                          src={selectedUser.profilePicture}
                          alt={selectedUser.name}
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                          <span className="text-white text-2xl font-bold">
                            {(selectedUser.firstName || selectedUser.name)?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedUser.firstName 
                          ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim()
                          : selectedUser.name
                        }
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <p className="text-gray-500 text-sm">{selectedUser.phone}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Full Name:</span>
                            <span className="text-gray-900">{selectedUser.fullName || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">College:</span>
                            <span className="text-gray-900">{selectedUser.collegeName || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">College ID:</span>
                            <span className="text-gray-900">{selectedUser.collegeId || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="text-gray-900 capitalize">{selectedUser.gender || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">DOB:</span>
                            <span className="text-gray-900">
                              {selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedUser.emergencyContact && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="text-gray-900">{selectedUser.emergencyContact.name || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="text-gray-900">{selectedUser.emergencyContact.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relationship:</span>
                              <span className="text-gray-900">{selectedUser.emergencyContact.relationship || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats and Activity */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-900">{selectedUser.stats?.totalTrips || 0}</div>
                        <div className="text-blue-600 text-sm font-medium">Total Trips</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="text-2xl font-bold text-green-900">{formatCurrency(selectedUser.stats?.totalSpent || 0)}</div>
                        <div className="text-green-600 text-sm font-medium">Total Spent</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="text-2xl font-bold text-purple-900">{formatCurrency(selectedUser.stats?.walletBalance || 0)}</div>
                        <div className="text-purple-600 text-sm font-medium">Wallet Balance</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <div className="text-2xl font-bold text-orange-900">{selectedUser.stats?.referrals || 0}</div>
                        <div className="text-orange-600 text-sm font-medium">Referrals</div>
                      </div>
                    </div>

                    {/* Trip History */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Trip History</h4>
                      {selectedUser.tripHistory && selectedUser.tripHistory.length > 0 ? (
                        <div className="space-y-3">
                          {selectedUser.tripHistory.map((trip, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{trip.trip?.title || 'Trip'}</h5>
                                  <p className="text-sm text-gray-600">
                                    {trip.trip?.startLocation} → {trip.trip?.endLocation}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {trip.trip?.startDate ? formatDate(trip.trip.startDate) : 'Date not available'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{formatCurrency(trip.totalAmount)}</p>
                                  <p className="text-sm text-gray-600">{trip.participants} participant(s)</p>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    trip.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {trip.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <p>No trips booked yet</p>
                        </div>
                      )}
                    </div>

                    {/* Referral Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Referral Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Referral Code</p>
                            <p className="font-medium text-gray-900">{selectedUser.referralCode || 'Not generated'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Referred By</p>
                            <p className="font-medium text-gray-900">
                              {selectedUser.referredBy?.name || 'No referral'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Referrals</p>
                            <p className="font-medium text-gray-900">{selectedUser.stats?.referrals || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Referral Earnings</p>
                            <p className="font-medium text-gray-900">{formatCurrency(selectedUser.stats?.referralEarnings || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Login Sessions</h4>
                      {selectedUser.loginSessions && selectedUser.loginSessions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedUser.loginSessions.slice(0, 5).map((session, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {session.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-sm text-gray-600 capitalize">{session.deviceType}</span>
                                    <span className="text-sm text-gray-500">{session.browser}</span>
                                    <span className="text-sm text-gray-500">{session.os}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    <strong>IP:</strong> {session.ipAddress}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Login:</strong> {formatDate(session.loginTime)}
                                  </p>
                                  {session.lastActivity && (
                                    <p className="text-sm text-gray-600">
                                      <strong>Last Activity:</strong> {formatDate(session.lastActivity)}
                                    </p>
                                  )}
                                  {session.logoutTime && (
                                    <p className="text-sm text-gray-600">
                                      <strong>Logout:</strong> {formatDate(session.logoutTime)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {selectedUser.loginSessions.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              Showing last 5 sessions. Total: {selectedUser.loginSessions.length}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <p>No login sessions recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Account Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Account Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Account Created</p>
                            <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last Login</p>
                            <p className="font-medium text-gray-900">
                              {selectedUser.stats?.lastLogin ? formatDate(selectedUser.stats.lastLogin) : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Email Verified</p>
                            <p className="font-medium text-gray-900">
                              {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phone Verified</p>
                            <p className="font-medium text-gray-900">
                              {selectedUser.isPhoneVerified ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Management */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Wallet Management</h4>
                        <button
                          onClick={() => setShowAddMoneyModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Money</span>
                        </button>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="text-3xl font-bold text-green-900 mb-1">
                          {formatCurrency(selectedUser.stats?.walletBalance || 0)}
                        </div>
                        <div className="text-green-700 text-sm">Available Balance</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Money to Wallet Modal */}
      {showAddMoneyModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Money to Wallet</h2>
                <button
                  onClick={() => setShowAddMoneyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">
                      {selectedUser.firstName 
                        ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim()
                        : selectedUser.name
                      }
                    </p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500">Current Balance: {formatCurrency(selectedUser.stats?.walletBalance || 0)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Add (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={walletDescription}
                    onChange={(e) => setWalletDescription(e.target.value)}
                    placeholder="Reason for adding money"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {walletAmount && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">New Balance:</span>
                      <span className="font-bold text-green-900">
                        {formatCurrency((selectedUser.stats?.walletBalance || 0) + parseFloat(walletAmount || 0))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddMoneyModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMoneyToWallet}
                    disabled={!walletAmount || parseFloat(walletAmount) <= 0 || walletLoading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {walletLoading ? 'Adding...' : 'Add Money'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;