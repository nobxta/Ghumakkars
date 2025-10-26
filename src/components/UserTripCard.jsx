import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle
} from 'lucide-react';

const UserTripCard = ({ trip, onClick }) => {
  // Get user-facing status
  const getUserStatus = (status) => {
    switch (status) {
      case 'scheduled':
      case 'active':
        return { label: 'Upcoming', color: 'blue', icon: Calendar };
      case 'ongoing':
        return { label: 'Ongoing', color: 'indigo', icon: Clock };
      case 'completed':
        return { label: 'Completed', color: 'purple', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Cancelled', color: 'red', icon: XCircle };
      default:
        return { label: 'Upcoming', color: 'blue', icon: Calendar };
    }
  };

  const userStatus = getUserStatus(trip.status);
  const StatusIcon = userStatus.icon;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (color) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800'
    };
    return colorClasses[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Trip Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center" style={{ display: trip.coverImage ? 'none' : 'flex' }}>
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">No Image</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userStatus.color)}`}>
            <StatusIcon className="w-3 h-3" />
            {userStatus.label}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-sm font-bold text-green-600">{formatPrice(trip.price)}</span>
        </div>
      </div>

      {/* Trip Content */}
      <div className="p-4 sm:p-6">
        <h3 className="font-semibold text-slate-800 text-lg mb-2 line-clamp-2">{trip.title}</h3>
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{trip.summary}</p>
        
        {/* Trip Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{trip.startLocation} → {trip.endLocation}</span>
          </div>
          
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}</span>
          </div>

          <div className="flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{trip.currentParticipants}/{trip.maxParticipants} participants</span>
          </div>

          {/* Cancellation Reason for Users */}
          {trip.status === 'cancelled' && trip.cancellation?.cancellationReason && trip.cancellation?.isUserVisible && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-800">Trip Cancelled</p>
                  <p className="text-xs text-red-700">{trip.cancellation.cancellationReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm">
          {trip.status === 'cancelled' ? 'View Details' : 'View Trip'}
        </button>
      </div>
    </motion.div>
  );
};

export default UserTripCard;
