import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import tripService from '../../services/tripService';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const LikedTripsPanel = () => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('likedTrips');
      const ids = raw ? JSON.parse(raw) : [];
      setLiked(ids);
    } catch {
      setLiked([]);
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await tripService.getTrips();
        const all = res?.data || [];
        const setIds = new Set(liked);
        setTrips(all.filter(t => setIds.has(t._id || t.id)));
      } catch {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    if (liked.length) fetch(); else { setTrips([]); setLoading(false); }
  }, [liked]);

  const remove = (tripId) => {
    const next = liked.filter(id => id !== tripId);
    setLiked(next);
    try { localStorage.setItem('likedTrips', JSON.stringify(next)); } catch {}
  };

  if (loading) return <div className="text-gray-600">Loading liked trips...</div>;
  if (!trips.length) return (
    <div className="text-center py-8">
      <h4 className="font-medium text-gray-900 mb-1">No Liked Trips</h4>
      <p className="text-gray-600 text-sm mb-4">Like trips in Explore to see them here.</p>
      <button onClick={() => navigate('/explore-trips')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Explore Trips</button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Liked Trips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map(trip => (
          <div key={trip._id || trip.id} className="flex items-center p-4 border border-gray-200 rounded-xl bg-white">
            <div className="w-24 h-20 rounded-lg overflow-hidden mr-4 bg-gray-100">
              {trip.coverImage && <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{trip.title}</h4>
              <p className="text-sm text-gray-600">{trip.startLocation} → {trip.endLocation}</p>
              <p className="text-xs text-gray-500">{trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('en-IN') : '-'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 mb-2">{formatCurrency(trip.isEarlyBird ? trip.earlyBirdPrice : trip.price)}</div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/trip/${trip._id || trip.id}`)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</button>
                <button onClick={() => remove(trip._id || trip.id)} className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">❤️ Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LikedTripsPanel;


