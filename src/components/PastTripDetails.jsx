import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import tripService from '../services/tripService';
import reviewService from '../services/reviewService';
import { API_URL } from '../utils/apiConfig';
import {
  ArrowLeft, Star, Share2, Calendar, MapPin, Users, Clock,
  Check, ChevronDown, Image, List, Info, MessageCircle,
  Award, Camera, History, Heart, Send, Upload, X
} from 'lucide-react';

const PastTripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    images: []
  });
  const [submittingReview, setSubmittingReview] = useState(false);

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
          setTrip(response.data);
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
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setLoadingReviews(true);
        const response = await reviewService.listReviews(id);
        if (response.success) {
          setReviews(response.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Check review eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated || !id) {
        setReviewEligibility({ canReview: false });
        return;
      }

      try {
        const response = await reviewService.checkEligibility(id);
      if (response.success) {
        setReviewEligibility(response);
        if (response.hasExistingReview && response.existingReview) {
          setReviewForm({
            rating: response.existingReview.rating,
            comment: response.existingReview.comment,
            images: response.existingReview.images || []
          });
        }
      }
      } catch (error) {
        console.error('Error checking eligibility:', error);
        setReviewEligibility({ canReview: false });
      }
    };

    checkEligibility();
  }, [isAuthenticated, id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.slice(0, 6 - reviewForm.images.length);
    setReviewForm(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeImage = (index) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.rating || reviewForm.rating < 1) {
      alert('Please select a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Separate existing image URLs from new file uploads
      const existingImages = reviewForm.images.filter(img => typeof img === 'string' || (img instanceof String));
      const newFiles = reviewForm.images.filter(img => img instanceof File);
      
      const response = await reviewService.submitReview(id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        files: newFiles,
        existingImages: existingImages
      });

      if (response.success) {
        alert('Review submitted successfully!');
        setShowReviewForm(false);
        // Refresh reviews
        const reviewsResponse = await reviewService.listReviews(id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.reviews || []);
        }
        // Reset form
        setReviewForm({ rating: 0, comment: '', images: [] });
      } else {
        alert(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-10 h-10 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Hero Section with Vintage/Retrospective Feel */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/60 to-transparent"></div>
        </motion.div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 bg-slate-900/30 backdrop-blur-xl border-b border-slate-700/30 z-40">
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
            {/* Past Trip Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold rounded-full flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Past Trip</span>
              </span>
              <span className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                {trip.category}
              </span>
              <span className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                {trip.difficulty}
              </span>
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-bold text-white">{trip.rating}</span>
                <span className="text-white/80 text-sm">({trip.reviews})</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-2xl">
              {trip.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg mb-4">
              {trip.summary}
            </p>

            {/* Trip Info */}
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
                <Clock className="w-5 h-5 text-white/80" />
                <span className="font-semibold">
                  {formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Users className="w-5 h-5 text-white/80" />
                <span className="font-semibold">{trip.currentParticipants || 0} participants</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-20 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-2 mb-6 sticky top-6 lg:top-8 z-30">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg scale-105'
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
              {/* Trip Description */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">About This Trip</h2>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {trip.description || trip.summary} This journey was carefully curated to provide an unforgettable experience.
                  </p>
                </div>
              </div>

              {/* Trip Highlights */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Trip Highlights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.highlights && trip.highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <span className="text-slate-700 font-semibold leading-relaxed">{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trip.inclusions && trip.inclusions.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">What Was Included</h3>
                    </div>
                    <ul className="space-y-2">
                      {trip.inclusions.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trip.exclusions && trip.exclusions.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-slate-600 rounded-lg">
                        <span className="text-white font-bold">✕</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Not Included</h3>
                    </div>
                    <ul className="space-y-2">
                      {trip.exclusions.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <span className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5 font-bold">✕</span>
                          <span className="text-slate-700 font-medium text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ITINERARY TAB */}
          {activeTab === 'itinerary' && trip.itinerary && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
                    <List className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Day by Day Journey</h2>
                </div>
                
                {trip.itinerary.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-4"
                  >
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <button
                        onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                        className="w-full p-6 text-left hover:bg-white/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                              <div className="text-center">
                                <div className="text-xs text-white/80 font-semibold">DAY</div>
                                <div className="text-2xl font-black text-white">{day.day}</div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800 mb-1">{day.title}</h3>
                              <p className="text-sm text-slate-600">
                                {day.activities && day.activities.length > 0 
                                  ? `${day.activities.length} activities` 
                                  : 'Day itinerary'
                                }
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
                              expandedDay === index ? 'rotate-180 text-slate-600' : ''
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
                              {day.activities && day.activities.length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-green-100">
                                  <h4 className="font-bold text-green-800 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                                      <Check className="w-5 h-5 text-white" />
                                    </div>
                                    Activities
                                  </h4>
                                  <ul className="space-y-3">
                                    {day.activities.map((activity, i) => (
                                      <li key={i} className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2.5"></div>
                                        <span className="text-slate-700 leading-relaxed">{activity}</span>
                                      </li>
                                    ))}
                                  </ul>
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
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Photo Gallery</h2>
                </div>

                <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-6">
                  {trip.galleryImages && trip.galleryImages.length > 0 ? (
                    <>
                      <img
                        src={trip.galleryImages[selectedImage]}
                        alt={`Gallery ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />
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

                {trip.galleryImages && trip.galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {trip.galleryImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 ${
                          selectedImage === index
                            ? 'ring-4 ring-slate-600 shadow-xl scale-110'
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
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
              className="space-y-6"
            >
              {/* Review Form for Eligible Users */}
              {isAuthenticated && reviewEligibility?.canReview && (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                          {reviewEligibility.hasExistingReview ? 'Edit Your Review' : 'Write a Review'}
                        </h2>
                        <p className="text-slate-600">
                          {reviewEligibility.hasExistingReview 
                            ? 'Update your review for this trip' 
                            : 'Share your experience from this trip'}
                        </p>
                      </div>
                    </div>
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{reviewEligibility.hasExistingReview ? 'Edit Review' : 'Write Review'}</span>
                      </button>
                    )}
                  </div>

                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSubmitReview}
                      className="space-y-6"
                    >
                      {/* Star Rating */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Rating</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-10 h-10 ${
                                  star <= reviewForm.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          {reviewForm.rating > 0 && (
                            <span className="ml-3 text-slate-600 font-semibold">
                              {reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your experience, highlights, and any tips for future travelers..."
                          rows={6}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent resize-none"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-2">{reviewForm.comment.length}/1000 characters</p>
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Photos (Optional)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                          {reviewForm.images.map((image, index) => {
                            // Determine image source - handle both File objects and URL strings
                            const imageSrc = image instanceof File 
                              ? URL.createObjectURL(image)
                              : (typeof image === 'string' 
                                  ? (image.startsWith('http') || image.startsWith('/uploads') 
                                      ? image.startsWith('http') ? image : `${API_URL}${image.startsWith('/') ? image : `/${image}`}`
                                      : image)
                                  : image);
                            
                            return (
                              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                                <img
                                  src={imageSrc}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                          {reviewForm.images.length < 6 && (
                            <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <div className="text-center">
                                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Add Photo</p>
                              </div>
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">You can add up to 6 photos</p>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={submittingReview || !reviewForm.rating || !reviewForm.comment.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                          <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(false);
                            if (!reviewEligibility.hasExistingReview) {
                              setReviewForm({ rating: 0, comment: '', images: [] });
                            }
                          }}
                          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {!showReviewForm && reviewEligibility.hasExistingReview && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-green-800 text-sm">
                        ✓ You have already reviewed this trip. Click "Edit Review" to update your review.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Show message if not eligible */}
              {isAuthenticated && reviewEligibility && !reviewEligibility.canReview && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 mb-1">Review Eligibility</h3>
                      <p className="text-amber-800 text-sm">
                        {reviewEligibility.reason || 'Only travelers who completed this trip can leave a review.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Traveler Reviews</h2>
                      <p className="text-slate-600">What travelers experienced</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {reviews.length > 0 && (
                      <>
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                          <span className="text-3xl font-black text-slate-800">
                            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                      </>
                    )}
                  </div>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                              {review.user?.profilePicture ? (
                                <img
                                  src={review.user.profilePicture}
                                  alt={review.user.name || 'User'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-white font-bold text-xl">
                                  {(review.user?.name || 'A').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg">{review.user?.name || 'Anonymous'}</h4>
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
                            {review.createdAt ? formatDate(review.createdAt) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-4">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                            {review.images.map((image, imgIndex) => {
                              // Handle both full URLs and relative paths
                              const imageUrl = typeof image === 'string' 
                                ? (image.startsWith('http') 
                                    ? image 
                                    : (image.startsWith('/uploads') 
                                        ? `${API_URL}${image}`
                                        : image))
                                : image;
                              
                              return (
                                <img
                                  key={imgIndex}
                                  src={imageUrl}
                                  alt={`Review photo ${imgIndex + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No reviews yet.</p>
                    {!isAuthenticated && (
                      <p className="text-slate-400 text-sm mt-2">Sign in to see if you can review this trip.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <History className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">This Trip Has Concluded</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            While this journey has ended, the memories live on. Explore our upcoming adventures and create new experiences!
          </p>
          <button
            onClick={() => navigate('/explore-trips')}
            className="px-8 py-3 bg-white text-slate-800 rounded-xl hover:bg-slate-100 transition-all duration-200 font-semibold flex items-center space-x-2 mx-auto"
          >
            <span>Explore Upcoming Trips</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastTripDetails;

