import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (n) => {
    markNotificationRead(n._id);
    setShowNotifications(false);
    if (n.type === 'alert') {
      navigate('/surveillance/alerts');
    } else if (n.type === 'report' && user.role === 'doctor') {
      navigate('/doctor/records');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#8b5cf6';
      case 'authority': return '#0f766e';
      case 'doctor': return '#2563eb';
      default: return '#789088';
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        {user && (
          <button onClick={toggleSidebar} style={styles.menuBtn}>
            <Menu size={20} />
          </button>
        )}
        <Link to="/" style={styles.logoContainer}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>Swasthya Sentinel</span>
        </Link>
      </div>

      {user ? (
        <div style={styles.right}>
          {/* Notifications Dropdown */}
          <div style={styles.notificationWrapper}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={styles.navIconBtn}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <span style={{ fontWeight: '600', color: '#1b332a' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} style={styles.clearBtn}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={styles.notificationsList}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyNotifications}>No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          ...styles.notificationItem,
                          backgroundColor: n.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.08)'
                        }}
                      >
                        <div style={styles.notificationTitle}>{n.title}</div>
                        <div style={styles.notificationMessage}>{n.message}</div>
                        <div style={styles.notificationTime}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Summary */}
          <div
            style={styles.profileSection}
            onClick={() => {
              const profilePath =
                user.role === 'admin'
                  ? '/admin/profile'
                  : user.role === 'doctor'
                    ? '/doctor/profile'
                    : '/surveillance/profile';
              navigate(profilePath);
            }}
          >
            <div style={styles.avatar}>
              <User size={16} />
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <span
                style={{
                  ...styles.roleBadge,
                  backgroundColor: getRoleBadgeColor(user.role) + '15',
                  color: getRoleBadgeColor(user.role),
                  borderColor: getRoleBadgeColor(user.role) + '30'
                }}
              >
                {user.role === 'authority' ? 'Health Authority' : user.role.toUpperCase()}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div style={styles.authLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/login" style={styles.navLink}>Login</Link>
          <Link to="/signup" style={styles.btnNav}>Get Started</Link>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #d1dfd6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1.5rem',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#4a665e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem'
  },
  logoDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1b332a',
    letterSpacing: '-0.025em'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  notificationWrapper: {
    position: 'relative'
  },
  navIconBtn: {
    background: 'none',
    border: 'none',
    color: '#4a665e',
    cursor: 'pointer',
    padding: '0.5rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f4f8f5',
      color: '#1b332a'
    }
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#dc2626',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff'
  },
  dropdown: {
    position: 'absolute',
    top: '45px',
    right: 0,
    width: '320px',
    maxHeight: '400px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(16, 40, 24, 0.08)',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownHeader: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #d1dfd6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#0f766e',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  notificationsList: {
    overflowY: 'auto',
    flex: 1
  },
  emptyNotifications: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#789088',
    fontSize: '0.9rem'
  },
  notificationItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #edf3ef',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f4f8f5'
    }
  },
  notificationTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1b332a',
    marginBottom: '0.125rem'
  },
  notificationMessage: {
    fontSize: '0.75rem',
    color: '#4a665e',
    lineHeight: '1.3'
  },
  notificationTime: {
    fontSize: '0.65rem',
    color: '#789088',
    marginTop: '0.25rem',
    textAlign: 'right'
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    transition: 'all 0.2s'
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#e6efe8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f766e'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1b332a',
    lineHeight: '1.2'
  },
  roleBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.05rem 0.35rem',
    borderRadius: '4px',
    border: '1px solid',
    marginTop: '0.125rem',
    display: 'inline-block',
    width: 'fit-content'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#4a665e',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s'
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  navLink: {
    color: '#4a665e',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  btnNav: {
    backgroundColor: '#1b4d3e',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: '600'
  }
};

export default Navbar;
