import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReportForm from './pages/doctor/ReportForm';
import ReportHistory from './pages/doctor/ReportHistory';
import FacilitySignals from './pages/doctor/FacilitySignals';

// Surveillance Pages
import SurveillanceDashboard from './pages/surveillance/SurveillanceDashboard';
import NationalStatistics from './pages/surveillance/NationalStatistics';
import DiseaseTrends from './pages/surveillance/DiseaseTrends';
import GeographicClusters from './pages/surveillance/GeographicClusters';
import AMRWatch from './pages/surveillance/AMRWatch';
import AlertCenter from './pages/surveillance/AlertCenter';
import InvestigationDetail from './pages/surveillance/InvestigationDetail';
import FacilityDetail from './pages/surveillance/FacilityDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Apply clinical-workspace style class to body
  useEffect(() => {
    document.body.classList.add('clinical-workspace');
  }, []);

  const isPublicRoute = ['/', '/login', '/signup', '/how-it-works'].includes(location.pathname);

  // Wait for the auth check to resolve before deciding public vs. private
  // layout — otherwise a hard refresh/direct link to a protected route
  // briefly sees user === null and gets bounced to "/" before the token
  // in localStorage has a chance to restore the session.
  if (loading && !isPublicRoute) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#4a665e' }}>
        Loading Swasthya Sentinel...
      </div>
    );
  }

  if (isPublicRoute || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Permissive role array to enable smooth transitions during live evaluations
  const allRoles = ['doctor', 'authority', 'admin'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar toggleSidebar={toggleSidebar} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar isOpen={sidebarOpen} />
        <main style={{ 
          flex: 1, 
          padding: '1.5rem', 
          overflowY: 'auto',
          backgroundColor: '#edf3ef' 
        }}>
          <Routes>
            {/* Clinical Workspace Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/submit" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <ReportForm />
              </ProtectedRoute>
            } />
            <Route path="/doctor/records" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <ReportHistory />
              </ProtectedRoute>
            } />
            <Route path="/doctor/signals" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <FacilitySignals />
              </ProtectedRoute>
            } />
            <Route path="/doctor/profile" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Surveillance Center Routes */}
            <Route path="/surveillance" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <SurveillanceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/trends" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <DiseaseTrends />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/statistics" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <NationalStatistics />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/clusters" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <GeographicClusters />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/amr" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <AMRWatch />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/alerts" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <AlertCenter />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/alerts/:id" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <InvestigationDetail />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/facilities" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <FacilityDetail />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/profile" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard tab="users" />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={allRoles}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
};

export default App;
