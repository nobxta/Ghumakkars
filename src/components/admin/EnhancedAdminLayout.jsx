import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  Users,
  CreditCard,
  Tag,
  UserPlus,
  Shield,
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Home
} from 'lucide-react';

const EnhancedAdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    setAdminUser(user);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const sidebarItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-50',
      activeColor: 'bg-blue-100'
    },
    { 
      name: 'Trips', 
      icon: MapPin, 
      path: '/admin/trips', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-50',
      activeColor: 'bg-green-100'
    },
    { 
      name: 'Bookings', 
      icon: BookOpen, 
      path: '/admin/bookings', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-50',
      activeColor: 'bg-purple-100'
    },
    { 
      name: 'Users', 
      icon: Users, 
      path: '/admin/users', 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-50',
      activeColor: 'bg-indigo-100'
    },
    { 
      name: 'Payments', 
      icon: CreditCard, 
      path: '/admin/payments', 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-50',
      activeColor: 'bg-emerald-100'
    },
    { 
      name: 'Coupons', 
      icon: Tag, 
      path: '/admin/coupons', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-50',
      activeColor: 'bg-orange-100'
    },
    { 
      name: 'Referrals', 
      icon: UserPlus, 
      path: '/admin/referrals', 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-50',
      activeColor: 'bg-pink-100'
    },
    { 
      name: 'Notifications', 
      icon: Bell, 
      path: '/admin/notifications', 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-50',
      activeColor: 'bg-red-100'
    },
    { 
      name: 'Sessions', 
      icon: Shield, 
      path: '/admin/sessions', 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-50',
      activeColor: 'bg-cyan-100'
    },
    { 
      name: 'Support', 
      icon: MessageSquare, 
      path: '/admin/support', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-50',
      activeColor: 'bg-yellow-100'
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/admin/settings', 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-50',
      activeColor: 'bg-gray-100'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -288,
          transition: { type: "spring", damping: 25, stiffness: 200 }
        }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 lg:translate-x-0"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <LayoutDashboard className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Ghumakkars</h1>
              <p className="text-xs text-blue-100 font-medium">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <motion.button
                    onClick={() => navigate(item.path)}
                    onHoverStart={() => setHoveredItem(item.name)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-300 ${
                      active
                        ? `${item.activeColor} ${item.color} shadow-lg`
                        : `text-gray-600 ${item.hoverColor} hover:shadow-md`
                    }`}
                  >
                    <motion.div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                        active
                          ? `${item.bgColor} ${item.color}`
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    
                    <motion.span
                      className="ml-3 font-medium text-sm"
                      animate={{
                        color: active ? item.color.replace('text-', '') : undefined
                      }}
                    >
                      {item.name}
                    </motion.span>
                    
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                    
                    {/* Hover indicator */}
                    <motion.div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${item.bgColor}`}
                      initial={{ scaleY: 0 }}
                      animate={{ 
                        scaleY: hoveredItem === item.name ? 1 : 0,
                        opacity: hoveredItem === item.name ? 1 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-slate-200/50"
        >
          <div className="relative profile-dropdown">
            <motion.button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 text-left flex-1">
                <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <motion.div
                animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden"
                >
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Back to Website
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {sidebarItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {adminUser.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default EnhancedAdminLayout;
