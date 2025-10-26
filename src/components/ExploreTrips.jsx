import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import tripService from '../services/tripService';

// Premium Icons Component
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    filter: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    map: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    heart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    arrow: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )
  };
  
  return icons[name] || null;
};

const ExploreTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedTrips, setLikedTrips] = useState(() => {
    try {
      const raw = localStorage.getItem('likedTrips');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  // Fetch trips from API
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await tripService.getTrips();
        
        if (response.success) {
          console.log('Fetched trips data:', response.data);
          console.log('First trip structure:', response.data[0]);
          setTrips(response.data);
          setFilteredTrips(response.data);
        } else {
          console.error('Failed to fetch trips:', response.message);
          // Fallback to empty array
          setTrips([]);
          setFilteredTrips([]);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        // Fallback to empty array
        setTrips([]);
        setFilteredTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = trips.filter(trip => {
      const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trip.tags && trip.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = !selectedCategory || trip.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || trip.difficulty === selectedDifficulty;
      const matchesDuration = !selectedDuration || trip.duration === selectedDuration;
      const matchesPrice = trip.price >= priceRange[0] && trip.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration && matchesPrice;
    });

    // Sort trips
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredTrips(filtered);
  }, [trips, searchTerm, selectedCategory, selectedDifficulty, selectedDuration, priceRange, sortBy]);

  const handleTripClick = (tripId) => {
    console.log('Clicking on trip with ID:', tripId);
    console.log('Trip ID type:', typeof tripId);
    if (!tripId || tripId === 'undefined' || tripId === 'null') {
      console.error('Invalid trip ID:', tripId);
      alert('Invalid trip ID. Please try again.');
      return;
    }
    navigate(`/trip/${tripId}`);
  };

  const toggleLike = (e, tripId) => {
    e.stopPropagation();
    e.preventDefault();
    setLikedTrips(prev => {
      const next = new Set(prev);
      if (next.has(tripId)) next.delete(tripId); else next.add(tripId);
      try { localStorage.setItem('likedTrips', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAvailabilityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading amazing trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Explore Amazing Trips</h1>
            <p className="text-slate-600 text-sm sm:text-base">Discover your next adventure with our curated travel experiences</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trips, destinations, or activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              <Icon name="filter" className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700 font-medium">Filters</span>
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Nature">Nature</option>
                    <option value="Photography">Photography</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Durations</option>
                    <option value="1 Day">1 Day</option>
                    <option value="2 Days">2 Days</option>
                    <option value="3 Days">3 Days</option>
                    <option value="4 Days">4 Days</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price Range</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filteredTrips.length}</span> of <span className="font-semibold text-slate-800">{trips.length}</span> trips
          </p>
        </div>

        {/* Trip Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="search" className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No trips found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => {
              const tripId = trip._id || trip.id;
              console.log('Rendering trip card with ID:', tripId, 'for trip:', trip.title);
              return (
              <motion.div
                key={tripId}
                onClick={() => handleTripClick(tripId)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* Trip Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {trip.isNew && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        New
                      </span>
                    )}
                    {trip.isPopular && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        Popular
                      </span>
                    )}
                    {trip.isEarlyBird && (
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                        Early Bird
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleLike(e, tripId)}
                    aria-label="Like"
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${likedTrips.has(tripId) ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-white/80 backdrop-blur-sm hover:bg-white text-slate-600'}`}
                  >
                    <Icon name="heart" className={`w-5 h-5 ${likedTrips.has(tripId) ? 'text-white' : 'text-slate-600'}`} />
                  </button>

                  {/* Availability */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className={`text-sm font-semibold ${getAvailabilityColor(trip.currentParticipants, trip.maxParticipants)}`}>
                      {trip.maxParticipants - trip.currentParticipants} spots left
                    </span>
                  </div>
                </div>

                {/* Trip Content */}
                <div className="p-6">
                  {/* Title */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors duration-200">
                      {trip.title}
                    </h3>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {trip.summary}
                  </p>

                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Icon name="calendar" className="w-4 h-4" />
                      <span>{formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Icon name="map" className="w-4 h-4" />
                      <span>{trip.startLocation} → {trip.endLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Icon name="clock" className="w-4 h-4" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Icon name="users" className="w-4 h-4" />
                      <span>{trip.difficulty} • Max {trip.maxParticipants} people</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {trip.tags && trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {trip.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{trip.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-slate-800">
                          {formatPrice(trip.isEarlyBird ? trip.earlyBirdPrice : trip.price)}
                        </span>
                        {trip.isEarlyBird && (
                          <span className="text-lg text-slate-500 line-through">
                            {formatPrice(trip.price)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">per person</p>
                    </div>
                    <button className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span className="text-sm font-semibold">View Details</span>
                      <Icon name="arrow" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreTrips;
