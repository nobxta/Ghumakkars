import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { API_URL } from '../utils/apiConfig';

/**
 * Hook for real-time seat availability tracking
 * Polls the server for updated seat counts
 */
const useRealTimeSeats = (tripId, pollingInterval = 30000) => {
  const [seatsData, setSeatsData] = useState({
    totalSeats: 0,
    bookedSeats: 0,
    availableSeats: 0,
    loading: true,
    error: null
  });

  const fetchSeats = useCallback(async () => {
    if (!tripId) return;

    try {
      const response = await axios.get(`${API_URL}/api/trips/${tripId}/availability`);
      
      if (response.data.success) {
        const { maxParticipants, bookedSeats } = response.data.data;
        setSeatsData({
          totalSeats: maxParticipants,
          bookedSeats: bookedSeats,
          availableSeats: maxParticipants - bookedSeats,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      setSeatsData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch seat availability'
      }));
    }
  }, [tripId]);

  useEffect(() => {
    // Initial fetch
    fetchSeats();

    // Set up polling
    const interval = setInterval(fetchSeats, pollingInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [fetchSeats, pollingInterval]);

  return {
    ...seatsData,
    refresh: fetchSeats,
    urgencyLevel: getUrgencyLevel(seatsData.availableSeats, seatsData.totalSeats),
    percentageBooked: seatsData.totalSeats > 0 
      ? Math.round((seatsData.bookedSeats / seatsData.totalSeats) * 100)
      : 0
  };
};

// Helper function to determine urgency level
const getUrgencyLevel = (available, total) => {
  if (total === 0) return 'none';
  
  const percentageAvailable = (available / total) * 100;
  
  if (percentageAvailable <= 10) return 'critical'; // 10% or less
  if (percentageAvailable <= 25) return 'high';     // 25% or less
  if (percentageAvailable <= 50) return 'medium';   // 50% or less
  return 'low';                                      // More than 50%
};

export default useRealTimeSeats;

