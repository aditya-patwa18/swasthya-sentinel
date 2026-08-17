import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a1128',
        color: '#06b6d4',
        fontSize: '1.25rem',
        fontWeight: '600'
      }}>
        Loading EpiWatch Platform...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if role is incorrect
    if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    } else if (user.role === 'lab') {
      return <Navigate to="/lab" replace />;
    } else if (user.role === 'authority') {
      return <Navigate to="/surveillance" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
