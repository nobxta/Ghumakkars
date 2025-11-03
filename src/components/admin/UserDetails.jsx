import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserDetails(id);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
      navigate('/admin/users');
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      seat_locked: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-purple-50 text-purple-700 border-purple-200',
      rejected: 'bg-gray-50 text-gray-700 border-gray-200',
      expired: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-6">The requested user could not be found.</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const { user, wallet, bookings, contactQueries, stats } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600 mt-1">Comprehensive user information and activity dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                user.isActive 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {user.isActive ? '✓ Active' : '✗ Inactive'}
              </div>
              {user.isVerified && (
                <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  ✓ Verified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
            <div className="flex items-center space-x-6">
              {user.profilePicture ? (
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    src={user.profilePicture}
                    alt={user.name}
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-white to-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-bold text-gray-600">
                      {(user.firstName || user.name)?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {user.firstName 
                    ? `${user.firstName} ${user.lastName || ''}`.trim()
                    : user.name
                  }
                </h2>
                <p className="text-blue-100 text-lg mb-1">{user.email}</p>
                <p className="text-blue-200">{user.phone}</p>
                {user.collegeName && (
                  <p className="text-blue-200 mt-2">
                    <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    {user.collegeName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrips || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalSpent || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.walletBalance || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Referrals</p>
                <p className="text-3xl font-bold text-orange-600">{stats.referrals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bookings</p>
                <p className="text-3xl font-bold text-indigo-600">{bookings.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'profile', name: 'Profile', icon: '👤' },
                { id: 'bookings', name: 'Bookings', icon: '🎫' },
                { id: 'wallet', name: 'Wallet', icon: '💰' },
                { id: 'referrals', name: 'Referrals', icon: '🎁' },
                { id: 'contact', name: 'Support', icon: '📞' },
                { id: 'sessions', name: 'Sessions', icon: '🔐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Booking Statistics */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Booking Statistics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-700">Booked</span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">{bookings.booked?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-700">Cancelled</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{bookings.cancelled?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-700">Completed</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{bookings.completed?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-700">Member Since</span>
                        <span className="font-semibold text-gray-900">{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-700">Last Login</span>
                        <span className="font-semibold text-gray-900">{formatDate(stats.lastLogin)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-700">Email Verified</span>
                        <span className={`font-semibold ${user.isEmailVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-700">Phone Verified</span>
                        <span className={`font-semibold ${user.isPhoneVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.isPhoneVerified ? '✓ Verified' : '✗ Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Login Sessions */}
                {user.loginSessions && user.loginSessions.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Login Sessions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {user.loginSessions.slice(0, 3).map((session, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-3">
                            <div className={`w-3 h-3 rounded-full mr-3 ${session.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                            <span className="capitalize font-semibold text-gray-900">{session.deviceType}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              {session.browser}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                              </svg>
                              {session.ipAddress}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatDate(session.loginTime)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="font-semibold text-gray-900 mt-1">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Not provided'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="font-semibold text-gray-900 mt-1">{user.email}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="font-semibold text-gray-900 mt-1">{user.phone}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="font-semibold text-gray-900 mt-1">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="font-semibold text-gray-900 mt-1 capitalize">{user.gender || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">College Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-600">College Name</label>
                        <p className="font-semibold text-gray-900 mt-1">{user.collegeName || 'Not provided'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-600">College ID</label>
                        <p className="font-semibold text-gray-900 mt-1">{user.collegeId || 'Not provided'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-600">Referral Code</label>
                        <p className="font-mono font-semibold text-gray-900 mt-1 bg-gray-100 px-3 py-2 rounded-lg">{user.referralCode || 'Not generated'}</p>
                      </div>
                    </div>
                  </div>

                  {user.emergencyContact && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <label className="text-sm font-medium text-gray-600">Name</label>
                          <p className="font-semibold text-gray-900 mt-1">{user.emergencyContact.name || 'Not provided'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p className="font-semibold text-gray-900 mt-1">{user.emergencyContact.phone || 'Not provided'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <label className="text-sm font-medium text-gray-600">Relationship</label>
                          <p className="font-semibold text-gray-900 mt-1">{user.emergencyContact.relationship || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {bookings.all && bookings.all.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.all.map((booking) => (
                      <div key={booking._id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">{booking.trip?.title || 'Trip'}</h4>
                                <p className="text-gray-600">{booking.trip?.startLocation} → {booking.trip?.endLocation}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Date</p>
                                <p className="font-semibold">{formatDate(booking.trip?.departureDate)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Participants</p>
                                <p className="font-semibold">{booking.numberOfParticipants}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Amount</p>
                                <p className="font-semibold">{formatCurrency(booking.payment?.amount || 0)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Booked</p>
                                <p className="font-semibold">{formatDate(booking.bookingDate)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-6 text-right">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        {booking.cancellation && booking.cancellation.cancellationReason && (
                          <div className="mt-4 pt-4 border-t border-gray-200 bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                              <strong>Cancellation Reason:</strong> {booking.cancellation.cancellationReason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                    <p className="text-gray-600">This user hasn't made any bookings yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-4xl font-bold text-emerald-900 mb-2">
                      {formatCurrency(stats.walletBalance || 0)}
                    </div>
                    <div className="text-emerald-700 font-medium">Available Balance</div>
                  </div>
                </div>
                
                {wallet.transactions && wallet.transactions.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h3>
                    <div className="space-y-4">
                      {wallet.transactions.slice(0, 10).map((transaction, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                                transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'referral_bonus'
                                  ? 'bg-emerald-100'
                                  : 'bg-red-100'
                              }`}>
                                <svg className={`w-6 h-6 ${
                                  transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'referral_bonus'
                                    ? 'text-emerald-600'
                                    : 'text-red-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{transaction.description}</p>
                                <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                              </div>
                            </div>
                            <div className={`text-right font-bold text-lg ${
                              transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'referral_bonus'
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}>
                              {(transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'referral_bonus') ? '+' : '-'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions</h3>
                    <p className="text-gray-600">No wallet transactions found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-orange-900 mb-2">{stats.referrals || 0}</div>
                      <div className="text-orange-700 font-medium">Total Referrals</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-emerald-900 mb-2">{formatCurrency(stats.referralEarnings || 0)}</div>
                      <div className="text-emerald-700 font-medium">Total Earnings</div>
                    </div>
                  </div>
                </div>

                {user.referredBy && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Referred By</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="font-semibold text-gray-900">{user.referredBy.name || 'Unknown User'}</p>
                      <p className="text-gray-600">{user.referredBy.email}</p>
                    </div>
                  </div>
                )}

                {user.referrals && user.referrals.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Referred Users</h3>
                    <div className="space-y-4">
                      {user.referrals.map((referral, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{referral.user?.name || 'Unknown User'}</p>
                                <p className="text-gray-600">{referral.user?.email || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{formatDate(referral.date)}</p>
                              <p className="font-bold text-emerald-600">+{formatCurrency(referral.rewardEarned || 0)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
                    <p className="text-gray-600">This user hasn't referred anyone yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact/Support Tab */}
            {activeTab === 'contact' && (
              <div>
                {contactQueries && contactQueries.length > 0 ? (
                  <div className="space-y-6">
                    {contactQueries.map((query) => (
                      <div key={query._id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="text-xl font-bold text-gray-900">{query.subject}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                query.status === 'new' ? 'bg-amber-100 text-amber-800' :
                                query.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                query.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {query.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                query.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                query.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {query.priority}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{query.message}</p>
                            <p className="text-sm text-gray-500">{formatDate(query.createdAt)}</p>
                          </div>
                        </div>
                        {query.adminReplies && query.adminReplies.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="text-lg font-semibold text-gray-900 mb-4">Admin Replies</h5>
                            {query.adminReplies.map((reply, index) => (
                              <div key={index} className="bg-blue-50 rounded-xl p-4 mb-3">
                                <p className="text-gray-900">{reply.message}</p>
                                <p className="text-sm text-gray-600 mt-2">{formatDate(reply.repliedAt)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Support Queries</h3>
                    <p className="text-gray-600">No support queries found for this user.</p>
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                {user.loginSessions && user.loginSessions.length > 0 ? (
                  <div className="space-y-6">
                    {user.loginSessions.map((session, index) => (
                      <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-4">
                              <div className={`w-4 h-4 rounded-full mr-3 ${session.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                              <span className="capitalize font-bold text-lg text-gray-900">{session.deviceType}</span>
                              <span className="ml-3 text-gray-600">{session.browser}</span>
                              <span className="ml-3 text-gray-600">{session.os}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-600 font-medium">IP Address</p>
                                <p className="font-semibold text-gray-900">{session.ipAddress}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-600 font-medium">Location</p>
                                <p className="font-semibold text-gray-900">{session.location?.city || 'Unknown'} {session.location?.region && `, ${session.location.region}`}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-600 font-medium">Login Time</p>
                                <p className="font-semibold text-gray-900">{formatDate(session.loginTime)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-600 font-medium">Last Activity</p>
                                <p className="font-semibold text-gray-900">{formatDate(session.lastActivity)}</p>
                              </div>
                              {session.logoutTime && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-gray-600 font-medium">Logout Time</p>
                                  <p className="font-semibold text-gray-900">{formatDate(session.logoutTime)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-6">
                            <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                              session.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Login Sessions</h3>
                    <p className="text-gray-600">No login sessions recorded for this user.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;