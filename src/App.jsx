import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Mousewheel, Keyboard, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import useMaintenanceCheck from './hooks/useMaintenanceCheck'
import MaintenancePopup from './components/MaintenancePopup'
import Auth from './components/auth/Auth'
import ResetPassword from './components/auth/ResetPassword'
import LandingPage from './components/LandingPage'
import Terms from './components/Terms'
import Privacy from './components/Privacy'
import AboutUs from './components/AboutUs'
import ExploreTrips from './components/ExploreTrips'
import TripDetails from './components/TripDetails'
import PastTripDetails from './components/PastTripDetails'
import BookingPage from './components/BookingPage'
import BookingSuccessPage from './components/BookingSuccessPage'
import BookingDetails from './components/BookingDetails'
import CompleteBookingPayment from './components/CompleteBookingPayment'
import UserProfile from './components/UserProfile'
import MyTrips from './components/MyTrips'
import UserVerification from './components/UserVerification'
import VerificationPopup from './components/VerificationPopup'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/EnhancedDashboard'
import StandaloneDashboard from './components/StandaloneDashboard'
import Trips from './components/admin/Trips'
import AddNewTrip from './components/admin/AddNewTrip_Enhanced'
import EditTrip from './components/admin/EditTrip'
import Bookings from './components/admin/Bookings'
import Users from './components/admin/Users'
import Payments from './components/admin/Payments'
import Coupons from './components/admin/Coupons'
import Referrals from './components/admin/Referrals'
import Notifications from './components/admin/Notifications'
import Analytics from './components/admin/Analytics'
import Support from './components/admin/Support'
import Settings from './components/admin/Settings'
import PaymentSettings from './components/admin/PaymentSettings'
import Terminal from './components/admin/Terminal'
import WhatsApp from './components/admin/WhatsApp'
import BookingDetailsPage from './components/admin/BookingDetailsPage'
import UserDetails from './components/admin/UserDetails'
import NotFound from './components/NotFound'
import './App.css'

// Main App component with routing
const AppContent = () => {
  const { user } = useAuth();
  const { isMaintenanceMode, maintenanceData } = useMaintenanceCheck();
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);

  // Show maintenance popup for non-admin users when maintenance mode is active
  useEffect(() => {
    if (isMaintenanceMode && user && user.role !== 'admin') {
      setShowMaintenancePopup(true);
    } else {
      setShowMaintenancePopup(false);
    }
  }, [isMaintenanceMode, user]);

  return (
    <Router>
      {/* Global Verification Popup */}
      <VerificationPopup />
      
      {/* Global Maintenance Popup */}
      <MaintenancePopup
        isOpen={showMaintenancePopup}
        onClose={() => setShowMaintenancePopup(false)}
        maintenanceData={maintenanceData}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/explore-trips" element={<ExploreTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/past-trip/:id" element={<PastTripDetails />} />
        <Route path="/booking/:tripId" element={<BookingPage />} />
        <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />
        <Route path="/complete-payment/:bookingId" element={<CompleteBookingPayment />} />
        
        {/* User Profile Routes */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
        <Route path="/profile/verification" element={<UserVerification />} />
        <Route path="/dashboard" element={<StandaloneDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        } />
        <Route path="/admin/trips" element={
          <AdminLayout>
            <Trips />
          </AdminLayout>
        } />
        <Route path="/admin/trips/add" element={
          <AdminLayout>
            <AddNewTrip />
          </AdminLayout>
        } />
        <Route path="/admin/trips/edit/:id" element={
          <AdminLayout>
            <EditTrip />
          </AdminLayout>
        } />
        <Route path="/admin/bookings" element={
          <AdminLayout>
            <Bookings />
          </AdminLayout>
        } />
        <Route path="/admin/bookings/:id" element={
          <AdminLayout>
            <BookingDetailsPage />
          </AdminLayout>
        } />
        <Route path="/admin/users" element={
          <AdminLayout>
            <Users />
          </AdminLayout>
        } />
        <Route path="/admin/users/:id" element={
          <AdminLayout>
            <UserDetails />
          </AdminLayout>
        } />
        <Route path="/admin/payments" element={
          <AdminLayout>
            <Payments />
          </AdminLayout>
        } />
        <Route path="/admin/coupons" element={
          <AdminLayout>
            <Coupons />
          </AdminLayout>
        } />
        <Route path="/admin/referrals" element={
          <AdminLayout>
            <Referrals />
          </AdminLayout>
        } />
        <Route path="/admin/terminal" element={
          <AdminLayout>
            <Terminal />
          </AdminLayout>
        } />
        <Route path="/admin/notifications" element={
          <AdminLayout>
            <Notifications />
          </AdminLayout>
        } />
        <Route path="/admin/analytics" element={
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        } />
        <Route path="/admin/sessions" element={<Navigate to="/admin/analytics" replace />} />
        <Route path="/admin/support" element={
          <AdminLayout>
            <Support />
          </AdminLayout>
        } />
        <Route path="/admin/settings" element={
          <AdminLayout>
            <Settings />
          </AdminLayout>
        } />
        <Route path="/admin/payment-settings" element={
          <AdminLayout>
            <PaymentSettings />
          </AdminLayout>
        } />
        <Route path="/admin/whatsapp" element={
          <AdminLayout>
            <WhatsApp />
          </AdminLayout>
        } />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App