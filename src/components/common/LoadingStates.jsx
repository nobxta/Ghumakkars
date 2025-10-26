import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

// Full Page Loading
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-600 font-medium"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

// Button Loading
export const ButtonLoader = ({ text = 'Processing...' }) => {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
};

// Skeleton Loaders
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded"
          style={{ width: `${Math.random() * 30 + 60}%` }}
        ></div>
      ))}
    </div>
  );
};

// Shimmer Effect
export const ShimmerLoader = () => {
  return (
    <div className="relative overflow-hidden bg-slate-200 rounded-xl h-64">
      <motion.div
        animate={{ x: ['−100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
      />
    </div>
  );
};

// Spinner Variants
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    red: 'border-red-600'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-4 border-slate-200 ${colors[color]} border-t-transparent rounded-full`}
    />
  );
};

// Pulsing Dots
export const PulsingDots = () => {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className="w-2 h-2 bg-blue-600 rounded-full"
        />
      ))}
    </div>
  );
};

// Success Animation
export const SuccessAnimation = ({ message = 'Success!' }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <p className="text-lg font-bold text-emerald-600">{message}</p>
    </motion.div>
  );
};

export default {
  PageLoader,
  ButtonLoader,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  ShimmerLoader,
  Spinner,
  PulsingDots,
  SuccessAnimation
};

