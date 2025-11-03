import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const MyTripsPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getMyBookings();
        setBookings(res?.data?.bookings || []);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categorize = () => {
    const now = new Date();
    const upcoming = [];
    const completed = [];
    const cancelled = [];
    const pending = [];

    bookings.forEach(booking => {
      const tripDate = new Date(booking.trip?.departureDate || booking.trip?.startDate || 0);
      
      if (booking.status === 'cancelled') {
        cancelled.push(booking);
      } else if (booking.status === 'completed' || (tripDate <= now && booking.status === 'confirmed')) {
        completed.push(booking);
      } else if (booking.status === 'pending') {
        pending.push(booking);
      } else if (booking.status === 'confirmed' && tripDate > now) {
        upcoming.push(booking);
      }
    });

    return { upcoming, completed, cancelled, pending };
  };

  const Section = ({ title, items, emptyText, colorScheme = 'blue' }) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' }
    };
    const scheme = colors[colorScheme] || colors.blue;

    return (
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        {items.length === 0 ? (
          <div className={`p-6 text-center text-gray-500 border border-dashed ${scheme.border} rounded-xl ${scheme.bg}`}>
            {emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((booking) => (
              <motion.div 
                key={booking._id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/booking-details/${booking._id}`)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {booking.trip?.title || 'Trip'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {booking.trip?.startLocation} → {booking.trip?.endLocation}
                    </p>
                    {booking.trip?.departureDate && (
                      <p className="text-xs text-gray-500">
                        {new Date(booking.trip.departureDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${scheme.badge} ${scheme.text} flex-shrink-0 ml-2`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.payment?.totalAmount || booking.payment?.amount || 0)}
                    </p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Details →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading trips...</p>
      </div>
    );
  }

  const { upcoming, completed, cancelled, pending } = categorize();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">My Trips</h2>
      {pending.length > 0 && (
        <Section title="Pending Confirmation" items={pending} emptyText="No pending trips." colorScheme="yellow" />
      )}
      <Section title="Upcoming Trips" items={upcoming} emptyText="No upcoming trips." colorScheme="green" />
      <Section title="Completed Trips" items={completed} emptyText="No completed trips yet." colorScheme="blue" />
      {cancelled.length > 0 && (
        <Section title="Cancelled Trips" items={cancelled} emptyText="No cancelled trips." colorScheme="red" />
      )}
    </motion.div>
  );
};

export default MyTripsPanel;


