import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Tag,
  FileText,
  Settings,
  Globe,
  Lock,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Minus
} from 'lucide-react';
import tripService from '../../services/tripService';

const AddNewTrip = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [publishOption, setPublishOption] = useState('draft'); // 'draft', 'now', 'scheduled'
  const [enableEarlyBird, setEnableEarlyBird] = useState(false);

  // Duration states
  const [nightsType, setNightsType] = useState('select'); // 'select' or 'custom'
  const [daysType, setDaysType] = useState('select'); // 'select' or 'custom'
  const [selectedNights, setSelectedNights] = useState('');
  const [selectedDays, setSelectedDays] = useState('');
  const [customNights, setCustomNights] = useState('');
  const [customDays, setCustomDays] = useState('');

  const [tripData, setTripData] = useState({
    // Basic Information
    title: '',
    urlSlug: '',
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [''],
    
    // Pricing
    price: '',
    earlyBirdPrice: '',
    earlyBirdValidUntil: '',
    
    // Duration (will be calculated from nights/days)
    nights: '',
    days: '',
    duration: '', // Will be "3 Nights 4 Days"
    
    // Dates & Location
    departureDate: '',
    returnDate: '',
    bookingCutoffDate: '',
    startLocation: '',
    endLocation: '',
    transportMode: 'Bus',
    
    // Availability
    maxParticipants: '',
    seatLockAmount: '',
    
    // Trip Details
    category: 'Adventure',
    difficulty: 'Moderate',
    tripType: 'Group',
    ageGroup: 'All Ages',
    physicalFitness: 'Moderate',
    tags: [],
    
    // Detailed Itinerary
    itinerary: [
      {
        day: 1,
        title: '',
        activities: [''],
        meals: [''],
        accommodation: '',
        transport: '',
        distance: '',
        duration: '',
        highlights: [''],
        notes: ''
      }
    ],
    
    // Important Things to Note (Auto-populated with defaults)
    importantNotes: [
      'Don\'t carry too much cash or costly items',
      'Avoid heavy luggage as it can interrupt your travel',
      'Carry a valid ID proof',
      'Keep medicines if you have any specific health condition',
      'Wear comfortable shoes for trekking/walking'
    ],
    
    // Features
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    recommendations: '',
    cancellationPolicy: '',
    
    // Safety & Requirements
    safetyMeasures: [''],
    requiredDocuments: [''],
    healthRequirements: '',
    equipmentProvided: [''],
    equipmentRequired: [''],
    
    // Contact & Support
    emergencyContact: '',
    guideExperience: '',
    
    // Additional Information
    bestTimeToVisit: '',
    culturalNotes: '',
    packingList: [''],
    
    // Publishing Options
    publishNow: false,
    schedulePublishDate: '',
    schedulePublishTime: '',
    isPublished: false
  });

  // Auto-generate URL slug from title
  useEffect(() => {
    if (tripData.title && !tripData.urlSlug) {
      const slug = tripData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setTripData(prev => ({ ...prev, urlSlug: slug }));
    }
  }, [tripData.title]);

  // Update duration when nights/days change
  useEffect(() => {
    const nights = nightsType === 'custom' ? customNights : selectedNights;
    const days = daysType === 'custom' ? customDays : selectedDays;
    
    if (nights && days) {
      const duration = `${nights} ${nights === '1' ? 'Night' : 'Nights'} ${days} ${days === '1' ? 'Day' : 'Days'}`;
      setTripData(prev => ({ ...prev, nights, days, duration }));
    }
  }, [nightsType, daysType, selectedNights, selectedDays, customNights, customDays]);

  const handleInputChange = (field, value) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...tripData[field]];
    newArray[index] = value;
    setTripData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setTripData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setTripData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Itinerary handlers
  const handleItineraryChange = (dayIndex, field, value) => {
    setTripData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleItineraryArrayChange = (dayIndex, field, itemIndex, value) => {
    setTripData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? {
          ...day,
          [field]: day[field].map((item, j) => j === itemIndex ? value : item)
        } : day
      )
    }));
  };

  const addItineraryArrayItem = (dayIndex, field) => {
    setTripData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? {
          ...day,
          [field]: [...day[field], '']
        } : day
      )
    }));
  };

  const removeItineraryArrayItem = (dayIndex, field, itemIndex) => {
    setTripData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? {
          ...day,
          [field]: day[field].filter((_, j) => j !== itemIndex)
        } : day
      )
    }));
  };

  const addItineraryDay = () => {
    const newDay = {
      day: tripData.itinerary.length + 1,
      title: '',
      activities: [''],
      meals: [''],
      accommodation: '',
      transport: '',
      distance: '',
      duration: '',
      highlights: [''],
      notes: ''
    };
    setTripData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, newDay]
    }));
  };

  const removeItineraryDay = (index) => {
    if (tripData.itinerary.length > 1) {
      setTripData(prev => ({
        ...prev,
        itinerary: prev.itinerary
          .filter((_, i) => i !== index)
          .map((day, i) => ({ ...day, day: i + 1 }))
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Prepare data based on publish option
      const submitData = {
        ...tripData,
        isEarlyBird: enableEarlyBird,
      };

      if (publishOption === 'now') {
        submitData.isPublished = true;
      } else if (publishOption === 'scheduled') {
        submitData.isPublished = false;
        submitData.publishNow = false;
        submitData.schedulePublishDate = tripData.schedulePublishDate;
        submitData.schedulePublishTime = tripData.schedulePublishTime;
      } else {
        // draft
        submitData.isPublished = false;
      }

      const response = await tripService.createTrip(submitData);

      if (response.success) {
        alert(`Trip ${publishOption === 'draft' ? 'saved as draft' : publishOption === 'now' ? 'published' : 'scheduled'} successfully!`);
        navigate('/admin/trips');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'duration', label: 'Duration', icon: Clock },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'details', label: 'Details', icon: Settings },
    { id: 'requirements', label: 'Requirements', icon: AlertCircle },
    { id: 'publish', label: 'Publish', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/trips')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-800">Create New Trip</h1>
                <p className="text-slate-600 mt-1">Fill in the details to create your amazing trip</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-2"
        >
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 md:p-8"
          >
            {/* Basic Info Tab */}
            {currentTab === 'basic' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Basic Information</h2>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    value={tripData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Amazing Himalayan Adventure"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    URL Slug * <span className="text-xs text-slate-500">(SEO friendly URL)</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">ghumakkars.com/trip/</span>
                    <input
                      type="text"
                      value={tripData.urlSlug}
                      onChange={(e) => handleInputChange('urlSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="amazing-himalayan-adventure"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    This will be your trip's URL. Use lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Short Summary *
                  </label>
                  <textarea
                    value={tripData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="A brief, compelling summary of the trip (2-3 sentences)"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={tripData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the trip, what makes it special, what to expect..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={tripData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="Adventure">Adventure</option>
                      <option value="Spiritual">Spiritual</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Nature">Nature</option>
                      <option value="Photography">Photography</option>
                      <option value="Wellness">Wellness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      value={tripData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                      <option value="Difficult">Difficult</option>
                    </select>
                  </div>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Start Location *
                    </label>
                    <input
                      type="text"
                      value={tripData.startLocation}
                      onChange={(e) => handleInputChange('startLocation', e.target.value)}
                      placeholder="e.g., Delhi"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      End Location *
                    </label>
                    <input
                      type="text"
                      value={tripData.endLocation}
                      onChange={(e) => handleInputChange('endLocation', e.target.value)}
                      placeholder="e.g., Manali"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {currentTab === 'images' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Trip Images</h2>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cover Image URL *
                  </label>
                  <input
                    type="url"
                    value={tripData.coverImage}
                    onChange={(e) => handleInputChange('coverImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Main trip image displayed on cards and detail page
                  </p>
                  {tripData.coverImage && (
                    <div className="mt-4">
                      <img
                        src={tripData.coverImage}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-xl border-2 border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Gallery Images (URLs)
                  </label>
                  {tripData.galleryImages.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleArrayChange('galleryImages', index, e.target.value)}
                        placeholder="https://example.com/gallery-image.jpg"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                      {tripData.galleryImages.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('galleryImages', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('galleryImages')}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Gallery Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Duration Tab */}
            {currentTab === 'duration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Trip Duration & Dates</h2>

                {/* Duration Selection */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Trip Duration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nights */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Number of Nights *
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="nights-select"
                            checked={nightsType === 'select'}
                            onChange={() => setNightsType('select')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="nights-select" className="font-medium">Select from list</label>
                        </div>
                        
                        {nightsType === 'select' && (
                          <select
                            value={selectedNights}
                            onChange={(e) => setSelectedNights(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          >
                            <option value="">Select nights...</option>
                            {[...Array(10)].map((_, i) => (
                              <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'Night' : 'Nights'}</option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="nights-custom"
                            checked={nightsType === 'custom'}
                            onChange={() => setNightsType('custom')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="nights-custom" className="font-medium">Custom</label>
                        </div>
                        
                        {nightsType === 'custom' && (
                          <input
                            type="number"
                            min="1"
                            value={customNights}
                            onChange={(e) => setCustomNights(e.target.value)}
                            placeholder="Enter number of nights"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          />
                        )}
                      </div>
                    </div>

                    {/* Days */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Number of Days *
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="days-select"
                            checked={daysType === 'select'}
                            onChange={() => setDaysType('select')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="days-select" className="font-medium">Select from list</label>
                        </div>
                        
                        {daysType === 'select' && (
                          <select
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          >
                            <option value="">Select days...</option>
                            {[...Array(10)].map((_, i) => (
                              <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'Day' : 'Days'}</option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="days-custom"
                            checked={daysType === 'custom'}
                            onChange={() => setDaysType('custom')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="days-custom" className="font-medium">Custom</label>
                        </div>
                        
                        {daysType === 'custom' && (
                          <input
                            type="number"
                            min="1"
                            value={customDays}
                            onChange={(e) => setCustomDays(e.target.value)}
                            placeholder="Enter number of days"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Duration Preview */}
                  {tripData.duration && (
                    <div className="mt-6 p-4 bg-white rounded-xl border-2 border-blue-300">
                      <p className="text-sm text-slate-600 mb-1">Duration Preview:</p>
                      <p className="text-2xl font-black text-blue-600">{tripData.duration}</p>
                    </div>
                  )}
                </div>

                {/* Trip Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      value={tripData.departureDate}
                      onChange={(e) => handleInputChange('departureDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      value={tripData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>
                </div>

                {/* Booking Cutoff Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Booking Cut-off Date *
                  </label>
                  <input
                    type="date"
                    value={tripData.bookingCutoffDate}
                    onChange={(e) => handleInputChange('bookingCutoffDate', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Last day customers can book this trip. Usually 2-7 days before departure.
                  </p>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Maximum Participants *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tripData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    placeholder="e.g., 20"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* Transport Mode & Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Transport Mode *
                    </label>
                    <select
                      value={tripData.transportMode}
                      onChange={(e) => handleInputChange('transportMode', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="Bus">Bus</option>
                      <option value="Tempo Traveler">Tempo Traveler</option>
                      <option value="Train">Train</option>
                      <option value="Flight">Flight</option>
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Trip Type *
                    </label>
                    <select
                      value={tripData.tripType}
                      onChange={(e) => handleInputChange('tripType', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="Group">Group</option>
                      <option value="Private">Private</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Age Group *
                    </label>
                    <select
                      value={tripData.ageGroup}
                      onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="All Ages">All Ages</option>
                      <option value="18+">18+</option>
                      <option value="21+">21+</option>
                      <option value="Family">Family</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>

                {/* Physical Fitness */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Physical Fitness Required *
                  </label>
                  <select
                    value={tripData.physicalFitness}
                    onChange={(e) => handleInputChange('physicalFitness', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  >
                    <option value="Low">Low - Anyone can participate</option>
                    <option value="Moderate">Moderate - Basic fitness required</option>
                    <option value="High">High - Good fitness required</option>
                    <option value="Extreme">Extreme - Excellent fitness required</option>
                  </select>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {currentTab === 'pricing' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Pricing Details</h2>

                {/* Regular Price */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Price per Person (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tripData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="e.g., 15000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-lg"
                  />
                </div>

                {/* Early Bird Toggle */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Early Bird Discount</h3>
                      <p className="text-sm text-green-700">Offer a special price for early bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableEarlyBird}
                        onChange={(e) => setEnableEarlyBird(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <AnimatePresence>
                    {enableEarlyBird && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-bold text-green-900 mb-2">
                            Early Bird Price (₹) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tripData.earlyBirdPrice}
                            onChange={(e) => handleInputChange('earlyBirdPrice', e.target.value)}
                            placeholder="e.g., 12000"
                            className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-green-900 mb-2">
                            Valid Until *
                          </label>
                          <input
                            type="date"
                            value={tripData.earlyBirdValidUntil}
                            onChange={(e) => handleInputChange('earlyBirdValidUntil', e.target.value)}
                            className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                          />
                          <p className="text-xs text-green-700 mt-1">
                            After this date, regular price will apply
                          </p>
                        </div>

                        {tripData.earlyBirdPrice && tripData.price && (
                          <div className="p-4 bg-white rounded-xl border-2 border-green-300">
                            <p className="text-sm text-green-900 mb-1">Discount:</p>
                            <p className="text-2xl font-black text-green-600">
                              ₹{tripData.price - tripData.earlyBirdPrice} OFF ({Math.round(((tripData.price - tripData.earlyBirdPrice) / tripData.price) * 100)}%)
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Seat Lock Amount */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Seat Lock Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tripData.seatLockAmount}
                    onChange={(e) => handleInputChange('seatLockAmount', e.target.value)}
                    placeholder="e.g., 3000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Minimum amount to reserve a seat. Remaining amount due before trip departure.
                  </p>
                </div>
              </div>
            )}

            {/* Itinerary Tab */}
            {currentTab === 'itinerary' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-800">Day-by-Day Itinerary</h2>
                  <button
                    onClick={addItineraryDay}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Day</span>
                  </button>
                </div>

                {tripData.itinerary.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-blue-900">Day {day.day}</h3>
                      {tripData.itinerary.length > 1 && (
                        <button
                          onClick={() => removeItineraryDay(dayIndex)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Day Title */}
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">
                          Day Title *
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                          placeholder="e.g., Arrival & Orientation"
                          className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                      </div>

                      {/* Activities */}
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">
                          Activities
                        </label>
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => handleItineraryArrayChange(dayIndex, 'activities', actIndex, e.target.value)}
                              placeholder="e.g., Morning trek to base camp"
                              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {day.activities.length > 1 && (
                              <button
                                onClick={() => removeItineraryArrayItem(dayIndex, 'activities', actIndex)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItineraryArrayItem(dayIndex, 'activities')}
                          className="text-sm flex items-center space-x-1 px-3 py-1 text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Activity</span>
                        </button>
                      </div>

                      {/* Meals */}
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">
                          Meals Included
                        </label>
                        {day.meals.map((meal, mealIndex) => (
                          <div key={mealIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={meal}
                              onChange={(e) => handleItineraryArrayChange(dayIndex, 'meals', mealIndex, e.target.value)}
                              placeholder="e.g., Breakfast, Lunch, Dinner"
                              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {day.meals.length > 1 && (
                              <button
                                onClick={() => removeItineraryArrayItem(dayIndex, 'meals', mealIndex)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItineraryArrayItem(dayIndex, 'meals')}
                          className="text-sm flex items-center space-x-1 px-3 py-1 text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Meal</span>
                        </button>
                      </div>

                      {/* Accommodation */}
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">
                          Accommodation
                        </label>
                        <input
                          type="text"
                          value={day.accommodation}
                          onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                          placeholder="e.g., 3-star Hotel, Camping, Homestay"
                          className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                      </div>

                      {/* Key Notes (Optional) */}
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">
                          Key Notes (Optional)
                        </label>
                        <textarea
                          value={day.notes}
                          onChange={(e) => handleItineraryChange(dayIndex, 'notes', e.target.value)}
                          placeholder="Any important notes or highlights for this day (optional)..."
                          rows={2}
                          className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Details Tab */}
            {currentTab === 'details' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Trip Details</h2>

                {/* Highlights */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Trip Highlights
                  </label>
                  {tripData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                        placeholder="e.g., Trek to 15,000 ft altitude"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                      {tripData.highlights.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('highlights', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('highlights')}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Highlight</span>
                  </button>
                </div>

                {/* Inclusions */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    What's Included
                  </label>
                  {tripData.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={inclusion}
                        onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                        placeholder="e.g., Accommodation, Meals, Transport"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                      {tripData.inclusions.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('inclusions', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('inclusions')}
                    className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Inclusion</span>
                  </button>
                </div>

                {/* Exclusions */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    What's Not Included
                  </label>
                  {tripData.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={exclusion}
                        onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                        placeholder="e.g., Personal expenses, Insurance"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                      {tripData.exclusions.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('exclusions', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('exclusions')}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Exclusion</span>
                  </button>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={tripData.recommendations}
                    onChange={(e) => handleInputChange('recommendations', e.target.value)}
                    placeholder="Any additional information, recommendations, important notes..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>
            )}

            {/* Requirements Tab */}
            {currentTab === 'requirements' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Requirements & Info</h2>

                {/* Important Things to Note */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-bold text-orange-900">Important Things to Note</h3>
                  </div>
                  <p className="text-sm text-orange-700 mb-4">These tips are auto-added to every trip. You can add more or remove any.</p>
                  
                  {tripData.importantNotes.map((note, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleArrayChange('importantNotes', index, e.target.value)}
                        placeholder="Add important note..."
                        className="flex-1 px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
                      />
                      {tripData.importantNotes.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('importantNotes', index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('importantNotes')}
                    className="flex items-center space-x-2 px-4 py-2 text-orange-700 hover:bg-orange-100 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add More Tips</span>
                  </button>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    value={tripData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="e.g., +91-8384826414"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* Best Time to Visit */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={tripData.bestTimeToVisit}
                    onChange={(e) => handleInputChange('bestTimeToVisit', e.target.value)}
                    placeholder="e.g., March to June, September to November"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                {/* Cancellation Policy */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cancellation Policy
                  </label>
                  <textarea
                    value={tripData.cancellationPolicy}
                    onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                    placeholder="Describe your cancellation and refund policy..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>
            )}

            {/* Publish Tab */}
            {currentTab === 'publish' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Publish Options</h2>

                {/* Publishing Options */}
                <div className="space-y-4">
                  {/* Save as Draft */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setPublishOption('draft')}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      publishOption === 'draft'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${publishOption === 'draft' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                          <Lock className={`w-6 h-6 ${publishOption === 'draft' ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Save as Draft</h3>
                          <p className="text-sm text-slate-600">Save without publishing. You can publish later.</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={publishOption === 'draft'}
                        onChange={() => setPublishOption('draft')}
                        className="w-5 h-5"
                      />
                    </div>
                  </motion.div>

                  {/* Publish Now */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setPublishOption('now')}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      publishOption === 'now'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${publishOption === 'now' ? 'bg-green-500' : 'bg-slate-200'}`}>
                          <Zap className={`w-6 h-6 ${publishOption === 'now' ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Publish Now</h3>
                          <p className="text-sm text-slate-600">Make trip visible and bookable immediately.</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={publishOption === 'now'}
                        onChange={() => setPublishOption('now')}
                        className="w-5 h-5"
                      />
                    </div>
                  </motion.div>

                  {/* Schedule Publish */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setPublishOption('scheduled')}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      publishOption === 'scheduled'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${publishOption === 'scheduled' ? 'bg-purple-500' : 'bg-slate-200'}`}>
                          <Calendar className={`w-6 h-6 ${publishOption === 'scheduled' ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Schedule Publish</h3>
                          <p className="text-sm text-slate-600">Auto-publish at a specific date and time.</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={publishOption === 'scheduled'}
                        onChange={() => setPublishOption('scheduled')}
                        className="w-5 h-5"
                      />
                    </div>

                    <AnimatePresence>
                      {publishOption === 'scheduled' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                        >
                          <div>
                            <label className="block text-sm font-bold text-purple-900 mb-2">
                              Publish Date
                            </label>
                            <input
                              type="date"
                              value={tripData.schedulePublishDate}
                              onChange={(e) => handleInputChange('schedulePublishDate', e.target.value)}
                              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-purple-900 mb-2">
                              Publish Time
                            </label>
                            <input
                              type="time"
                              value={tripData.schedulePublishTime}
                              onChange={(e) => handleInputChange('schedulePublishTime', e.target.value)}
                              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Trip Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Title:</span>
                      <span className="font-semibold">{tripData.title || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">URL:</span>
                      <span className="font-semibold text-blue-600">{tripData.urlSlug || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-semibold">{tripData.duration || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-semibold">₹{tripData.price || '0'}</span>
                    </div>
                    {enableEarlyBird && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Early Bird:</span>
                        <span className="font-semibold text-green-600">₹{tripData.earlyBirdPrice || '0'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Max Participants:</span>
                      <span className="font-semibold">{tripData.maxParticipants || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Publish Option:</span>
                      <span className="font-semibold capitalize">{publishOption}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6"
        >
          <div className="flex items-center justify-between">
            {/* Left: Cancel or Previous */}
            <div>
              {currentTab === 'basic' ? (
                <button
                  onClick={() => navigate('/admin/trips')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === currentTab);
                    if (currentIndex > 0) {
                      setCurrentTab(tabs[currentIndex - 1].id);
                    }
                  }}
                  className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            {/* Right: Next or Submit */}
            <div>
              {currentTab === 'publish' ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>
                        {publishOption === 'draft' ? 'Save Draft' : publishOption === 'now' ? 'Publish Now' : 'Schedule Trip'}
                      </span>
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === currentTab);
                    if (currentIndex < tabs.length - 1) {
                      setCurrentTab(tabs[currentIndex + 1].id);
                    }
                  }}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddNewTrip;

