import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import tripService from '../services/tripService';
import referralService from '../services/referralService';
import OverviewPanel from './profile/OverviewPanel';
import MyTripsPanel from './profile/MyTripsPanel';
import LikedTripsPanel from './profile/LikedTripsPanel';
import WalletPanel from './profile/WalletPanel';
import ReferralsPanel from './profile/ReferralsPanel';
import EditProfilePanel from './profile/EditProfilePanel';
import { 
  Copy, 
  Share2, 
  Gift, 
  Users, 
  Wallet, 
  CheckCircle, 
  ExternalLink,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X,
  LogOut
} from 'lucide-react';

const UserProfile = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    walletBalance: 0,
    referrals: 0,
    referralEarnings: 0,
    isVerified: false
  });
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    totalEarnings: 0,
    referralHistory: []
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      
      // Fetch both user profile and referral data in parallel
      const [profileResponse, referralResponse] = await Promise.all([
        userService.getProfile(),
        referralService.getReferralStats().catch(error => {
          console.log('Referral stats not available:', error.message);
          return { success: false, data: null };
        })
      ]);
      
      console.log('Profile response:', profileResponse);
      console.log('Referral response:', referralResponse);
      
      // Set user stats from profile
      if (profileResponse && profileResponse.stats) {
        setUserStats(profileResponse.stats);
      } else if (profileResponse && profileResponse.user) {
        const user = profileResponse.user;
        setUserStats({
          totalTrips: user.tripHistory?.length || 0,
          totalSpent: user.tripHistory?.reduce((sum, trip) => sum + (trip.totalAmount || 0), 0) || 0,
          walletBalance: user.wallet?.balance || 0,
          referrals: user.referrals?.length || 0,
          referralEarnings: user.referrals?.reduce((sum, ref) => sum + (ref.rewardEarned || 0), 0) || 0,
          isVerified: user.isVerified || false
        });
      } else {
        setUserStats({
          totalTrips: 0,
          totalSpent: 0,
          walletBalance: 0,
          referrals: 0,
          referralEarnings: 0,
          isVerified: false
        });
      }
      
      // Set referral data from referral API
      if (referralResponse.success && referralResponse.data) {
        const referralData = referralResponse.data;
        console.log('Setting referral data from API:', referralData);
        
        setReferralData({
          referralCode: referralData.referralCode || 'Generating...',
          referralLink: `${window.location.origin}/auth?ref=${referralData.referralCode}`,
          totalReferrals: referralData.totalReferrals || 0,
          totalEarnings: referralData.totalEarnings || 0,
          referralHistory: referralData.recentReferrals || []
        });
      } else {
        // Fallback to user profile data if referral API fails
        const user = profileResponse?.user;
        if (user) {
          const referralCode = user.referralCode || 'Generating...';
          const referralLink = user.referralCode 
            ? `${window.location.origin}/auth?ref=${user.referralCode}`
            : `${window.location.origin}/auth`;
          
          console.log('Setting referral data from profile fallback:', { referralCode, referralLink });
          setReferralData({
            referralCode: referralCode,
            referralLink: referralLink,
            totalReferrals: user.referrals?.length || 0,
            totalEarnings: user.referrals?.reduce((sum, ref) => sum + (ref.rewardEarned || 0), 0) || 0,
            referralHistory: user.referrals || []
          });
          
          // If referral code is missing, request backend to generate one
          if (!user.referralCode) {
            console.log('Referral code missing, requesting generation...');
            try {
              await userService.updateProfile({ generateReferralCode: true });
              // Refetch profile to get the new referral code
              setTimeout(() => fetchUserProfile(), 1000);
            } catch (error) {
              console.error('Error generating referral code:', error);
            }
          }
        } else {
          setReferralData({
            referralCode: 'Generating...',
            referralLink: `${window.location.origin}/auth`,
            totalReferrals: 0,
            totalEarnings: 0,
            referralHistory: []
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // If it's an authentication error, clear token and redirect to login
      if (error.message.includes('401') || error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
        console.log('Authentication error detected, clearing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
        return;
      }
      
      setUserStats({
        totalTrips: 0,
        totalSpent: 0,
        walletBalance: 0,
        referrals: 0,
        referralEarnings: 0,
        isVerified: false
      });
      
      setReferralData({
        referralCode: 'Error loading...',
        referralLink: `${window.location.origin}/auth`,
        totalReferrals: 0,
        totalEarnings: 0,
        referralHistory: []
      });
    }
  };

  // Manual logout function to clear invalid tokens
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    const success = await referralService.copyToClipboard(referralData.referralCode);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    const success = await referralService.copyToClipboard(referralData.referralLink);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Share referral link
  const shareReferralLink = (platform) => {
    referralService.shareReferralLink(platform, referralData.referralLink, referralData.referralCode);
  };

  const handleEditProfile = () => {
    setEditData({
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      collegeName: user?.collegeName || '',
      collegeId: user?.collegeId || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        phone: user?.emergencyContact?.phone || '',
        relationship: user?.emergencyContact?.relationship || ''
      }
    });
    setProfilePicturePreview(user?.profilePicture || null);
    setProfilePicture(null);
    setIsEditing(true);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Filter out unchanged data first
      const filteredEditData = {};
      let hasAnyChanges = false;

      // Check for profile picture
      if (profilePicture) {
        hasAnyChanges = true;
      }

      // Check each field for changes
      Object.keys(editData).forEach(key => {
        if (key === 'emergencyContact') {
          const currentValue = editData[key];
          const originalValue = user?.emergencyContact || {};
          
          // Check if emergency contact has any meaningful changes
          const hasEmergencyChanges = currentValue && (
            currentValue.name !== originalValue.name ||
            currentValue.phone !== originalValue.phone ||
            currentValue.relationship !== originalValue.relationship
          );
          
          if (hasEmergencyChanges) {
            filteredEditData[key] = currentValue;
            hasAnyChanges = true;
          }
        } else if (key === 'firstName') {
          const currentValue = editData.firstName;
          const originalValue = user?.firstName || '';
          if (currentValue !== undefined && currentValue !== originalValue && currentValue !== '') {
            filteredEditData[key] = currentValue;
            hasAnyChanges = true;
          }
        } else if (key === 'lastName') {
          const currentValue = editData.lastName;
          const originalValue = user?.lastName || '';
          if (currentValue !== undefined && currentValue !== originalValue) {
            filteredEditData[key] = currentValue || '';
            hasAnyChanges = true;
          }
        } else {
          const currentValue = editData[key];
          const originalValue = user?.[key] || '';
          if (currentValue !== undefined && currentValue !== originalValue && currentValue !== '') {
            filteredEditData[key] = currentValue;
            hasAnyChanges = true;
          }
        }
      });


      if (!hasAnyChanges) {
        alert('No changes detected. Please make some changes before saving.');
        setIsSaving(false);
        return;
      }


      // If there's a profile picture, upload it first
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        
        // Add other profile data
        Object.keys(filteredEditData).forEach(key => {
          if (key === 'emergencyContact') {
            formData.append(key, JSON.stringify(filteredEditData[key]));
          } else {
            formData.append(key, filteredEditData[key]);
          }
        });
        
        await userService.updateProfile(formData, true); // true indicates multipart/form-data
      } else {
        await userService.updateProfile(filteredEditData);
      }
      
      setIsEditing(false);
      setProfilePicture(null);
      setProfilePicturePreview(null);
      await refreshUser();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show more specific error message
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setEditData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'trips', label: 'My Trips', icon: 'plane' },
    { id: 'liked', label: 'Liked Trips', icon: 'heart' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    { id: 'referrals', label: 'Referrals', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      chart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      plane: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      wallet: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      heart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    };
    return icons[iconName] || icons.chart;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header Card - Enhanced Design with Glassmorphism */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-3xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 animate-pulse" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '50px 50px' }}></div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                <div className="relative group">
                  {user?.profilePicture ? (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl ring-4 ring-white/50 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-full flex items-center justify-center hidden">
                        <span className="text-indigo-600 text-3xl sm:text-4xl font-extrabold">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-white via-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white/90 shadow-2xl ring-4 ring-white/50 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                      <span className="text-indigo-600 text-3xl sm:text-4xl font-extrabold">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-green-400 to-emerald-500 border-3 border-white rounded-full shadow-lg ring-2 ring-white/50 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white truncate drop-shadow-lg mb-1">{user?.name || 'User'}</h1>
                  <p className="text-white/90 text-sm sm:text-base truncate flex items-center gap-2 mt-1 font-medium">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user?.email}
                  </p>
                  {user?.phone && (
                    <p className="text-white/90 text-sm sm:text-base flex items-center gap-2 mt-1.5 font-medium">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user.phone}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/25 text-white backdrop-blur-md shadow-lg border border-white/20 transition-all hover:bg-white/30">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    {user?.isVerified && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border border-green-400/30">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleEditProfile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-indigo-600 rounded-xl hover:bg-white transition-all duration-300 font-bold text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 border border-white/20 hover:border-white/40"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Enhanced */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex-1 sm:flex-none transform ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:scale-105 hover:shadow-md'
                }`}
              >
                {getIcon(tab.icon)}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Enhanced */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Overview</h2>
              
              {/* Stats Grid - Enhanced with Glassmorphism */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 sm:p-5 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-1">{userStats.totalTrips}</p>
                  <p className="text-blue-700 text-xs sm:text-sm font-semibold">Total Trips</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl p-4 sm:p-5 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-green-900 truncate mb-1">{formatCurrency(userStats.totalSpent)}</p>
                  <p className="text-green-700 text-xs sm:text-sm font-semibold">Total Spent</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 sm:p-5 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-purple-900 truncate mb-1">{formatCurrency(userStats.walletBalance)}</p>
                  <p className="text-purple-700 text-xs sm:text-sm font-semibold">Wallet Balance</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-100/50 rounded-2xl p-4 sm:p-5 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-orange-900 mb-1">{userStats.referrals}</p>
                  <p className="text-orange-700 text-xs sm:text-sm font-semibold">Referrals</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
                {userStats.totalTrips > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-start sm:items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-8 h-8 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Welcome to Ghumakkars!</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Your account is ready. Start exploring amazing trips!</p>
                      </div>
                      <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 hidden sm:inline">Just now</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">No Activity Yet</h4>
                    <p className="text-gray-600 text-sm mb-4">Start your travel journey by booking your first trip!</p>
                    <button 
                      onClick={() => navigate('/explore-trips')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Explore Trips
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Trips Tab */}
          {activeTab === 'trips' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Trips</h2>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">No Trips Yet</h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">You haven't booked any trips yet.</p>
                <button 
                  onClick={() => navigate('/explore-trips')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Browse Trips
                </button>
              </div>
            </div>
          )}

          {/* Liked Trips Tab */}
          {activeTab === 'liked' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Liked Trips</h2>
              <LikedTripsPanel />
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <WalletPanel />
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Referral Program</h2>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-600">
                  <Gift className="w-4 h-4" />
                  <span>Earn ₹100 per referral!</span>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Referrals</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">{referralData.totalReferrals}</p>
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-xs sm:text-sm font-medium">Total Earnings</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-900">₹{referralData.totalEarnings}</p>
                    </div>
                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-purple-600 text-xs sm:text-sm font-medium">Your Code</p>
                      <p className="text-sm sm:text-lg font-bold text-purple-900 font-mono truncate">{referralData.referralCode}</p>
                    </div>
                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Referral Link Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Referral Link</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-3 overflow-x-auto">
                      <p className="text-xs sm:text-sm text-gray-600 break-all">{referralData.referralLink}</p>
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                      <span className="sm:hidden">{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on Social Media</span>
                  </button>
                  
                  {/* Logout Button for debugging */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout & Clear Token</span>
                  </button>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm sm:text-base text-gray-700">Share your referral code or link with friends</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm sm:text-base text-gray-700">They register using your code and get ₹100 off their first booking</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm sm:text-base text-gray-700">When their booking is confirmed, you both get ₹100 in your wallet!</p>
                  </div>
                </div>
              </div>

              {/* Referral History */}
              {referralData.referralHistory.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Referral History</h3>
                  <div className="space-y-3">
                    {referralData.referralHistory.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{referral.user?.name || 'Friend'}</p>
                            <p className="text-xs sm:text-sm text-gray-500">Referred on {new Date(referral.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-600 text-sm sm:text-base">₹{referral.rewardEarned || 0}</p>
                          <p className="text-xs text-gray-500">Earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Settings</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Email Notifications</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Receive updates about your trips</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">SMS Notifications</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Get important updates via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Modal - Enhanced */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200/50 transform animate-fadeInUp">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center pb-4 border-b border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Profile Picture (Optional)</label>
                    <div className="relative">
                      {profilePicturePreview ? (
                        <div className="relative group">
                          <img
                            src={profilePicturePreview}
                            alt="Profile Preview"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-dashed border-gray-300">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="mt-4 cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG or GIF (Max 5MB)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editData.firstName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editData.lastName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your last name (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editData.fullName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                      <input
                        type="text"
                        name="collegeName"
                        value={editData.collegeName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your college name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">College ID (Optional)</label>
                      <input
                        type="text"
                        name="collegeId"
                        value={editData.collegeId || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your college ID (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editData.dateOfBirth || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={editData.gender || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={editData.emergencyContact?.name || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          name="emergencyContact.phone"
                          value={editData.emergencyContact?.phone || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter emergency contact phone"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                        <input
                          type="text"
                          name="emergencyContact.relationship"
                          value={editData.emergencyContact?.relationship || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter relationship (e.g., Father, Mother, Friend)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white py-2 sm:py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal - Enhanced */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200/50 transform animate-fadeInUp">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Share Your Referral</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                Share your referral code and help your friends get ₹100 off their first booking!
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => shareReferralLink('whatsapp')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => shareReferralLink('facebook')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Facebook</span>
                </button>
                
                <button
                  onClick={() => shareReferralLink('twitter')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Twitter</span>
                </button>
                
                <button
                  onClick={() => shareReferralLink('linkedin')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareReferralLink('instagram')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Instagram</span>
                </button>
                
                <button
                  onClick={() => shareReferralLink('email')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Email</span>
                </button>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={copyReferralLink}
                  className="w-full flex items-center justify-center space-x-2 p-2.5 sm:p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link to Clipboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
