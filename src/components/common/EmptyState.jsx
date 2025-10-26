import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, AlertCircle, Plus, RefreshCw } from 'lucide-react';

const EmptyState = ({ 
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  icon: CustomIcon
}) => {
  const configs = {
    default: {
      icon: Inbox,
      title: 'No items found',
      description: 'There are no items to display at the moment.',
      gradient: 'from-slate-500 to-gray-600'
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search or filters to find what you\'re looking for.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    error: {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: 'We couldn\'t load the content. Please try again.',
      gradient: 'from-red-500 to-rose-600'
    },
    create: {
      icon: Plus,
      title: 'Get started',
      description: 'Create your first item to get started.',
      gradient: 'from-emerald-500 to-green-600'
    }
  };

  const config = configs[type] || configs.default;
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className={`w-20 h-20 mb-6 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-lg`}
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-slate-800 mb-2"
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-600 max-w-md mb-6"
      >
        {displayDescription}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          {type === 'error' ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>{actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;

