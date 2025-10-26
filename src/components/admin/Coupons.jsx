import React, { useState, useEffect } from 'react';
import couponService from '../../services/couponService';
import tripService from '../../services/tripService';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  // Create coupon form
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    endDate: '',
    applicableTrips: [],
    applicableToAllTrips: true,
    description: '',
    notes: '',
    campaign: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    fetchCoupons();
    fetchTrips();
    fetchAnalytics();
  }, [filters, pagination.current]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit
      };
      
      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.status && filters.status.trim()) {
        params.status = filters.status;
      }
      if (filters.sortBy && filters.sortBy.trim()) {
        params.sortBy = filters.sortBy;
      }
      if (filters.sortOrder && filters.sortOrder.trim()) {
        params.sortOrder = filters.sortOrder;
      }
      
      const response = await couponService.getAllCoupons(params);
      setCoupons(response.data.coupons);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Failed to fetch coupons: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await tripService.getTrips();
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await couponService.getCouponAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await couponService.createCoupon(couponForm);
      alert('Coupon created successfully!');
      setShowCreateModal(false);
      resetCouponForm();
      fetchCoupons();
    } catch (error) {
      alert('Failed to create coupon: ' + error.message);
    }
  };

  const handleUpdateCoupon = async (couponId, updateData) => {
    try {
      await couponService.updateCoupon(couponId, updateData);
      alert('Coupon updated successfully!');
      fetchCoupons();
    } catch (error) {
      alert('Failed to update coupon: ' + error.message);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(couponId);
        alert('Coupon deleted successfully!');
        fetchCoupons();
      } catch (error) {
        alert('Failed to delete coupon: ' + error.message);
      }
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (selectedIds.length === 0) {
      alert('Please select coupons first');
      return;
    }

    if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} coupon(s)?`)) {
      try {
        await couponService.bulkAction(action, selectedIds);
        alert(`Bulk ${action} completed successfully!`);
        fetchCoupons();
      } catch (error) {
        alert(`Failed to ${action} coupons: ` + error.message);
      }
    }
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      type: 'percentage',
      value: '',
      usageLimit: '',
      perUserLimit: 1,
      startDate: '',
      endDate: '',
      applicableTrips: [],
      applicableToAllTrips: true,
      description: '',
      notes: '',
      campaign: {
        name: '',
        description: ''
      }
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      disabled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`;
    } else {
      return `₹${coupon.value} OFF`;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600">Manage discount coupons and track usage</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Coupon
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Used</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCouponsUsed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Discount</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.overview.totalDiscountGiven}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.uniqueUserCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.expiringSoon.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search coupons..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="code">Code</option>
              <option value="value">Value</option>
              <option value="usageLimit">Usage Limit</option>
              <option value="endDate">End Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading coupons...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                          <div className="text-sm text-gray-500">{coupon.description || 'No description'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getDiscountDisplay(coupon)}</div>
                        <div className="text-sm text-gray-500">
                          {coupon.applicableToAllTrips ? 'All trips' : `${coupon.applicableTrips.length} trips`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usageStats?.totalUses || 0} / {coupon.usageLimit}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{coupon.usageStats?.totalDiscount || 0} saved
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(coupon.endDate)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(coupon.endDate) < new Date() ? 'Expired' : 'Active'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleUpdateCoupon(coupon._id, { 
                              status: coupon.status === 'active' ? 'disabled' : 'active' 
                            })}
                            className="text-green-600 hover:text-green-900"
                          >
                            {coupon.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                    disabled={pagination.current === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.current * pagination.limit, pagination.total)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPagination({ ...pagination, current: page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Coupon</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SUMMER2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                    <input
                      type="number"
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={couponForm.type === 'percentage' ? '20' : '500'}
                      min="0"
                      max={couponForm.type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit *</label>
                    <input
                      type="number"
                      value={couponForm.usageLimit}
                      onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per User Limit</label>
                    <input
                      type="number"
                      value={couponForm.perUserLimit}
                      onChange={(e) => setCouponForm({ ...couponForm, perUserLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={couponForm.startDate}
                      onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="datetime-local"
                      value={couponForm.endDate}
                      onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Trips</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={couponForm.applicableToAllTrips}
                        onChange={(e) => setCouponForm({ 
                          ...couponForm, 
                          applicableToAllTrips: e.target.checked,
                          applicableTrips: e.target.checked ? [] : couponForm.applicableTrips
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Apply to all trips</span>
                    </label>
                    
                    {!couponForm.applicableToAllTrips && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {trips.map((trip) => (
                          <label key={trip._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={couponForm.applicableTrips.includes(trip._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponForm({
                                    ...couponForm,
                                    applicableTrips: [...couponForm.applicableTrips, trip._id]
                                  });
                                } else {
                                  setCouponForm({
                                    ...couponForm,
                                    applicableTrips: couponForm.applicableTrips.filter(id => id !== trip._id)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {trip.title} - {trip.startLocation} to {trip.endLocation}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Summer vacation discount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={couponForm.notes}
                    onChange={(e) => setCouponForm({ ...couponForm, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Internal notes about this coupon"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Details Modal */}
      {showDetailsModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Coupon Details: {selectedCoupon.code}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-medium">{selectedCoupon.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{selectedCoupon.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium">{getDiscountDisplay(selectedCoupon)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedCoupon.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Limits</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Limit:</span>
                        <span className="font-medium">{selectedCoupon.usageLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per User:</span>
                        <span className="font-medium">{selectedCoupon.perUserLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Used:</span>
                        <span className="font-medium">{selectedCoupon.usageStats?.totalUses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-medium">{selectedCoupon.usageLimit - (selectedCoupon.usageStats?.totalUses || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Validity Period</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{formatDate(selectedCoupon.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDate(selectedCoupon.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(selectedCoupon.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Applicable Trips</h3>
                    <div className="text-sm text-gray-600">
                      {selectedCoupon.applicableToAllTrips ? (
                        <span className="font-medium text-green-600">All trips</span>
                      ) : (
                        <div className="space-y-1">
                          {selectedCoupon.applicableTrips.map((trip) => (
                            <div key={trip._id} className="flex justify-between">
                              <span>{trip.title}</span>
                              <span className="text-gray-500">{trip.startLocation} → {trip.endLocation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedCoupon.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedCoupon.description}</p>
                </div>
              )}

              {selectedCoupon.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600">{selectedCoupon.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Coupon Analytics</h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Top Performing Coupons */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Coupons</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {analytics.topCoupons.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topCoupons.map((coupon, index) => (
                          <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                            <div>
                              <div className="font-medium">{coupon.code}</div>
                              <div className="text-sm text-gray-600">
                                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{coupon.usageCount} uses</div>
                              <div className="text-sm text-gray-600">₹{coupon.totalDiscount} saved</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No coupon usage data available</p>
                    )}
                  </div>
                </div>

                {/* Expiring Soon */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Coupons Expiring Soon</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {analytics.expiringSoon.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.expiringSoon.map((coupon) => (
                          <div key={coupon._id} className="flex justify-between items-center bg-white rounded-lg p-3">
                            <div>
                              <div className="font-medium">{coupon.code}</div>
                              <div className="text-sm text-gray-600">
                                {coupon.usageLimit} uses allowed
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-orange-600">
                                Expires {formatDate(coupon.endDate)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No coupons expiring soon</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;