import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Minus,
  Send,
  MessageCircle,
  Camera,
  Route,
  Star,
  Heart,
  Share2,
  Edit3,
  Trash2,
  RefreshCw,
  Shield
} from 'lucide-react';
import tripService from '../../services/tripService';

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [trip, setTrip] = useState({
    // Basic Information
    title: '',
    urlSlug: '',
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [],
    
    // Pricing
    price: '',
    earlyBirdPrice: '',
    earlyBirdValidUntil: '',
    
    // Duration
    nights: '',
    days: '',
    duration: '', // Will be auto-generated
    
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
    
    // Important Things to Note
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
    isPublished: false,
    
    // WhatsApp Group Link
    whatsappGroupLink: ''
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText, description: 'Trip title, description, and basic details' },
    { id: 2, title: 'Duration & Dates', icon: Calendar, description: 'Trip duration, dates, and locations' },
    { id: 3, title: 'Pricing', icon: DollarSign, description: 'Pricing, early bird offers, and seat lock' },
    { id: 4, title: 'Images', icon: Camera, description: 'Cover image and gallery' },
    { id: 5, title: 'Itinerary', icon: Route, description: 'Day-by-day trip itinerary' },
    { id: 6, title: 'Details', icon: Settings, description: 'Inclusions, exclusions, and requirements' },
    { id: 7, title: 'Review', icon: Eye, description: 'Review and save changes' }
  ];

  useEffect(() => {
    if (id) {
      // Check if there's saved data in localStorage first
      const savedData = localStorage.getItem(`trip-edit-${id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setTrip(parsedData);
          setLoading(false);
        } catch (error) {
          console.error('Error parsing saved trip data:', error);
      fetchTrip();
        }
      } else {
        fetchTrip();
      }
    }
  }, [id]);

  // Auto-generate duration from nights and days
  useEffect(() => {
    if (trip.nights !== '' && trip.days !== '') {
      const nights = parseInt(trip.nights);
      const days = parseInt(trip.days);
      if (nights >= 0 && days >= 1) {
        const nightsText = nights === 1 ? 'Night' : 'Nights';
        const daysText = days === 1 ? 'Day' : 'Days';
        const duration = `${nights} ${nightsText} ${days} ${daysText}`;
        setTrip(prev => ({ ...prev, duration }));
      }
    }
  }, [trip.nights, trip.days]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripById(id);
      if (response.success) {
        const tripData = response.data;
        
        // Parse nights and days from duration if not already set
        let nights = tripData.nights || '';
        let days = tripData.days || '';
        
        // If duration exists but nights/days don't, try to parse from duration
        if (tripData.duration && (!nights || !days)) {
          const durationMatch = tripData.duration.match(/(\d+)\s+(Night|Nights)\s+(\d+)\s+(Day|Days)/);
          if (durationMatch) {
            nights = durationMatch[1];
            days = durationMatch[3];
          }
        }

        // Format dates properly for form inputs
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        console.log('Trip data loaded:', {
          departureDate: tripData.departureDate,
          returnDate: tripData.returnDate,
          formattedDeparture: formatDateForInput(tripData.departureDate),
          formattedReturn: formatDateForInput(tripData.returnDate)
        });
        
        setTrip({
          ...tripData,
          // Ensure dates are properly formatted for HTML date inputs
          departureDate: formatDateForInput(tripData.departureDate),
          returnDate: formatDateForInput(tripData.returnDate),
          bookingCutoffDate: formatDateForInput(tripData.bookingCutoffDate),
          earlyBirdValidUntil: formatDateForInput(tripData.earlyBirdValidUntil),
          schedulePublishDate: formatDateForInput(tripData.schedulePublishDate),
          // Convert numbers to strings for form inputs
          nights: nights.toString(),
          days: days.toString(),
          price: tripData.price ? tripData.price.toString() : '',
          earlyBirdPrice: tripData.earlyBirdPrice ? tripData.earlyBirdPrice.toString() : '',
          maxParticipants: tripData.maxParticipants ? tripData.maxParticipants.toString() : '',
          seatLockAmount: tripData.seatLockAmount ? tripData.seatLockAmount.toString() : '',
          // Ensure arrays are properly initialized
          galleryImages: tripData.galleryImages && tripData.galleryImages.length > 0 ? tripData.galleryImages : [''],
          itinerary: tripData.itinerary && tripData.itinerary.length > 0 ? tripData.itinerary : [{
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
          }],
          importantNotes: tripData.importantNotes && tripData.importantNotes.length > 0 ? tripData.importantNotes : [
            'Don\'t carry too much cash or costly items',
            'Avoid heavy luggage as it can interrupt your travel',
            'Carry a valid ID proof',
            'Keep medicines if you have any specific health condition',
            'Wear comfortable shoes for trekking/walking'
          ],
          highlights: tripData.highlights && tripData.highlights.length > 0 ? tripData.highlights : [''],
          inclusions: tripData.inclusions && tripData.inclusions.length > 0 ? tripData.inclusions : [''],
          exclusions: tripData.exclusions && tripData.exclusions.length > 0 ? tripData.exclusions : [''],
          safetyMeasures: tripData.safetyMeasures && tripData.safetyMeasures.length > 0 ? tripData.safetyMeasures : [''],
          requiredDocuments: tripData.requiredDocuments && tripData.requiredDocuments.length > 0 ? tripData.requiredDocuments : [''],
          equipmentProvided: tripData.equipmentProvided && tripData.equipmentProvided.length > 0 ? tripData.equipmentProvided : [''],
          equipmentRequired: tripData.equipmentRequired && tripData.equipmentRequired.length > 0 ? tripData.equipmentRequired : [''],
          packingList: tripData.packingList && tripData.packingList.length > 0 ? tripData.packingList : [''],
          whatsappGroupLink: tripData.whatsappGroupLink || '',
          // Ensure boolean values are properly set
          isPublished: tripData.isPublished || false,
          publishNow: tripData.publishNow || false
        });
      } else {
        alert('Failed to fetch trip details');
        navigate('/admin/trips');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      alert('Failed to fetch trip: ' + error.message);
      navigate('/admin/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTrip(prev => {
      const updatedTrip = { ...prev, [field]: value };
      // Save to localStorage for persistence
      localStorage.setItem(`trip-edit-${id}`, JSON.stringify(updatedTrip));
      return updatedTrip;
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...trip[field]];
    newArray[index] = value;
    setTrip(prev => {
      const updatedTrip = { ...prev, [field]: newArray };
      // Save to localStorage for persistence
      localStorage.setItem(`trip-edit-${id}`, JSON.stringify(updatedTrip));
      return updatedTrip;
    });
  };

  const addArrayItem = (field) => {
    setTrip(prev => {
      const updatedTrip = {
        ...prev,
        [field]: [...prev[field], '']
      };
      // Save to localStorage for persistence
      localStorage.setItem(`trip-edit-${id}`, JSON.stringify(updatedTrip));
      return updatedTrip;
    });
  };

  const removeArrayItem = (field, index) => {
    setTrip(prev => {
      const updatedTrip = {
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      };
      // Save to localStorage for persistence
      localStorage.setItem(`trip-edit-${id}`, JSON.stringify(updatedTrip));
      return updatedTrip;
    });
  };

  // Itinerary handlers
  const handleItineraryChange = (dayIndex, field, value) => {
    setTrip(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleItineraryArrayChange = (dayIndex, field, itemIndex, value) => {
    setTrip(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === dayIndex ? {
          ...day,
          [field]: day[field].map((item, j) => j === itemIndex ? value : item)
        } : day
      )
    }));
  };

  const addItineraryDay = () => {
    const newDay = {
      day: trip.itinerary.length + 1,
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
    setTrip(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, newDay]
    }));
  };

  const removeItineraryDay = (dayIndex) => {
    setTrip(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== dayIndex).map((day, i) => ({
        ...day,
        day: i + 1
      }))
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Clean and validate data
      const cleanedData = {
        ...trip,
        price: parseFloat(trip.price) || 0,
        earlyBirdPrice: parseFloat(trip.earlyBirdPrice) || 0,
        maxParticipants: parseInt(trip.maxParticipants) || 1,
        seatLockAmount: parseFloat(trip.seatLockAmount) || 0,
        nights: parseInt(trip.nights) || 0,
        days: parseInt(trip.days) || 1,
        title: trip.title.trim(),
        summary: trip.summary.trim(),
        description: trip.description.trim(),
        coverImage: trip.coverImage.trim(),
        startLocation: trip.startLocation.trim(),
        endLocation: trip.endLocation.trim(),
        transportMode: trip.transportMode.trim(),
        whatsappGroupLink: trip.whatsappGroupLink.trim(),
        // Ensure dates are properly formatted for backend
        departureDate: trip.departureDate ? new Date(trip.departureDate).toISOString() : null,
        returnDate: trip.returnDate ? new Date(trip.returnDate).toISOString() : null,
        bookingCutoffDate: trip.bookingCutoffDate ? new Date(trip.bookingCutoffDate).toISOString() : null,
        earlyBirdValidUntil: trip.earlyBirdValidUntil ? new Date(trip.earlyBirdValidUntil).toISOString() : null,
        schedulePublishDate: trip.schedulePublishDate ? new Date(trip.schedulePublishDate).toISOString() : null,
        // Clean up empty array items
        galleryImages: trip.galleryImages.filter(img => img.trim() !== ''),
        highlights: trip.highlights.filter(h => h.trim() !== ''),
        inclusions: trip.inclusions.filter(i => i.trim() !== ''),
        exclusions: trip.exclusions.filter(e => e.trim() !== ''),
        safetyMeasures: trip.safetyMeasures.filter(s => s.trim() !== ''),
        requiredDocuments: trip.requiredDocuments.filter(d => d.trim() !== ''),
        equipmentProvided: trip.equipmentProvided.filter(e => e.trim() !== ''),
        equipmentRequired: trip.equipmentRequired.filter(e => e.trim() !== ''),
        packingList: trip.packingList.filter(p => p.trim() !== ''),
        importantNotes: trip.importantNotes.filter(n => n.trim() !== ''),
        // Clean itinerary
        itinerary: trip.itinerary.map(day => ({
          ...day,
          activities: day.activities.filter(a => a.trim() !== ''),
          meals: day.meals.filter(m => m.trim() !== ''),
          highlights: day.highlights.filter(h => h.trim() !== '')
        }))
      };

      console.log('Sending trip data:', cleanedData);
      
      await tripService.updateTrip(id, cleanedData);
      // Clear saved data from localStorage after successful submission
      localStorage.removeItem(`trip-edit-${id}`);
      alert('Trip updated successfully!');
      navigate('/admin/trips');
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Validation function to check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return trip.title.trim() !== '' && trip.summary.trim() !== '' && trip.description.trim() !== '';
      case 2: // Duration & Dates
        return trip.nights !== '' && trip.days !== '' && trip.departureDate !== '' && trip.returnDate !== '' && trip.startLocation.trim() !== '' && trip.endLocation.trim() !== '';
      case 3: // Pricing
        return trip.price !== '' && parseFloat(trip.price) > 0;
      case 4: // Images
        return trip.coverImage.trim() !== '';
      case 5: // Itinerary
        return trip.itinerary.length > 0 && trip.itinerary.every(day => day.title.trim() !== '');
      case 6: // Details
        return true; // Details step is mostly optional
      case 7: // Review
        return true; // Review step is always valid
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Check if current step is valid before proceeding
      if (isCurrentStepValid()) {
        console.log('Moving to step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Step validation failed for step:', currentStep);
        alert('Please fill in all required fields before proceeding to the next step.');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    console.log('Rendering step content for step:', currentStep);
    console.log('Trip data available:', !!trip);
    
    switch (currentStep) {
      case 1:
  return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Update the essential details about your trip</p>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Trip Details
                  </h3>
                  
                  <div className="space-y-4">
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Title *
                      </label>
                  <input
                    type="text"
                    value={trip.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Amazing Manali Adventure"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          trip.title.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {trip.title.trim() === '' && (
                        <p className="text-xs text-red-500 mt-1">Trip title is required</p>
                      )}
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={trip.urlSlug}
                        onChange={(e) => handleInputChange('urlSlug', e.target.value)}
                        placeholder="amazing-manali-adventure"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be your trip's URL. Use lowercase letters, numbers, and hyphens only.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Summary *
                      </label>
                      <textarea
                        value={trip.summary}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        placeholder="A brief, compelling summary of the trip (2-3 sentences)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description *
                      </label>
                      <textarea
                        value={trip.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Detailed description of the trip, what makes it special, what to expect..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-green-600" />
                    Trip Classification
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                  <select
                    value={trip.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level *
                        </label>
                  <select
                    value={trip.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                      </div>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trip Type
                        </label>
                  <select
                          value={trip.tripType}
                          onChange={(e) => handleInputChange('tripType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="Group">Group</option>
                          <option value="Private">Private</option>
                          <option value="Custom">Custom</option>
                  </select>
              </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age Group
                        </label>
                        <select
                          value={trip.ageGroup}
                          onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="All Ages">All Ages</option>
                          <option value="18+">18+</option>
                          <option value="21+">21+</option>
                          <option value="Family">Family</option>
                          <option value="Senior">Senior</option>
                        </select>
              </div>
            </div>

            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Physical Fitness Required
                      </label>
                      <select
                        value={trip.physicalFitness}
                        onChange={(e) => handleInputChange('physicalFitness', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="Low">Low - Anyone can participate</option>
                        <option value="Moderate">Moderate - Basic fitness required</option>
                        <option value="High">High - Good fitness required</option>
                        <option value="Extreme">Extreme - Excellent fitness required</option>
                      </select>
                </div>
                </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Duration & Dates</h2>
              <p className="text-gray-600">Update the trip duration, dates, and locations</p>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Duration */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  Trip Duration
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nights *
                      </label>
                  <input
                    type="number"
                        min="0"
                        max="30"
                        value={trip.nights}
                        onChange={(e) => handleInputChange('nights', e.target.value)}
                        placeholder="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days *
                      </label>
                  <input
                    type="number"
                        min="1"
                        max="31"
                        value={trip.days}
                        onChange={(e) => handleInputChange('days', e.target.value)}
                        placeholder="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                </div>

                  {trip.duration && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <p className="text-sm text-purple-700 mb-1">Generated Duration:</p>
                      <p className="text-xl font-bold text-purple-900">{trip.duration}</p>
                </div>
                  )}
              </div>
            </div>

              {/* Dates */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Trip Dates
                </h3>
                
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date *
                    </label>
                  <input
                    type="date"
                    value={trip.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        trip.departureDate === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                    {trip.departureDate === '' && (
                      <p className="text-xs text-red-500 mt-1">Departure date is required</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date *
                    </label>
                  <input
                    type="date"
                    value={trip.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        trip.returnDate === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {trip.returnDate === '' && (
                      <p className="text-xs text-red-500 mt-1">Return date is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Cutoff Date
                    </label>
                    <input
                      type="date"
                      value={trip.bookingCutoffDate}
                      onChange={(e) => handleInputChange('bookingCutoffDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                </div>

              {/* Locations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Locations
                </h3>
                
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Location *
                    </label>
                  <input
                    type="text"
                    value={trip.startLocation}
                    onChange={(e) => handleInputChange('startLocation', e.target.value)}
                      placeholder="e.g., Delhi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Location *
                    </label>
                  <input
                    type="text"
                    value={trip.endLocation}
                    onChange={(e) => handleInputChange('endLocation', e.target.value)}
                      placeholder="e.g., Manali"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Mode *
                    </label>
                    <select
                    value={trip.transportMode}
                    onChange={(e) => handleInputChange('transportMode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Flight">Flight</option>
                      <option value="Car">Car</option>
                      <option value="Tempo Traveler">Tempo Traveler</option>
                      <option value="Bike">Bike</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Group Link
                    </label>
                    <input
                      type="url"
                      value={trip.whatsappGroupLink}
                      onChange={(e) => handleInputChange('whatsappGroupLink', e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: WhatsApp group link for travelers to connect. Will be shared only after payment confirmation.
                    </p>
                </div>
              </div>
            </div>

              {/* Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-orange-600" />
                  Availability
                </h3>
                
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={trip.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                      placeholder="15"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seat Lock Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={trip.seatLockAmount}
                      onChange={(e) => handleInputChange('seatLockAmount', e.target.value)}
                      placeholder="3000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Non-refundable deposit amount for seat locking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Pricing Details</h2>
              <p className="text-gray-600">Update pricing, early bird offers, and payment options</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Regular Pricing */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Regular Pricing
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Person (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={trip.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="15000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Early Bird Pricing */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  Early Bird Offer
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Early Bird Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={trip.earlyBirdPrice}
                      onChange={(e) => handleInputChange('earlyBirdPrice', e.target.value)}
                      placeholder="12000"
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={trip.earlyBirdValidUntil}
                      onChange={(e) => handleInputChange('earlyBirdValidUntil', e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  {trip.earlyBirdPrice && trip.price && (
                    <div className="bg-white rounded-xl border-2 border-green-300 p-4">
                      <p className="text-sm text-green-700 mb-1">Discount:</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{trip.price - trip.earlyBirdPrice} OFF ({Math.round(((trip.price - trip.earlyBirdPrice) / trip.price) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trip Images</h2>
              <p className="text-gray-600">Update cover image and gallery images for your trip</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cover Image */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Cover Image
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image URL *
                    </label>
                  <input
                    type="url"
                    value={trip.coverImage}
                    onChange={(e) => handleInputChange('coverImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                  {trip.coverImage && (
                    <div className="mt-4">
                      <img
                        src={trip.coverImage}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                  />
                </div>
                  )}
              </div>
            </div>

              {/* Gallery Images */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-purple-600" />
                  Gallery Images
                </h3>
                
                <div className="space-y-4">
                  {trip.galleryImages.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleArrayChange('galleryImages', index, e.target.value)}
                        placeholder="https://example.com/gallery-image.jpg"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      {trip.galleryImages.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('galleryImages', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('galleryImages')}
                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Gallery Image</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Day-by-Day Itinerary</h2>
              <p className="text-gray-600">Update the detailed itinerary for your trip</p>
            </div>

              <div className="space-y-6">
              {trip.itinerary.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-900">Day {day.day}</h3>
                    {trip.itinerary.length > 1 && (
                      <button
                        onClick={() => removeItineraryDay(dayIndex)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Day Title *
                      </label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                        placeholder="e.g., Arrival & Orientation"
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Accommodation
                      </label>
                      <input
                        type="text"
                        value={day.accommodation}
                        onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                        placeholder="e.g., Hotel in Manali"
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Activities
                    </label>
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => handleItineraryArrayChange(dayIndex, 'activities', actIndex, e.target.value)}
                          placeholder="e.g., Morning trek to base camp"
                          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {day.activities.length > 1 && (
                          <button
                            onClick={() => {
                              const newActivities = day.activities.filter((_, i) => i !== actIndex);
                              handleItineraryChange(dayIndex, 'activities', newActivities);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newActivities = [...day.activities, ''];
                        handleItineraryChange(dayIndex, 'activities', newActivities);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Activity</span>
                    </button>
                </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Notes
                    </label>
                  <textarea
                      value={day.notes}
                      onChange={(e) => handleItineraryChange(dayIndex, 'notes', e.target.value)}
                      placeholder="Additional notes for this day..."
                      rows={2}
                      className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                </motion.div>
              ))}

              <button
                onClick={addItineraryDay}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Day</span>
              </button>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trip Details</h2>
              <p className="text-gray-600">Update inclusions, exclusions, and important information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Inclusions
                </h3>
                
                <div className="space-y-2">
                  {trip.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={inclusion}
                        onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                        placeholder="e.g., Accommodation, Meals, Transport"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                      {trip.inclusions.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('inclusions', index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('inclusions')}
                    className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-100 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Inclusion</span>
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <X className="w-5 h-5 mr-2 text-red-600" />
                  Exclusions
                </h3>
                
                <div className="space-y-2">
                  {trip.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={exclusion}
                        onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                        placeholder="e.g., Personal expenses, Tips"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                      {trip.exclusions.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('exclusions', index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('exclusions')}
                    className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Exclusion</span>
                  </button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Important Notes
                </h3>
                
                <div className="space-y-2">
                  {trip.importantNotes.map((note, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleArrayChange('importantNotes', index, e.target.value)}
                        placeholder="e.g., Carry valid ID proof"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                      {trip.importantNotes.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('importantNotes', index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('importantNotes')}
                    className="flex items-center space-x-1 px-3 py-1 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Cancellation Policy
                </h3>
                
                  <textarea
                    value={trip.cancellationPolicy}
                    onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                  placeholder="Free cancellation up to 7 days before departure. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Changes</h2>
              <p className="text-gray-600">Review your trip details before saving</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trip Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600" />
                  Trip Summary
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Title:</span>
                    <span className="font-semibold text-blue-900">{trip.title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-semibold text-blue-900">{trip.duration || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Price:</span>
                    <span className="font-semibold text-blue-900">₹{trip.price || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Max Participants:</span>
                    <span className="font-semibold text-blue-900">{trip.maxParticipants || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Category:</span>
                    <span className="font-semibold text-blue-900">{trip.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Difficulty:</span>
                    <span className="font-semibold text-blue-900">{trip.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className="font-semibold text-blue-900">{trip.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`/trip/${trip.urlSlug || trip._id}`, '_blank')}
                    className="w-full flex items-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Preview Trip</span>
                  </button>
                  
                  <button
                    onClick={() => setTrip(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                    className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors ${
                      trip.isPublished 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <span>{trip.isPublished ? 'Unpublish Trip' : 'Publish Trip'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
                        // Handle delete logic here
                        console.log('Delete trip');
                      }
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Trip</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        console.error('Unknown step:', currentStep);
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600">Unknown step encountered. Please refresh the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Safety check to ensure trip data is loaded
  if (!trip || !trip.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Data Not Loaded</h2>
          <p className="text-gray-600 mb-4">Unable to load trip data. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Trip</h1>
              <p className="text-gray-600">Update your travel experience details</p>
            </div>
            <button
              onClick={() => navigate('/admin/trips')}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Trips</span>
            </button>
          </div>
                </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`font-semibold ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 transition-all ${
                      currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
                </div>
            ))}
              </div>
            </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
              <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
              </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <span>Next</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditTrip;