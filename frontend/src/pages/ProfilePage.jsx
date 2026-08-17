import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Lock, AlertCircle, CheckCircle, Pencil, Download,
  Eye, Shield, CircleDot, Building2, Bell, Database, ScrollText
} from 'lucide-react';

const roleLabel = (role) => {
  switch (role) {
    case 'doctor': return 'Clinician';
    case 'lab': return 'Lab Technician';
    case 'authority': return 'Chief Epidemiologist';
    case 'admin': return 'System Administrator';
    default: return role;
  }
};

const orgLabel = (user) => {
  if ((user.role === 'doctor' || user.role === 'lab') && user.facility?.name) return user.facility.name;
  if (user.role === 'authority') return 'National Health Authority';
  if (user.role === 'admin') return 'Swasthya Sentinel Ops';
  return 'Swasthya Sentinel Network';
};

const professionalId = (user) => {
  const seed = (user._id || user.email || 'MED00000').toString().slice(-5).toUpperCase();
  const prefix = user.role === 'doctor' ? 'MED' : user.role === 'lab' ? 'LAB' : user.role === 'admin' ? 'ADM' : 'SRV';
  return `${prefix}-${seed}`;
};

const accessMatrixForRole = (role) => {
  if (role === 'admin') {
    return [
      { module: 'Patient Records', level: 'Full Access', tone: 'clinical' },
      { module: 'Facility Analytics', level: 'Full Access', tone: 'clinical' },
      { module: 'National Surveillance', level: 'Full Access', tone: 'clinical' },
      { module: 'Alert Management', level: 'Full Access', tone: 'clinical' },
      { module: 'AMR Analytics', level: 'Full Access', tone: 'clinical' }
    ];
  }
  if (role === 'authority') {
    return [
      { module: 'Patient Records', level: 'View Only', tone: 'view' },
      { module: 'Facility Analytics', level: 'Clinical Access', tone: 'clinical' },
      { module: 'National Surveillance', level: 'Clinical Access', tone: 'clinical' },
      { module: 'Alert Management', level: 'Clinical Access', tone: 'clinical' },
      { module: 'AMR Analytics', level: 'Restricted', tone: 'restricted' }
    ];
  }
  if (role === 'lab') {
    return [
      { module: 'Patient Records', level: 'Restricted', tone: 'restricted' },
      { module: 'Facility Analytics', level: 'Restricted', tone: 'restricted' },
      { module: 'National Surveillance', level: 'Restricted', tone: 'restricted' },
      { module: 'Alert Management', level: 'Restricted', tone: 'restricted' },
      { module: 'AMR Analytics', level: 'Clinical Access', tone: 'clinical' }
    ];
  }
  return [
    { module: 'Patient Records', level: 'Clinical Access', tone: 'clinical' },
    { module: 'Facility Analytics', level: 'View Only', tone: 'view' },
    { module: 'National Surveillance', level: 'Restricted', tone: 'restricted' },
    { module: 'Alert Management', level: 'Restricted', tone: 'restricted' },
    { module: 'AMR Analytics', level: 'View Only', tone: 'view' }
  ];
};

const AccessBadge = ({ level, tone }) => {
  const palette = {
    clinical: { bg: '#dbeafe', color: '#1d4ed8', icon: <CircleDot size={12} /> },
    view: { bg: '#f3f4f6', color: '#4b5563', icon: <Eye size={12} /> },
    restricted: { bg: '#fef9c3', color: '#a16207', icon: <Shield size={12} /> }
  }[tone] || { bg: '#f3f4f6', color: '#4b5563', icon: <Eye size={12} /> };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: palette.bg,
      color: palette.color,
      borderRadius: 999,
      padding: '0.25rem 0.7rem',
      fontSize: '0.75rem',
      fontWeight: 700
    }}>
      {palette.icon}
      {level}
    </span>
  );
};

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const matrix = useMemo(() => accessMatrixForRole(user?.role), [user?.role]);
  const idCode = useMemo(() => (user ? professionalId(user) : ''), [user]);

  if (!user) return null;

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

  const menuItems = [
    { id: 'profile', label: 'Profile & Identity', icon: <User size={15} /> },
    { id: 'organization', label: 'Organization', icon: <Building2 size={15} /> },
    { id: 'security', label: 'Security & Auth', icon: <Lock size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'access', label: 'Data Access Matrix', icon: <Database size={15} /> },
    { id: 'audit', label: 'Audit Log', icon: <ScrollText size={15} /> }
  ];

  const initials = (user.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <h1 style={styles.title}>Account & Access Controls</h1>
        <p style={styles.subtitle}>
          Manage your clinical profile, system permissions, and security settings.
        </p>
      </header>

      <div style={styles.layout} className="profile-responsive-layout">
        <aside style={styles.settingsMenu}>
          <div style={styles.settingsMenuTitle}>Settings Menu</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              style={{
                ...styles.menuItem,
                backgroundColor: activeSection === item.id ? '#f3f4f6' : 'transparent',
                color: activeSection === item.id ? '#111827' : '#4b5563',
                fontWeight: activeSection === item.id ? 700 : 500
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        <div style={styles.content}>
          {(activeSection === 'profile' || activeSection === 'organization') && (
            <section className="glass-card" style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>
                  <User size={16} color="#0f766e" />
                </div>
                <h2 style={styles.sectionTitle}>Clinical Profile</h2>
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

              <div style={styles.profileGrid} className="profile-responsive-layout">
                <div style={styles.identityCard}>
                  <div style={styles.avatarWrap}>
                    <div style={styles.avatar}>{initials}</div>
                    <span style={styles.editBadge} title="Edit photo">
                      <Pencil size={12} />
                    </span>
                  </div>
                  <h3 style={styles.identityName}>{user.name}</h3>
                  <p style={styles.identityRole}>{roleLabel(user.role)}</p>
                  <span style={styles.idChip}>{idCode}</span>
                </div>

                <form onSubmit={handleProfileSubmit} style={styles.formCard}>
                  <div style={styles.formGrid}>
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
                      <label className="form-label">Primary Role</label>
                      <input
                        type="text"
                        value={roleLabel(user.role)}
                        className="form-control"
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization / Affiliation</label>
                      <input
                        type="text"
                        value={orgLabel(user)}
                        className="form-control"
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Professional ID</label>
                      <input
                        type="text"
                        value={idCode}
                        className="form-control"
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="form-control"
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Secure Phone</label>
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
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileChange}
                          className="form-control"
                        />
                      </div>
                    )}

                    <div className="form-group">
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

                    <div className="form-group">
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

                  <div style={styles.formActions}>
                    <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={profileLoading}>
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section className="glass-card" style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>
                  <Lock size={16} color="#0f766e" />
                </div>
                <h2 style={styles.sectionTitle}>Security & Auth</h2>
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

              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 480 }}>
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
                <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>
          )}

          {(activeSection === 'access' || activeSection === 'notifications' || activeSection === 'audit') && (
            <section className="glass-card" style={styles.sectionCard}>
              <div style={styles.matrixHeader}>
                <div>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionIcon}>
                      <Shield size={16} color="#0f766e" />
                    </div>
                    <h2 style={styles.sectionTitle}>Data Access Matrix</h2>
                  </div>
                  <p style={styles.matrixDesc}>
                    Current authorization levels across clinical and surveillance modules.
                  </p>
                </div>
                <button type="button" className="btn btn-secondary" style={styles.exportBtn} onClick={() => alert('Access policy exported.')}>
                  <Download size={14} />
                  Export Policy
                </button>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Module / Domain</th>
                      <th style={styles.th}>Current Access Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row) => (
                      <tr key={row.module}>
                        <td style={styles.td}>{row.module}</td>
                        <td style={styles.td}>
                          <AccessBadge level={row.level} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={styles.footerNote}>
                Contact your System Administrator to request elevated access levels.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto'
  },
  pageHeader: {
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#111827',
    margin: 0
  },
  subtitle: {
    marginTop: '0.35rem',
    color: '#6b7280',
    fontSize: '0.95rem'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '1.25rem',
    alignItems: 'start'
  },
  settingsMenu: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '0.75rem',
    boxShadow: 'var(--shadow-sm)'
  },
  settingsMenuTitle: {
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#9ca3af',
    padding: '0.5rem 0.65rem 0.75rem'
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    padding: '0.65rem 0.75rem',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginBottom: 2
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  sectionCard: {
    padding: '1.5rem'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.35rem'
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.05rem',
    color: '#111827'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '1.25rem',
    marginTop: '1.25rem'
  },
  identityCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.5rem 1rem',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  },
  avatarWrap: {
    position: 'relative',
    width: 96,
    height: 96,
    margin: '0 auto 1rem'
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #0f766e, #134e4a)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: 800
  },
  editBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f766e',
    boxShadow: 'var(--shadow-sm)'
  },
  identityName: {
    margin: 0,
    fontSize: '1.05rem',
    color: '#111827'
  },
  identityRole: {
    margin: '0.25rem 0 0.75rem',
    color: '#0f766e',
    fontWeight: 600,
    fontSize: '0.85rem'
  },
  idChip: {
    display: 'inline-block',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: 6,
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  formCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.25rem',
    backgroundColor: '#ffffff'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.35rem 1rem'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  saveBtn: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
    minWidth: 140
  },
  matrixHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  matrixDesc: {
    color: '#6b7280',
    fontSize: '0.85rem',
    margin: '0.35rem 0 0 2.15rem'
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.8rem'
  },
  tableWrap: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '0.85rem 1rem',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '0.95rem 1rem',
    borderBottom: '1px solid #f3f4f6',
    color: '#111827',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  footerNote: {
    marginTop: '0.85rem',
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 6,
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
    borderRadius: 6,
    color: '#059669',
    padding: '0.625rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  }
};

export default ProfilePage;
