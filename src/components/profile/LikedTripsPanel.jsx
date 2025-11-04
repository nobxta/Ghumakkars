import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import tripService from '../../services/tripService';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const LikedTripsPanel = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await tripService.getLikedTrips();
        setTrips(res?.data?.likedTrips || []);
      } catch (error) {
        console.error('Error fetching liked trips:', error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const remove = async (tripId) => {
    try {
      await tripService.unlikeTrip(tripId);
      setTrips(trips.filter(t => (t._id || t.id) !== tripId));
    } catch (error) {
      console.error('Error unliking trip:', error);
      alert('Failed to unlike trip. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading liked trips...</p>
      </div>
    );
  }

  if (!trips.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h4 className="font-semibold text-gray-900 mb-2 text-lg">No Liked Trips</h4>
        <p className="text-gray-600 text-sm mb-6">Like trips while exploring to see them here.</p>
        <button 
          onClick={() => navigate('/explore-trips')} 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Explore Trips
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Liked Trips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map(trip => {
          const tripId = trip._id || trip.id;
          const isPast = trip.departureDate && new Date(trip.departureDate) < new Date();
          
          return (
            <motion.div 
              key={tripId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-4 border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all group"
            >
              <div className="w-24 h-20 rounded-lg overflow-hidden mr-4 bg-gray-100 flex-shrink-0">
                {trip.coverImage ? (
                  <img 
                    src={trip.coverImage} 
                    alt={trip.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1 truncate">{trip.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{trip.startLocation} → {trip.endLocation}</p>
                <p className="text-xs text-gray-500">
                  {trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : '-'}
                </p>
                {isPast && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    Past Trip
                  </span>
                )}
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {formatCurrency(trip.isEarlyBird && trip.earlyBirdPrice ? trip.earlyBirdPrice : trip.price)}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => navigate(isPast ? `/past-trip/${trip.urlSlug || tripId}` : `/trip/${trip.urlSlug || tripId}`)} 
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => remove(tripId)} 
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium whitespace-nowrap"
                  >
                    ❤️ Unlike
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LikedTripsPanel;


