import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Mousewheel, Keyboard, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/auth/Auth'
import ResetPassword from './components/auth/ResetPassword'
import LandingPage from './components/LandingPage'
import Terms from './components/Terms'
import Privacy from './components/Privacy'
import ExploreTrips from './components/ExploreTrips'
import TripDetails from './components/TripDetails'
import BookingPage from './components/BookingPage'
import UserProfile from './components/UserProfile'
import MyTrips from './components/MyTrips'
import UserVerification from './components/UserVerification'
import VerificationPopup from './components/VerificationPopup'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import Trips from './components/admin/Trips'
import AddNewTrip from './components/admin/AddNewTrip_Enhanced'
import EditTrip from './components/admin/EditTrip'
import Bookings from './components/admin/Bookings'
import Users from './components/admin/Users'
import Payments from './components/admin/Payments'
import Coupons from './components/admin/Coupons'
import Referrals from './components/admin/Referrals'
import Notifications from './components/admin/Notifications'
import Sessions from './components/admin/Sessions'
import Support from './components/admin/Support'
import Settings from './components/admin/Settings'
import PaymentSettings from './components/admin/PaymentSettings'
import Terminal from './components/admin/Terminal'
import './App.css'

// Main App component with routing
const AppContent = () => {
  return (
    <Router>
      {/* Global Verification Popup */}
      <VerificationPopup />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/explore-trips" element={<ExploreTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/booking/:tripId" element={<BookingPage />} />
        
        {/* User Profile Routes */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/profile/verification" element={<UserVerification />} />
        
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
        <Route path="/admin/users" element={
          <AdminLayout>
            <Users />
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
        <Route path="/admin/sessions" element={
          <AdminLayout>
            <Sessions />
          </AdminLayout>
        } />
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
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
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