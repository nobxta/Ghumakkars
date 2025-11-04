import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import tripService from '../services/tripService';
import {
  ArrowLeft, Star, Heart, Share2, Calendar, MapPin, Users, Clock,
  Check, ChevronDown, Image, List, Info, MessageCircle, Map,
  Backpack, Sun, Cloud, Shield, Camera, Award, ChevronRight,
  Target, Zap, Ban, CreditCard, AlertCircle, Phone, Mail
} from 'lucide-react';

const TripDetailsEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);

  // Refresh user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const isPastTrip = (departureDate) => {
    if (!departureDate) return false;
    const now = new Date();
    const tripDate = new Date(departureDate);
    // Reset time to midnight for accurate date comparison
    now.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate < now;
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
      month: 'long',
      year: 'numeric'
    });
  };

  // Fetch trip from API
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        
        if (!id || id === 'undefined' || id === 'null') {
          console.error('Invalid trip ID:', id);
          setTrip(null);
          return;
        }
        
        const response = await tripService.getTripById(id);
        
        if (response.success) {
          const tripData = response.data;
          // Check if trip is past and redirect to past trip page
          if (isPastTrip(tripData.departureDate)) {
            navigate(`/past-trip/${id}`, { replace: true });
            return;
          }
          setTrip(tripData);
        } else {
          console.error('Failed to fetch trip:', response.message);
          setTrip(null);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id, navigate]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/trip/' + id);
      return;
    }
    navigate(`/booking/${id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: trip.summary,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'itinerary', label: 'Itinerary', icon: List },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading amazing experience...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Trip not found</h2>
          <p className="text-slate-600 mb-6">The trip you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/explore-trips')}
            className="btn-primary-gradient"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        </motion.div>

        {/* Floating Navigation */}
        <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/explore-trips')}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline font-medium">Back to Trips</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {trip.isEarlyBird && (
                <span className="badge-seat-locked animate-pulse">
                  <Zap className="w-4 h-4" />
                  Early Bird Offer
                </span>
              )}
              <span className="px-4 py-2 bg-purple-500/80 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                {trip.category}
              </span>
              <span className="px-4 py-2 bg-blue-500/80 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                {trip.difficulty}
              </span>
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-bold text-white">{trip.rating}</span>
                <span className="text-white/80 text-sm">({trip.reviews})</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 drop-shadow-2xl">
              {trip.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg mb-4">
              {trip.summary}
            </p>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center space-x-2 text-white">
                <Calendar className="w-5 h-5 text-white/80" />
                <span className="font-semibold">{trip.duration || `${trip.nights || 0} Nights ${trip.days || 1} Days`}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <MapPin className="w-5 h-5 text-white/80" />
                <span className="font-semibold">{trip.startLocation} → {trip.endLocation}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Users className="w-5 h-5 text-white/80" />
                <span className="font-semibold">
                  {isPastTrip(trip.departureDate) ? 'Past trip' : `${trip.maxParticipants - trip.currentParticipants} spots left`}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="card-premium p-2 mb-6 sticky top-6 lg:top-8 z-30 bg-white/95 backdrop-blur-xl">
              <div className="grid grid-cols-4 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Why Choose This Trip */}
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Why This Trip?</h2>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                      <p className="text-slate-700 text-lg leading-relaxed">
                        {trip.description || trip.summary} Experience the perfect blend of adventure, culture, and natural beauty in this carefully curated journey.
                      </p>
                    </div>
                  </div>

                  {/* Trip Highlights */}
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Trip Highlights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trip.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group flex items-start space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <span className="text-slate-700 font-semibold leading-relaxed">{highlight}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* What to Bring */}
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                        <Backpack className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">What to Pack</h2>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                      <p className="text-orange-900 text-lg leading-relaxed font-medium mb-4">
                        {trip.recommendations}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {['Comfortable footwear', 'Sunscreen & hat', 'Water bottle', 'Camera', 'Light jacket', 'Personal medications'].map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-white/70 rounded-lg px-3 py-2">
                            <Check className="w-4 h-4 text-orange-600" />
                            <span className="text-slate-700 text-sm font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inclusions */}
                    <div className="card-premium p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">What's Included</h3>
                      </div>
                      <ul className="space-y-2">
                        {trip.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-all">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    <div className="card-premium p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-500 rounded-lg">
                          <Ban className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Not Included</h3>
                      </div>
                      <ul className="space-y-2">
                        {trip.exclusions.map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-3 hover:shadow-md transition-all">
                            <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Important Things to Note */}
                  {trip.importantNotes && trip.importantNotes.length > 0 && (
                    <div className="card-premium p-6 sm:p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Important Things to Note</h2>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                        <ul className="space-y-3">
                          {trip.importantNotes.map((note, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">!</span>
                              </div>
                              <span className="text-slate-800 font-medium leading-relaxed">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-slate-600 rounded-lg">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Cancellation Policy</h3>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <p className="text-slate-700 leading-relaxed">{trip.cancellationPolicy}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ITINERARY TAB */}
              {activeTab === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <List className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Day by Day</h2>
                    </div>
                    
                    {trip.itinerary.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-4"
                      >
                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                          <button
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                            className="w-full p-6 text-left hover:bg-white/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                  <div className="text-center">
                                    <div className="text-xs text-white/80 font-semibold">DAY</div>
                                    <div className="text-2xl font-black text-white">{day.day}</div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-800 mb-1">{day.title}</h3>
                                  <p className="text-sm text-slate-600">
                                    {day.activities && day.activities.length > 0 
                                      ? `${day.activities.length} activities planned`
                                      : 'Day itinerary'
                                    }
                                  </p>
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
                                  expandedDay === index ? 'rotate-180 text-blue-600' : ''
                                }`}
                              />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedDay === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6"
                              >
                                <div className="space-y-4 pt-4">
                                  {/* Activities */}
                                  {day.activities && day.activities.length > 0 && (
                                    <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                                      <h4 className="font-bold text-green-800 mb-3 flex items-center">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                          <Check className="w-5 h-5 text-white" />
                                        </div>
                                        Activities
                                      </h4>
                                      <ul className="space-y-3">
                                        {day.activities.map((activity, i) => (
                                          <li key={i} className="flex items-start space-x-3 group">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 group-hover:scale-150 transition-transform"></div>
                                            <span className="text-slate-700 leading-relaxed">{activity}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Meals */}
                                  {day.meals && day.meals.length > 0 && (
                                    <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
                                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                                          🍽️
                                        </div>
                                        Meals Included
                                      </h4>
                                      <p className="text-slate-700">{day.meals.join(' • ')}</p>
                                    </div>
                                  )}

                                  {/* Accommodation */}
                                  {day.accommodation && (
                                    <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
                                      <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                                          🏨
                                        </div>
                                        Accommodation
                                      </h4>
                                      <p className="text-slate-700">{day.accommodation}</p>
                                    </div>
                                  )}

                                  {/* Key Notes */}
                                  {day.notes && (
                                    <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                                      <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                                          📌
                                        </div>
                                        Key Notes
                                      </h4>
                                      <p className="text-slate-700 leading-relaxed">{day.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* GALLERY TAB */}
              {activeTab === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Photo Gallery</h2>
                    </div>

                    {/* Main Image */}
                    <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-6 group">
                      {trip.galleryImages && trip.galleryImages.length > 0 ? (
                        <>
                          <img
                            src={trip.galleryImages[selectedImage]}
                            alt={`Gallery ${selectedImage + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {selectedImage + 1} / {trip.galleryImages.length}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <p className="text-slate-400">No images available</p>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Grid */}
                    {trip.galleryImages && trip.galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {trip.galleryImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 ${
                              selectedImage === index
                                ? 'ring-4 ring-purple-500 shadow-xl scale-110'
                                : 'hover:shadow-lg'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {selectedImage === index && (
                              <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5 text-purple-600" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="card-premium p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Reviews</h2>
                          <p className="text-slate-600">What travelers say</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                          <span className="text-3xl font-black text-slate-800">{trip.rating}</span>
                        </div>
                        <p className="text-sm text-slate-600">{trip.reviews} reviews</p>
                      </div>
                    </div>

                    {trip.reviewList && trip.reviewList.length > 0 ? (
                      <div className="space-y-4">
                        {trip.reviewList.map((review, index) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-xl">
                                    {review.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-lg">{review.name}</h4>
                                  <div className="flex items-center space-x-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-slate-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {formatDate(review.date)}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">No reviews yet. Be the first!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card-premium p-6 sm:p-8">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-800">
                      {formatPrice(trip.isEarlyBird ? trip.earlyBirdPrice : trip.price)}
                    </span>
                    {trip.isEarlyBird && (
                      <span className="text-2xl text-slate-400 line-through">
                        {formatPrice(trip.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-semibold">per person</p>
                  {trip.isEarlyBird && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
                      <p className="text-green-800 font-bold flex items-center justify-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Save {formatPrice(trip.price - trip.earlyBirdPrice)}!
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                    <span className="text-slate-600 font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Departure
                    </span>
                    <span className="font-bold text-slate-800">{formatDate(trip.departureDate)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                    <span className="text-slate-600 font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Return
                    </span>
                    <span className="font-bold text-slate-800">{formatDate(trip.returnDate)}</span>
                  </div>
                  {isPastTrip(trip.departureDate) ? (
                    <div className="flex justify-between items-center p-4 rounded-xl border-2 bg-slate-50 border-slate-300">
                      <span className="text-slate-700 font-semibold flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Status
                      </span>
                      <div className="text-right">
                        <span className="font-black text-xl text-slate-600">
                          Past trip
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${
                      trip.maxParticipants - trip.currentParticipants <= 3
                        ? 'bg-red-50 border-red-300'
                        : trip.maxParticipants - trip.currentParticipants <= 10
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-green-50 border-green-300'
                    }`}>
                      <span className="text-slate-700 font-semibold flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Spots Left
                      </span>
                      <div className="text-right">
                        <span className={`font-black text-xl ${
                          trip.maxParticipants - trip.currentParticipants <= 3
                            ? 'text-red-600'
                            : trip.maxParticipants - trip.currentParticipants <= 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {trip.maxParticipants - trip.currentParticipants}
                        </span>
                        {trip.maxParticipants - trip.currentParticipants <= 3 && (
                          <div className="text-xs text-red-600 font-bold">⚠️ Almost Full!</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Button */}
                <button
                  onClick={handleBooking}
                  className="w-full btn-primary-gradient py-4 text-lg flex items-center justify-center space-x-2 mb-4"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{isAuthenticated ? 'Book Your Spot' : 'Login to Book'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Contact Support */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Need Help?
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">Our travel experts are here to help!</p>
                  <div className="space-y-2">
                    <a href="tel:+918384826414" className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Phone className="w-4 h-4 mr-2" />
                      +91 83848 26414
                    </a>
                    <a href="mailto:contact@ghumakkars.in" className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Mail className="w-4 h-4 mr-2" />
                      contact@ghumakkars.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl z-50 p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-slate-800">
                {formatPrice(trip.isEarlyBird ? trip.earlyBirdPrice : trip.price)}
              </span>
              {trip.isEarlyBird && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(trip.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">per person</p>
          </div>
          <button
            onClick={handleBooking}
            className="btn-primary-gradient px-8 py-3 flex items-center space-x-2"
          >
            <span>{isAuthenticated ? 'Book Now' : 'Login'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsEnhanced;

