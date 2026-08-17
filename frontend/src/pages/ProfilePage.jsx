import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Building, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Edit state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    city: user?.city || '',
    state: user?.state || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password edit state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    const result = await updateProfile(profileData);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess('Profile updated successfully.');
    } else {
      setProfileError(result.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return setPasswordError('New passwords do not match.');
    }
    if (passwordData.newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters long.');
    }

    setPasswordLoading(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setPasswordLoading(false);

    if (result.success) {
      setPasswordSuccess('Password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      setPasswordError(result.error || 'Failed to change password. Double check current password.');
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '1.5rem' }}>Account Settings</h1>

      <div style={styles.layout}>
        {/* Left Column: Profile edit */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <User size={20} color="#06b6d4" />
            <h3 style={{ margin: 0 }}>Edit Profile Information</h3>
          </div>

          {profileError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div style={styles.successAlert}>
              <CheckCircle size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input
                type="email"
                value={user.email}
                className="form-control"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              />
            </div>

            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="form-control"
                  required
                />
              </div>

              {user.role === 'doctor' && (
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    className="form-control"
                    required
                  />
                </div>
              )}
            </div>

            {user.role === 'doctor' && user.facility && (
              <div className="form-group">
                <label className="form-label">Connected Facility (Read Only)</label>
                <div style={styles.facilityBox}>
                  <Building size={16} color="#3b82f6" />
                  <span style={{ fontWeight: '500' }}>{user.facility.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    ({user.facility.city}, {user.facility.state})
                  </span>
                </div>
              </div>
            )}

            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleProfileChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Password change */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <Lock size={20} color="#06b6d4" />
            <h3 style={{ margin: 0 }}>Change Password</h3>
          </div>

          {passwordError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div style={styles.successAlert}>
              <CheckCircle size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={passwordLoading}>
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  card: {
    flex: 1,
    minWidth: '320px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem'
  },
  row: {
    display: 'flex',
    gap: '1rem'
  },
  facilityBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.85rem'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    color: '#ef4444',
    padding: '0.625rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '6px',
    color: '#10b981',
    padding: '0.625rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  }
};

export default ProfilePage;
