import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useMaintenanceCheck = () => {
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/system-settings/maintenance-check`);
      
      if (response.data.success) {
        const { maintenanceMode, message, estimatedFixTime } = response.data;
        
        setIsMaintenanceMode(maintenanceMode);
        
        if (maintenanceMode) {
          setMaintenanceData({
            message,
            estimatedFixTime,
            timestamp: response.data.timestamp
          });
        } else {
          setMaintenanceData(null);
        }
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      // If there's an error, assume no maintenance mode
      setIsMaintenanceMode(false);
      setMaintenanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMaintenanceAction = (action) => {
    // This function can be called when user tries to perform a blocked action
    if (isMaintenanceMode) {
      return {
        blocked: true,
        maintenanceData
      };
    }
    return { blocked: false };
  };

  return {
    isMaintenanceMode,
    maintenanceData,
    loading,
    checkMaintenanceStatus,
    handleMaintenanceAction
  };
};

export default useMaintenanceCheck;