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
  ChevronLeft,
  LogOut,
  User,
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Star,
  Home,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import '../../styles/admin-sidebar.css';

// Premium Icons Component
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    trips: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bookings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    payments: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    coupons: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    referrals: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    analytics: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    support: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    chevron: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  };
  
  return icons[name] || null;
};

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    'Main': true,
    'Finance': true,
    'System': true
  });
  const [stats, setStats] = useState({
    totalBookings: 156,
    revenue: 45200,
    activeUsers: 89,
    pendingApprovals: 12
  });

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

  const menuSections = [
    {
      title: 'Main',
      items: [
        { 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/admin/dashboard', 
          color: 'blue',
          badge: null,
          description: 'Overview & Analytics'
        },
        { 
          name: 'Trips', 
          icon: MapPin, 
          path: '/admin/trips', 
          color: 'green',
          badge: null,
          description: 'Manage Trips'
        },
        { 
          name: 'Bookings', 
          icon: BookOpen, 
          path: '/admin/bookings', 
          color: 'purple',
          badge: stats.pendingApprovals,
          description: 'View Bookings'
        },
        { 
          name: 'Users', 
          icon: Users, 
          path: '/admin/users', 
          color: 'indigo',
          badge: null,
          description: 'User Management'
        }
      ]
    },
    {
      title: 'Finance',
      items: [
        { 
          name: 'Payments', 
          icon: CreditCard, 
          path: '/admin/payments', 
          color: 'emerald',
          badge: null,
          description: 'Payment Transactions'
        },
        { 
          name: 'Payment Settings', 
          icon: Settings, 
          path: '/admin/payment-settings', 
          color: 'green',
          badge: null,
          description: 'QR Code & UPI Setup'
        },
        { 
          name: 'Coupons', 
          icon: Tag, 
          path: '/admin/coupons', 
          color: 'orange',
          badge: null,
          description: 'Discount Codes'
        },
        { 
          name: 'Referrals', 
          icon: UserPlus, 
          path: '/admin/referrals', 
          color: 'pink',
          badge: null,
          description: 'Referral Program'
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          name: 'Terminal', 
          icon: Terminal, 
          path: '/admin/terminal', 
          color: 'slate',
          badge: null,
          description: 'Live Server Logs'
        },
        { 
          name: 'Notifications', 
          icon: Bell, 
          path: '/admin/notifications', 
          color: 'red',
          badge: 3,
          description: 'System Alerts'
        },
        { 
          name: 'Analytics', 
          icon: Shield, 
          path: '/admin/analytics', 
          color: 'cyan',
          badge: null,
          description: 'Analytics Dashboard'
        },
        { 
          name: 'Support', 
          icon: MessageSquare, 
          path: '/admin/support', 
          color: 'yellow',
          badge: null,
          description: 'Help & Support'
        },
        { 
          name: 'WhatsApp', 
          icon: MessageSquare, 
          path: '/admin/whatsapp', 
          color: 'green',
          badge: null,
          description: 'WhatsApp Messaging'
        },
        { 
          name: 'Settings', 
          icon: Settings, 
          path: '/admin/settings', 
          color: 'gray',
          badge: null,
          description: 'App Settings'
        }
      ]
    }
  ];

  // Flatten for search
  const allMenuItems = menuSections.flatMap(section => section.items);

  // Filter menu items based on search
  const filteredSections = searchQuery 
    ? [{ 
        title: 'Search Results', 
        items: allMenuItems.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }]
    : menuSections;

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', activeBg: 'bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', activeBg: 'bg-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', activeBg: 'bg-purple-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', activeBg: 'bg-indigo-100' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', activeBg: 'bg-emerald-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', activeBg: 'bg-orange-100' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', activeBg: 'bg-pink-100' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', activeBg: 'bg-red-100' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', activeBg: 'bg-cyan-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', activeBg: 'bg-yellow-100' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', activeBg: 'bg-gray-100' },
      slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', activeBg: 'bg-slate-100' }
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -320 }}
        animate={{ 
          x: sidebarOpen ? 0 : -320,
          width: sidebarCollapsed ? '75px' : '300px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-2xl border-r border-gray-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-hidden flex flex-col`}
      >
        {/* Logo Section */}
        <div className="h-[80px] px-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-between shrink-0">
          {!sidebarCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-11 h-11 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white leading-tight">Ghumakkars</h1>
                <p className="text-xs text-blue-100/90 font-medium">Admin Panel</p>
              </div>
            </motion.div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}
          
          {!sidebarCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg items-center justify-center backdrop-blur-sm transition-all border border-white/30"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="flex items-center justify-center py-3 border-b border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(false)}
              className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors text-blue-600"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar flex flex-col">
          {/* Search Bar - Only show when not collapsed */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 relative"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100 border-0 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </motion.div>
          )}
          
          {/* Navigation Sections */}
          <div className="flex-1">
            <nav className="space-y-1">
              {filteredSections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-4 last:mb-0">
                {/* Section Header - Only show when not collapsed */}
                {!sidebarCollapsed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: sectionIndex * 0.05 }}
                    onClick={() => setExpandedSections(prev => ({
                      ...prev,
                      [section.title]: !prev[section.title]
                    }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 mb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-all group rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-3.5 rounded-full transition-all ${
                        expandedSections[section.title] ? 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-sm' : 'bg-gray-300'
                      }`} />
                      <span className="select-none font-medium">{section.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections[section.title] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    </motion.div>
                  </motion.button>
                )}
                
                <AnimatePresence>
                  {(sidebarCollapsed || expandedSections[section.title]) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const colorClasses = getColorClasses(item.color);
                        
                        return (
                          <motion.button
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (sectionIndex * 0.05) + (itemIndex * 0.02) }}
                            whileHover={{ 
                              scale: 1.01,
                              x: active ? 0 : 4
                            }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(item.path)}
                            className={`group relative w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-200 ${
                              active
                                ? 'bg-white shadow-md border-2 border-blue-300'
                                : 'hover:bg-white/50 hover:shadow-sm border border-transparent'
                            }`}
                            title={sidebarCollapsed ? item.name : ''}
                          >
                            {/* Icon */}
                            <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all transform ${
                              active
                                ? `${colorClasses.bg} ${colorClasses.text} shadow-lg scale-105`
                                : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-500 group-hover:from-gray-200 group-hover:to-gray-100 group-hover:text-gray-700'
                            } ${sidebarCollapsed ? 'mx-auto' : ''}`}>
                              <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
                            </div>
                            
                            {/* Text Content - Only show when not collapsed */}
                            {!sidebarCollapsed && (
                              <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm ${active ? colorClasses.text : 'text-gray-700'}`}>
                                  {item.name}
                                </div>
                                <div className={`text-xs mt-0.5 ${active ? colorClasses.text.replace('600', '500') : 'text-gray-500'}`}>
                                  {item.description}
                                </div>
                              </div>
                            )}
                            
                            {/* Badge */}
                            {!sidebarCollapsed && item.badge && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] text-center shadow-sm"
                              >
                                {item.badge}
                              </motion.div>
                            )}
                            
                            {/* Active Indicator - Gradient */}
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-500 shadow-lg"
                              />
                            )}
                            
                            {/* Badge for collapsed state */}
                            {sidebarCollapsed && item.badge && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md">
                                {item.badge}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            </nav>
          </div>

          {/* User Card at Bottom - Only show when not collapsed */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-auto pt-5 border-t-2 border-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
            >
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all group cursor-pointer"
                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-base">
                        {adminUser?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.name}</p>
                    <p className="text-xs text-gray-500 font-semibold">Administrator</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    className="w-9 h-9 rounded-xl hover:bg-gray-200 flex items-center justify-center transition-colors bg-white border border-gray-200"
                  >
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
                
                {/* Enhanced Dropdown Menu */}
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
                  >
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3 rounded-xl mx-1"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">View Profile</span>
                        <span className="text-xs text-gray-500">Manage account</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3 rounded-xl mx-1"
                    >
                      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Settings</span>
                        <span className="text-xs text-gray-500">Preferences</span>
                      </div>
                    </button>
                    <div className="my-2 border-t border-gray-200 mx-2"></div>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 rounded-xl mx-1"
                    >
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Logout</span>
                        <span className="text-xs text-red-500">Sign out</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* User Profile - Collapsed State */}
          {sidebarCollapsed && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <span className="text-white font-bold text-sm">
                  {adminUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          {/* Dropdown Menu for Collapsed State */}
          {sidebarCollapsed && profileDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-16 left-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
            >
              <div className="px-3 py-2.5 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-900">{adminUser?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button 
                onClick={() => setProfileDropdownOpen(false)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">View Profile</span>
              </button>
              <button 
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[75px]' : 'lg:ml-[300px]'}`}>
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {allMenuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Profile & Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <span className="text-white text-sm font-bold">
                    {adminUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{adminUser.name}</p>
                  <p className="text-xs text-gray-500 font-medium">Administrator</p>
                </div>
              </div>
              
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">View Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <div className="my-2 border-t border-gray-200"></div>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
