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

// Lab Pages
import LabDashboard from './pages/lab/LabDashboard';
import LabReportForm from './pages/lab/LabReportForm';

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

  // Surveillance Center is restricted to health authorities and admins —
  // doctors and lab technicians only see their own clinical workspace.
  const surveillanceRoles = ['authority', 'admin'];
  const clinicalRoles = ['doctor', 'authority', 'admin'];
  const labRoles = ['lab', 'authority', 'admin'];

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
            {/* Clinical Workspace Routes (doctor only, + authority/admin oversight) */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={clinicalRoles}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/submit" element={
              <ProtectedRoute allowedRoles={clinicalRoles}>
                <ReportForm />
              </ProtectedRoute>
            } />
            <Route path="/doctor/records" element={
              <ProtectedRoute allowedRoles={clinicalRoles}>
                <ReportHistory />
              </ProtectedRoute>
            } />
            <Route path="/doctor/signals" element={
              <ProtectedRoute allowedRoles={clinicalRoles}>
                <FacilitySignals />
              </ProtectedRoute>
            } />
            <Route path="/doctor/profile" element={
              <ProtectedRoute allowedRoles={clinicalRoles}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Lab Workspace Routes (lab only, + authority/admin oversight) */}
            <Route path="/lab" element={
              <ProtectedRoute allowedRoles={labRoles}>
                <LabDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lab/submit" element={
              <ProtectedRoute allowedRoles={labRoles}>
                <LabReportForm />
              </ProtectedRoute>
            } />
            <Route path="/lab/profile" element={
              <ProtectedRoute allowedRoles={labRoles}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Surveillance Center Routes (health authorities & admins only) */}
            <Route path="/surveillance" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <SurveillanceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/trends" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <DiseaseTrends />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/statistics" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <NationalStatistics />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/clusters" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <GeographicClusters />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/amr" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <AMRWatch />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/alerts" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <AlertCenter />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/alerts/:id" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <InvestigationDetail />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/facilities" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
                <FacilityDetail />
              </ProtectedRoute>
            } />
            <Route path="/surveillance/profile" element={
              <ProtectedRoute allowedRoles={surveillanceRoles}>
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
              <ProtectedRoute allowedRoles={['doctor', 'lab', 'authority', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={user.role === 'lab' ? '/lab' : user.role === 'authority' ? '/surveillance' : user.role === 'admin' ? '/admin' : '/doctor'} replace />} />
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
