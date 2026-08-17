import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, FileEdit, Radio, 
  LineChart, Map, Pill, ShieldAlert, User, LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.75rem 1.25rem',
    margin: '0.125rem 0.75rem',
    borderRadius: '8px',
    color: isActive ? '#14532d' : '#4a665e', // dark forest green vs medium sage
    backgroundColor: isActive ? '#edf5f1' : 'transparent', // mint tint background for active link
    textDecoration: 'none',
    fontWeight: isActive ? '700' : '500',
    fontSize: '0.925rem',
    transition: 'all 0.2s ease-in-out'
  });

  // Unified list of links that are visible for seamless demo flow
  const clinicalLinks = [
    { path: '/doctor', name: 'Doctor Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/doctor/records', name: 'Patient Records', icon: <FileText size={20} /> },
    { path: '/doctor/submit', name: 'Submit Report', icon: <FileEdit size={20} /> }
  ];

  const surveillanceLinks = [
    { path: '/surveillance', name: 'Live Surveillance', icon: <Radio size={20} /> },
    { path: '/surveillance/trends', name: 'Disease Trends', icon: <LineChart size={20} /> },
    { path: '/surveillance/clusters', name: 'Geographic Clusters', icon: <Map size={20} /> },
    { path: '/surveillance/amr', name: 'AMR Watch', icon: <Pill size={20} /> },
    { path: '/surveillance/alerts', name: 'Alerts', icon: <ShieldAlert size={20} /> }
  ];

  const profilePath =
    user.role === 'admin'
      ? '/admin/profile'
      : user.role === 'doctor'
        ? '/doctor/profile'
        : '/surveillance/profile';

  return (
    <aside style={{
      ...styles.sidebar,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    }}>
      <div style={styles.header}>
        <span style={styles.title}>SWASTHYA SENTINEL</span>
        <div style={styles.roleSubtitle}>
          {user.role === 'doctor' ? `Clinician: ${user.name}` : `Surveillance Officer: ${user.name}`}
        </div>
      </div>
      
      <div style={styles.linksContainer}>
        {/* CLINICAL SECTION */}
        <div style={{ marginBottom: '1.25rem' }}>
          {clinicalLinks.map((link) => (
            <NavLink key={link.path} to={link.path} style={linkStyle}>
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>

        {/* SURVEILLANCE CENTER HEADER */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionHeader}>SURVEILLANCE CENTER</span>
        </div>

        {/* SURVEILLANCE SECTION */}
        <div>
          {surveillanceLinks.map((link) => (
            <NavLink key={link.path} to={link.path} style={linkStyle}>
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <NavLink to={profilePath} style={linkStyle}>
          <User size={20} />
          <span>Profile & Access</span>
        </NavLink>
        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #d1dfd6',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 70px)',
    transition: 'transform 0.3s ease',
    flexShrink: 0,
    zIndex: 90
  },
  header: {
    padding: '1.5rem 1.25rem 1rem 1.25rem',
    borderBottom: '1px solid #edf3ef',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#789088',
    letterSpacing: '0.1em'
  },
  roleSubtitle: {
    fontSize: '0.8rem',
    color: '#0f766e',
    fontWeight: '600',
    marginTop: '0.25rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto'
  },
  sectionDivider: {
    padding: '0 1.25rem 0.5rem 1.25rem',
    marginTop: '0.5rem'
  },
  sectionHeader: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#789088',
    letterSpacing: '0.05em'
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid #edf3ef'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 1rem',
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#789088',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '6px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    }
  }
};

export default Sidebar;
