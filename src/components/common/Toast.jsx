import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'from-emerald-500 to-green-600',
      border: 'border-emerald-200',
      text: 'text-emerald-900'
    },
    error: {
      icon: XCircle,
      bg: 'from-red-500 to-rose-600',
      border: 'border-red-200',
      text: 'text-red-900'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'from-amber-500 to-orange-600',
      border: 'border-amber-200',
      text: 'text-amber-900'
    },
    info: {
      icon: Info,
      bg: 'from-blue-500 to-indigo-600',
      border: 'border-blue-200',
      text: 'text-blue-900'
    }
  };

  const { icon: Icon, bg, border, text } = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="pointer-events-auto"
    >
      <div className={`relative bg-gradient-to-r ${bg} rounded-2xl shadow-2xl border-2 ${border} p-4 min-w-[320px] max-w-md overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
            backgroundSize: '20px 20px' 
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {toast.duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
          />
        )}
      </div>
    </motion.div>
  );
};

export default ToastProvider;

