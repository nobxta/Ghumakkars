import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, RefreshCw, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MaintenancePopup = ({ isOpen, onClose, maintenanceData }) => {
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleCheckAgain = async () => {
    setCheckingStatus(true);
    try {
      const response = await axios.get(`${API_URL}/api/system-settings/maintenance-check`);
      if (!response.data.maintenanceMode) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Website Under Maintenance</h2>
            <p className="text-gray-600">{maintenanceData?.message || 'We are currently performing scheduled maintenance. Please check back shortly.'}</p>
          </div>

          {/* Estimated Time */}
          {maintenanceData?.estimatedFixTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Estimated fix time: {maintenanceData.estimatedFixTime}
                </span>
              </div>
            </div>
          )}

          {/* Blocked Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Currently Unavailable:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Creating new bookings
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Canceling existing bookings
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Making payments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Updating profile
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Registering new accounts
              </li>
            </ul>
          </div>

          {/* Available Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Still Available:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Viewing trips and details
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Checking your bookings
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Viewing profile information
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Accessing wallet balance
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleCheckAgain}
              disabled={checkingStatus}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {checkingStatus ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenancePopup;