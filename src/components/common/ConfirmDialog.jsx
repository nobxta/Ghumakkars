import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, success, info
  loading = false
}) => {
  const configs = {
    warning: {
      icon: AlertTriangle,
      bg: 'from-amber-500 to-orange-600',
      buttonBg: 'from-amber-600 to-orange-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    danger: {
      icon: XCircle,
      bg: 'from-red-500 to-rose-600',
      buttonBg: 'from-red-600 to-rose-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    success: {
      icon: CheckCircle,
      bg: 'from-emerald-500 to-green-600',
      buttonBg: 'from-emerald-600 to-green-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    info: {
      icon: Info,
      bg: 'from-blue-500 to-indigo-600',
      buttonBg: 'from-blue-600 to-indigo-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-slate-600 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-6 py-3 bg-gradient-to-r ${config.buttonBg} text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

