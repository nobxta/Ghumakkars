import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';

const MyTripsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getTripHistory();
        setTrips(res?.trips || []);
      } catch {
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categorize = () => {
    const upcoming = [];
    const completed = [];
    const cancelled = [];
    trips.forEach(t => {
      if (t.status === 'cancelled') cancelled.push(t);
      else if (t.status === 'completed') completed.push(t);
      else upcoming.push(t);
    });
    return { upcoming, completed, cancelled };
  };

  const Section = ({ title, items, emptyText }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">{emptyText}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{t.trip?.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'cancelled' ? 'bg-red-100 text-red-700' : t.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{t.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{t.trip?.startLocation} → {t.trip?.endLocation}</p>
              <p className="text-xs text-gray-500">{t.bookingDate ? new Date(t.bookingDate).toLocaleDateString('en-IN') : '-'}</p>
              <div className="mt-3 text-sm font-semibold text-gray-900">₹{t.totalAmount || t.trip?.price || 0}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="text-gray-600">Loading trips...</div>;

  const { upcoming, completed, cancelled } = categorize();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Trips</h2>
      <Section title="Upcoming" items={upcoming} emptyText="No upcoming trips." />
      <Section title="Completed" items={completed} emptyText="No completed trips yet." />
      <Section title="Cancelled" items={cancelled} emptyText="No cancelled trips." />
    </motion.div>
  );
};

export default MyTripsPanel;


