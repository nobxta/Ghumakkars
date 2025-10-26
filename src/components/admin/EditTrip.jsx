import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState({
    title: '',
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [],
    price: '',
    originalPrice: '',
    earlyBirdPrice: '',
    departureDate: '',
    returnDate: '',
    startLocation: '',
    endLocation: '',
    transportMode: '',
    duration: '',
    category: '',
    difficulty: '',
    maxParticipants: '',
    currentParticipants: '',
    seatLockAmount: '',
    tags: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    recommendations: '',
    cancellationPolicy: '',
    isPublished: false,
    isEarlyBird: false
  });

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripById(id);
      if (response.success) {
        setTrip(response.data);
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
    setTrip(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    const array = value.split('\n').filter(item => item.trim() !== '');
    setTrip(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Clean and validate data
      const cleanedData = {
        ...trip,
        price: parseFloat(trip.price) || 0,
        originalPrice: parseFloat(trip.originalPrice) || 0,
        earlyBirdPrice: parseFloat(trip.earlyBirdPrice) || 0,
        maxParticipants: parseInt(trip.maxParticipants) || 1,
        currentParticipants: parseInt(trip.currentParticipants) || 0,
        title: trip.title.trim(),
        summary: trip.summary.trim(),
        description: trip.description.trim(),
        coverImage: trip.coverImage.trim(),
        startLocation: trip.startLocation.trim(),
        endLocation: trip.endLocation.trim(),
        transportMode: trip.transportMode.trim(),
        duration: trip.duration.trim(),
        category: trip.category.trim(),
        difficulty: trip.difficulty.trim(),
        recommendations: trip.recommendations.trim(),
        cancellationPolicy: trip.cancellationPolicy.trim()
      };

      console.log('Sending trip data:', cleanedData);
      
      await tripService.updateTrip(id, cleanedData);
      alert('Trip updated successfully!');
      navigate('/admin/trips');
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
              <p className="text-gray-600 mt-2">Update trip details and settings</p>
            </div>
            <button
              onClick={() => navigate('/admin/trips')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Trips
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Title *</label>
                  <input
                    type="text"
                    value={trip.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={trip.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Nature">Nature</option>
                    <option value="Photography">Photography</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                  <select
                    value={trip.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <select
                    value={trip.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="1 Day">1 Day</option>
                    <option value="2 Days">2 Days</option>
                    <option value="3 Days">3 Days</option>
                    <option value="4 Days">4 Days</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary *</label>
                <textarea
                  value={trip.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the trip"
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
                <textarea
                  value={trip.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the trip"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Availability</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={trip.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    value={trip.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird Price (₹)</label>
                  <input
                    type="number"
                    value={trip.earlyBirdPrice}
                    onChange={(e) => handleInputChange('earlyBirdPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seat Lock Amount (₹) *</label>
                  <input
                    type="number"
                    value={trip.seatLockAmount}
                    onChange={(e) => handleInputChange('seatLockAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                  />
                  <p className="text-sm text-gray-500 mt-1">Non-refundable deposit amount for seat locking</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants *</label>
                  <input
                    type="number"
                    value={trip.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Participants</label>
                  <input
                    type="number"
                    value={trip.currentParticipants}
                    onChange={(e) => handleInputChange('currentParticipants', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Dates & Locations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dates & Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date *</label>
                  <input
                    type="date"
                    value={trip.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Date *</label>
                  <input
                    type="date"
                    value={trip.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Location *</label>
                  <input
                    type="text"
                    value={trip.startLocation}
                    onChange={(e) => handleInputChange('startLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Location *</label>
                  <input
                    type="text"
                    value={trip.endLocation}
                    onChange={(e) => handleInputChange('endLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode *</label>
                  <input
                    type="text"
                    value={trip.transportMode}
                    onChange={(e) => handleInputChange('transportMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bus, Train, Flight, Car"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Media</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL *</label>
                  <input
                    type="url"
                    value={trip.coverImage}
                    onChange={(e) => handleInputChange('coverImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (one URL per line)</label>
                  <textarea
                    value={trip.galleryImages.join('\n')}
                    onChange={(e) => handleArrayChange('galleryImages', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Highlights (one per line)</label>
                  <textarea
                    value={trip.highlights.join('\n')}
                    onChange={(e) => handleArrayChange('highlights', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Amazing mountain views&#10;Local cultural experiences&#10;Adventure activities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's Included (one per line)</label>
                  <textarea
                    value={trip.inclusions.join('\n')}
                    onChange={(e) => handleArrayChange('inclusions', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Accommodation&#10;Meals&#10;Transportation&#10;Guide services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's Not Included (one per line)</label>
                  <textarea
                    value={trip.exclusions.join('\n')}
                    onChange={(e) => handleArrayChange('exclusions', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Personal expenses&#10;Travel insurance&#10;Optional activities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <textarea
                    value={trip.recommendations}
                    onChange={(e) => handleInputChange('recommendations', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What to pack, important notes, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                  <textarea
                    value={trip.cancellationPolicy}
                    onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cancellation terms and conditions"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={trip.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    Publish this trip (make it visible to users)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEarlyBird"
                    checked={trip.isEarlyBird}
                    onChange={(e) => handleInputChange('isEarlyBird', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isEarlyBird" className="ml-2 block text-sm text-gray-900">
                    Enable early bird pricing
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/trips')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Update Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTrip;
