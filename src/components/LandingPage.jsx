import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Mousewheel, Keyboard, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { useAuth } from '../contexts/AuthContext'
import contactService from '../services/contactService'
import NotificationDropdown from './NotificationDropdown'

const LandingPage = () => {
  const { user } = useAuth()
  const [isNavbarVisible, setIsNavbarVisible] = useState(false)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    customSubject: '',
    message: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  const subjectOptions = [
    'General Inquiry',
    'Booking Support',
    'Payment Issues',
    'Trip Information',
    'Cancellation Request',
    'Technical Support',
    'Partnership Inquiry',
    'Feedback & Suggestions',
    'Other'
  ]

  const destinations = [
    {
      name: "Rishikesh",
      image: "https://rishikeshdaytour.com/blog/wp-content/uploads/2019/03/Rishikesh-Uttarakhand-India.jpg",
      description: "Yoga Capital of the World"
    },
    {
      name: "Mussoorie",
      image: "https://c.ndtvimg.com/gws/ms/top-places-to-visit-in-mussoorie/assets/2.jpeg?1727874795",
      description: "Queen of the Hills"
    },
    {
      name: "Tungnath",
      image: "https://static.tnn.in/thumb/msid-108203577,thumbsize-65312,width-1280,height-720,resizemode-75/108203577.jpg",
      description: "Highest Shiva Temple"
    },
    {
      name: "Manali",
      image: "https://www.tripstorz.com/_astro/houses-surrounded-by-green-trees-in-manali-during-daytime.DAktkgeM_90jep.jpg",
      description: "Adventure Paradise"
    },
    {
      name: "Dalhousie",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/dalhousie-himachal-pradesh-1-city-hero?qlt=82&ts=1751539687562",
      description: "Colonial Hill Station"
    },
    {
      name: "Haridwar",
      image: "https://ticketandtime.com/wp-content/uploads/2024/12/Ganga-aarti-haridwar.jpg",
      description: "Gateway to the Gods"
    },
    {
      name: "Spiti",
      image: "https://skyhike.in/uploads/itinerary/xr9b2bLN5tamHrRxzQX5cQ2cuVdY8NP5bOO7BJeY.jpg",
      description: "Cold Desert Valley"
    },
    {
      name: "Nainital",
      image: "https://media1.thrillophilia.com/filestore/k6501j0dj5447unvzmqwso6b3chk_shutterstock_1250724667.jpg?w=400&dpr=2",
      description: "The Lake District of India"
    }
  ]

  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
      title: "Expert Travel Planning",
      description: "Our experienced team creates personalized itineraries tailored to your preferences and budget."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
        </svg>
      ),
      title: "Premium Accommodations",
      description: "Stay in handpicked hotels and resorts that offer comfort, luxury, and authentic local experiences."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      title: "Safe Transportation",
      description: "Reliable and comfortable vehicles with experienced drivers for all your travel needs."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
      title: "24/7 Support",
      description: "Round-the-clock assistance to ensure your journey is smooth and worry-free."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
      title: "Best Price Guarantee",
      description: "Competitive pricing with no hidden costs. We offer the best value for your money."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "Local Expertise",
      description: "Deep knowledge of destinations with insider tips and off-the-beaten-path experiences."
    }
  ]

  const faqs = [
    {
      question: "What types of travel packages do you offer?",
      answer: "We offer a wide range of packages including adventure tours, family vacations, honeymoon packages, group tours, and customized itineraries for all popular destinations."
    },
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 2-3 weeks in advance for domestic travel and 4-6 weeks for international trips to get the best rates and availability."
    },
    {
      question: "Do you provide travel insurance?",
      answer: "Yes, we offer comprehensive travel insurance options to protect you against unforeseen circumstances during your journey."
    },
    {
      question: "Can I customize my travel itinerary?",
      answer: "Absolutely! We specialize in creating personalized itineraries based on your interests, budget, and preferences."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, net banking, UPI, and also offer EMI options for your convenience."
    },
    {
      question: "Do you have group discounts?",
      answer: "Yes, we offer attractive group discounts for bookings of 6 or more people. Contact us for special group rates."
    }
  ]

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarVisible(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset image error when user changes
  useEffect(() => {
    setImgError(false)
  }, [user?.profilePicture])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess(false)
    
    try {
      // Prepare data with subject
      const submitData = {
        ...formData,
        subject: formData.subject === 'Other' ? formData.customSubject : formData.subject
      }
      
      const response = await contactService.submitContact(submitData)
      if (response.success) {
        setFormSuccess(true)
        setFormData({ name: '', email: '', phone: '', subject: '', customSubject: '', message: '' })
        // Show success message
        alert('Thank you for your message! We will get back to you soon.')
      }
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      alert('Failed to send your message. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 pb-16 md:pb-0">
      {/* Enhanced Floating Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isNavbarVisible 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3 border-b border-purple-100' 
          : 'bg-white/80 backdrop-blur-sm py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
            </div>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Ghumakkars
              </span>
            </Link>
            
            {/* Enhanced Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/explore-trips" 
                className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
              >
                Explore Trips
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/my-trips" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    My Trips
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    Profile
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                  
                  {/* Search Icon */}
                  <Link
                    to="/explore-trips"
                    className="p-2 rounded-lg hover:bg-purple-50 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Link>
                  
                  {/* Notifications Dropdown */}
                  <NotificationDropdown />
                </>
              ) : (
                <>
                  <a 
                    href="#destinations" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    Destinations
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </a>
                  <a 
                    href="#features" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    Features
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </a>
                  <a 
                    href="#faq" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    FAQ
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </a>
                  <a 
                    href="#contact" 
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 rounded-lg hover:bg-purple-50 group"
                  >
                    Contact
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </a>
                </>
              )}
            </div>
            
            {/* Enhanced User Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>

                  {/* Desktop User Profile */}
                  <div className="hidden md:flex items-center space-x-3 group relative">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300 cursor-pointer"
                      >
                        {user.profilePicture && !imgError ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.firstName || user.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {(user.firstName || user.name).charAt(0).toUpperCase()}
                      </span>
                    </div>
                        )}
                      </button>
                      {/* Online Status Indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="hidden lg:block cursor-pointer text-left"
                  >
                      <p className="text-sm font-semibold text-gray-800">
                        {(user.firstName || '') + (user.lastName ? ' ' + user.lastName : '') || user.name}
                      </p>
                      <p className="text-xs text-gray-500">Active</p>
                  </button>

                    {/* Profile Dropdown */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-purple-50 to-indigo-50">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200 shadow-md">
                            {user.profilePicture && !imgError ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.firstName || user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                  {(user.firstName || user.name).charAt(0).toUpperCase()}
                                </span>
                </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">
                              {(user.firstName || '') + (user.lastName ? ' ' + user.lastName : '') || user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        {/* Wallet Balance */}
                        <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Wallet Balance</p>
                                <p className="text-lg font-bold text-gray-900">₹{user.wallet?.balance || 0}</p>
                              </div>
                            </div>
                            <Link 
                              to="/profile" 
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-700 group-hover:text-purple-600 font-medium">My Profile</span>
                        </Link>
                        <Link 
                          to="/my-trips" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span className="text-gray-700 group-hover:text-purple-600 font-medium">My Trips</span>
                        </Link>
                        <a 
                          href="#contact" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="text-gray-700 group-hover:text-purple-600 font-medium">Support</span>
                        </a>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.reload();
                          }}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors group w-full text-left"
                        >
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-red-600 font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Login Button */}
                  <Link 
                    to="/auth" 
                    className="md:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Login
                  </Link>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>

                  {/* Desktop Login Button */}
                  <Link 
                    to="/auth" 
                    className="hidden md:block group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 py-4 border-t border-purple-100"
            >
              <div className="space-y-2">
                <Link 
                  to="/explore-trips" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                >
                  Explore Trips
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/my-trips" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      My Trips
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      Profile
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                      }}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-center shadow-md"
                    >
                      Login / Sign Up
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <a 
                      href="#destinations" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      Destinations
                    </a>
                    <a 
                      href="#features" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      Features
                    </a>
                    <a 
                      href="#faq" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      FAQ
                    </a>
                    <a 
                      href="#contact" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg hover:text-purple-600 transition-colors font-semibold"
                    >
                      Contact
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        ></div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-300/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-300/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-400/20 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-indigo-400/30 rounded-full animate-float"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Explore the World
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-in-up-delayed">
            Discover amazing destinations with Ghumakkars - Your trusted travel companion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed-2">
            <Link to="/explore-trips" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center">
              Start Your Journey
            </Link>
            <Link to="/explore-trips" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 text-center">
              View Packages
            </Link>
          </div>
        </div>

      </section>

      {/* Destinations Slideshow */}
      <section id="destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the most beautiful places in India with our curated travel experiences
            </p>
          </div>

          <div className="destinations-swiper-container">
            {/* Auto-play indicator */}
            <div className="autoplay-indicator">
              <div className="autoplay-dot"></div>
            </div>
            
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              spaceBetween={-60}
              coverflowEffect={{
                rotate: 5,
                stretch: 0,
                depth: 150,
                modifier: 1.2,
                slideShadows: true,
              }}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={800}
              mousewheel={{
                forceToAxis: true,
                sensitivity: 1,
                releaseOnEdges: true,
              }}
              keyboard={{
                enabled: true,
                onlyInViewport: true,
              }}
              breakpoints={{
                320: {
                  spaceBetween: -40,
                  coverflowEffect: {
                    rotate: 2,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                  }
                },
                768: {
                  spaceBetween: -50,
                  coverflowEffect: {
                    rotate: 3,
                    stretch: 0,
                    depth: 120,
                    modifier: 1.1,
                    slideShadows: true,
                  }
                },
                1024: {
                  spaceBetween: -60,
                  coverflowEffect: {
                    rotate: 5,
                    stretch: 0,
                    depth: 150,
                    modifier: 1.2,
                    slideShadows: true,
                  }
                }
              }}
              modules={[EffectCoverflow, Mousewheel, Keyboard, Autoplay]}
              className="destinations-swiper"
            >
              {destinations.map((destination, index) => (
                <SwiperSlide key={index} className="destination-slide">
                  <div className="destination-card">
                    <div className="destination-image-container">
                      <img 
                        src={destination.image} 
                        alt={destination.name}
                        className="destination-image"
                      />
                      <div className="destination-overlay">
                        <div className="destination-content">
                          <h3 className="destination-title">{destination.name}</h3>
                          <p className="destination-description">{destination.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose Ghumakkars?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide exceptional travel experiences with unmatched service and attention to detail
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our travel services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left font-semibold text-gray-800 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <span className={`transform transition-transform duration-200 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Form Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                Ready to plan your next adventure? We're here to help you create unforgettable memories!
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Let's Connect</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email Us</p>
                      <p className="text-purple-100">contact@ghumakkars.in</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Call Us</p>
                      <p className="text-purple-100">+91 8384826414</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Visit Us</p>
                      <p className="text-purple-100">Mathura, Uttar Pradesh</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Response Promise */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 border border-green-400/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold">Quick Response</h4>
                </div>
                <p className="text-green-100 text-sm">We typically respond within 2-4 hours during business hours</p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
            >
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="+91 8384826414"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              {/* Custom Subject Input */}
              {formData.subject === 'Other' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Custom Subject</label>
                  <input
                    type="text"
                    name="customSubject"
                    value={formData.customSubject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Please specify your subject"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subject = formData.subject === 'Other' ? formData.customSubject : formData.subject
                    const whatsappMessage = `Hi! I have a query regarding: ${subject || 'General Inquiry'}

Name: ${formData.name || 'Not provided'}
Email: ${formData.email || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}

Message: ${formData.message || 'Please contact me for more details.'}`
                    const whatsappUrl = `https://wa.me/918384826414?text=${encodeURIComponent(whatsappMessage)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="flex-1 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp Us
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Ghumakkars
              </h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Your trusted travel companion for unforgettable journeys across India and beyond. 
                We create memories that last a lifetime.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="#destinations" className="text-gray-300 hover:text-white transition-colors">Destinations</a></li>
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span>+91 8384826414</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>contact@ghumakkars.in</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>New Delhi, India</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span>Mon-Sat: 9AM-7PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2024 Ghumakkars. All rights reserved. | Made with <svg className="w-4 h-4 inline mx-1 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> for travelers
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-gray-400">
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                <span className="text-gray-600">|</span>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <span className="text-gray-600">|</span>
                <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation - Only show when user is logged in */}
      {user && (
        <div className="fixed bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg z-50 md:hidden">
          <div className="flex items-center justify-around py-2">
            {/* Home */}
            <Link 
              to="/" 
              className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </Link>

            {/* Explore Trips */}
            <Link 
              to="/explore-trips" 
              className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium">Explore</span>
            </Link>

            {/* My Trips */}
            <Link 
              to="/my-trips" 
              className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-xs font-medium">My Trips</span>
            </Link>

            {/* Profile */}
            <Link 
              to="/profile" 
              className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
