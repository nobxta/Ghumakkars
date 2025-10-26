import { useState, useEffect } from 'react';
import tripService from '../../services/tripService';

// Premium Icons Component
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    trips: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bookings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    revenue: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    trending: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  };
  
  return icons[name] || null;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  const [chartData, setChartData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch trips data
      const tripsResponse = await tripService.getAdminTrips({ limit: 100 });
      const allTrips = tripsResponse.data || [];
      
      // Calculate stats
      const totalTrips = allTrips.length;
      const activeTrips = allTrips.filter(trip => trip.status === 'active').length;
      const publishedTrips = allTrips.filter(trip => trip.isPublished);
      
      // Calculate total revenue (sum of all trip prices * participants)
      const totalRevenue = allTrips.reduce((sum, trip) => {
        return sum + (trip.price * (trip.currentParticipants || 0));
      }, 0);

      setStats({
        totalTrips,
        activeTrips,
        totalBookings: allTrips.reduce((sum, trip) => sum + (trip.currentParticipants || 0), 0),
        totalUsers: allTrips.reduce((sum, trip) => sum + (trip.currentParticipants || 0), 0), // Same as bookings for now
        totalRevenue
      });

      // Set active trips for display
      setActiveTrips(publishedTrips.slice(0, 5));

      // Generate chart data based on trip creation dates
      const monthlyData = generateMonthlyData(allTrips);
      setChartData(monthlyData);

      // Generate recent bookings from trips
      const recentBookingsData = generateRecentBookings(allTrips);
      setRecentBookings(recentBookingsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to sample data
      setStats({
        totalTrips: 0,
        activeTrips: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (trips) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.createdAt || trip.departureDate);
        return tripDate.getMonth() === index && tripDate.getFullYear() === currentYear;
      });
      
      const bookings = monthTrips.reduce((sum, trip) => sum + (trip.currentParticipants || 0), 0);
      const revenue = monthTrips.reduce((sum, trip) => sum + (trip.price * (trip.currentParticipants || 0)), 0);
      
      return { month, bookings, revenue };
    });
  };

  const generateRecentBookings = (trips) => {
    return trips
      .filter(trip => trip.currentParticipants > 0)
      .slice(0, 5)
      .map((trip, index) => ({
        id: trip._id,
        tripName: trip.title,
        user: `User ${index + 1}`, // Placeholder - would come from actual booking data
        amount: trip.price,
        status: trip.status === 'active' ? 'Confirmed' : trip.status === 'completed' ? 'Completed' : 'Pending',
        date: trip.departureDate || trip.createdAt
      }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-600 mt-2 font-medium">Welcome back! Here's what's happening with your travel business.</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
            <Icon name="trending" className="w-4 h-4 text-green-500" />
            <span className="font-medium">+12.5% from last month</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Icon name="trips" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Trips</p>
                <p className="text-2xl font-bold text-slate-800">{stats.activeTrips}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-600">
                <Icon name="trending" className="w-4 h-4" />
                <span className="text-sm font-semibold">+8.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <Icon name="bookings" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalBookings}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-600">
                <Icon name="trending" className="w-4 h-4" />
                <span className="text-sm font-semibold">+15.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <Icon name="users" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-600">
                <Icon name="trending" className="w-4 h-4" />
                <span className="text-sm font-semibold">+22.1%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                <Icon name="revenue" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-600">
                <Icon name="trending" className="w-4 h-4" />
                <span className="text-sm font-semibold">+18.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Bookings by Month</h3>
              <p className="text-slate-600 text-sm font-medium">Monthly booking trends</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <Icon name="trending" className="w-4 h-4" />
              <span className="font-semibold">+15.3%</span>
            </div>
          </div>
          <div className="h-72 flex items-end justify-between space-x-1">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg w-full transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 shadow-sm group-hover:shadow-md"
                  style={{ height: `${(data.bookings / 35) * 240}px` }}
                  title={`${data.month}: ${data.bookings} bookings`}
                />
                <span className="text-xs text-slate-600 mt-3 font-medium">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Revenue by Month</h3>
              <p className="text-slate-600 text-sm font-medium">Monthly revenue trends</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <Icon name="trending" className="w-4 h-4" />
              <span className="font-semibold">+18.7%</span>
            </div>
          </div>
          <div className="h-72 flex items-end justify-between space-x-1">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg w-full transition-all duration-500 hover:from-amber-600 hover:to-amber-500 shadow-sm group-hover:shadow-md"
                  style={{ height: `${(data.revenue / 112000) * 240}px` }}
                  title={`${data.month}: ${formatCurrency(data.revenue)}`}
                />
                <span className="text-xs text-slate-600 mt-3 font-medium">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Trips Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Active Trips</h3>
              <p className="text-slate-600 text-sm font-medium mt-1">Currently published and available trips</p>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/trips'}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Manage Trips
            </button>
          </div>
        </div>
        <div className="p-8">
          {activeTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrips.map((trip) => (
                <div key={trip._id} className="bg-slate-50/50 rounded-xl p-6 hover:bg-slate-100/50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 text-lg line-clamp-2">{trip.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Icon name="trips" className="w-4 h-4" />
                      <span>{trip.startLocation} → {trip.endLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="revenue" className="w-4 h-4" />
                      <span>{formatCurrency(trip.price)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="users" className="w-4 h-4" />
                      <span>{trip.currentParticipants || 0}/{trip.maxParticipants} participants</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="trips" className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Active Trips</h3>
              <p className="text-slate-600 mb-6">Create and publish your first trip to get started.</p>
              <button 
                onClick={() => window.location.href = '/admin/trips'}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create Trip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Recent Bookings</h3>
              <p className="text-slate-600 text-sm font-medium mt-1">Latest customer bookings and reservations</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Trip Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-slate-200/50">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">{booking.tripName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {booking.user.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-700">{booking.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">{formatCurrency(booking.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 font-medium">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
