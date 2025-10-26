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
    sessions: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
          name: 'Sessions', 
          icon: Shield, 
          path: '/admin/sessions', 
          color: 'cyan',
          badge: null,
          description: 'Active Sessions'
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
        initial={{ x: -300 }}
        animate={{ 
          x: sidebarOpen ? 0 : -300,
          width: sidebarCollapsed ? '80px' : '280px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-hidden`}
      >
        {/* Logo & Collapse Button */}
        <div className="relative h-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Ghumakkars</h1>
                <p className="text-xs text-blue-100 font-semibold">Admin Panel</p>
              </div>
            </motion.div>
          )}
          
          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full items-center justify-center shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </motion.button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Search Bar */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </motion.div>
          )}

          {/* Quick Stats */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-2"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Bookings</span>
                </div>
                <p className="text-lg font-black text-blue-700">{stats.totalBookings}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-900">Revenue</span>
                </div>
                <p className="text-lg font-black text-emerald-700">₹{(stats.revenue / 1000).toFixed(0)}K</p>
              </div>
            </motion.div>
          )}
          
          {/* Navigation Sections */}
          <nav className="space-y-2">
            {filteredSections.map((section, sectionIndex) => (
              <div key={section.title} className="pb-2 border-b border-slate-200/50 last:border-0">
                {!sidebarCollapsed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: sectionIndex * 0.05 }}
                    onClick={() => setExpandedSections(prev => ({
                      ...prev,
                      [section.title]: !prev[section.title]
                    }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider hover:text-slate-900 transition-all rounded-lg hover:bg-gradient-to-r hover:from-slate-100 hover:to-transparent group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-1 h-4 rounded-full transition-all ${
                        expandedSections[section.title] ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      <span>{section.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections[section.title] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
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
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className={`group relative w-full flex items-center ${
                          sidebarCollapsed ? 'justify-center px-3' : 'px-3'
                        } py-3 text-left rounded-xl transition-all duration-200 ${
                          active
                            ? `${colorClasses.activeBg} ${colorClasses.text} shadow-md border ${colorClasses.border}`
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        title={sidebarCollapsed ? item.name : ''}
                      >
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                          active
                            ? `${colorClasses.bg} ${colorClasses.text}`
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        } ${sidebarCollapsed ? '' : 'mr-3'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        {!sidebarCollapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">{item.name}</div>
                              <div className="text-xs text-slate-500 truncate">{item.description}</div>
                            </div>
                            
                            {item.badge && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center"
                              >
                                {item.badge}
                              </motion.div>
                            )}
                            
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 ${colorClasses.text.replace('text-', 'bg-')} rounded-l-full`}
                              />
                            )}
                          </>
                        )}
                        
                        {sidebarCollapsed && item.badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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

          {/* User Card at Bottom */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto p-3 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {adminUser?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{adminUser?.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200"
              >
                <Icon name="menu" className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {allMenuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">
                    {adminUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-800">{adminUser.name}</p>
                  <p className="text-xs text-slate-500 font-medium">Administrator</p>
                </div>
              </div>
              
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  <Icon name="chevron" className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Icon name="users" className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-medium">Profile</span>
                    </button>
                    <button 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Icon name="settings" className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-medium">Settings</span>
                    </button>
                    <hr className="my-2 border-slate-200" />
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
