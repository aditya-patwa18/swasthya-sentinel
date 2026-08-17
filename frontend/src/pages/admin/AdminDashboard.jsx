import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, Building, FileSpreadsheet, ShieldAlert, Sparkles, UserCheck, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboard = ({ tab: initialTab }) => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'metrics');
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalFacilities: 0,
    totalReports: 0,
    totalAlerts: 0,
    usersByRole: {},
    facilitiesByType: {}
  });

  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
  // Create Facility State
  const [newFac, setNewFac] = useState({
    name: '',
    type: 'Clinic',
    city: '',
    district: '',
    state: '',
    latitude: '',
    longitude: ''
  });
  const [facError, setFacError] = useState('');
  const [facSuccess, setFacSuccess] = useState('');
  
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/admin/metrics', { headers });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchUsers(), fetchFacilities()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !currentActive })
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to toggle user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleFacChange = (e) => {
    setNewFac({ ...newFac, [e.target.name]: e.target.value });
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFacError('');
    setFacSuccess('');

    // Coordinate validation
    const lat = parseFloat(newFac.latitude);
    const lng = parseFloat(newFac.longitude);
    if (isNaN(lat) || lat < 6 || lat > 38) {
      return setFacError('Please enter a valid India latitude (between 6.0 and 38.0)');
    }
    if (isNaN(lng) || lng < 68 || lng > 98) {
      return setFacError('Please enter a valid India longitude (between 68.0 and 98.0)');
    }

    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newFac,
          latitude: lat,
          longitude: lng
        })
      });
      const data = await response.json();

      if (data.success) {
        setFacSuccess('Healthcare facility registered successfully.');
        setNewFac({ name: '', type: 'Clinic', city: '', district: '', state: '', latitude: '', longitude: '' });
        await Promise.all([fetchMetrics(), fetchFacilities()]);
      } else {
        setFacError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setFacError('Network error during facility registration.');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>Platform Administration</h1>
        <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Overview system health, configure node thresholds, and authorize healthcare professionals
        </p>
      </header>

      {/* Admin KPIs */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><Users size={20} color="#2563eb" /></div>
          <div style={styles.kpiVal}>{metrics.totalUsers}</div>
          <div style={styles.kpiTitle}>Total Accounts</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><Building size={20} color="#0f766e" /></div>
          <div style={styles.kpiVal}>{metrics.totalFacilities}</div>
          <div style={styles.kpiTitle}>Total Facilities</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><FileSpreadsheet size={20} color="#1b5e20" /></div>
          <div style={styles.kpiVal}>{metrics.totalReports}</div>
          <div style={styles.kpiTitle}>Reports Logged</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><ShieldAlert size={20} color="#dc2626" /></div>
          <div style={styles.kpiVal}>{metrics.totalAlerts}</div>
          <div style={styles.kpiTitle}>Surveillance Alerts</div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'metrics' ? '#1b4d3e' : '#ffffff',
            color: activeTab === 'metrics' ? '#ffffff' : '#4a665e',
            border: '1px solid ' + (activeTab === 'metrics' ? '#1b4d3e' : '#d1dfd6')
          }}
        >
          <Sparkles size={16} />
          <span>System Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'users' ? '#1b4d3e' : '#ffffff',
            color: activeTab === 'users' ? '#ffffff' : '#4a665e',
            border: '1px solid ' + (activeTab === 'users' ? '#1b4d3e' : '#d1dfd6')
          }}
        >
          <UserCheck size={16} />
          <span>Account Verifications</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'facilities' ? '#1b4d3e' : '#ffffff',
            color: activeTab === 'facilities' ? '#ffffff' : '#4a665e',
            border: '1px solid ' + (activeTab === 'facilities' ? '#1b4d3e' : '#d1dfd6')
          }}
        >
          <Building size={16} />
          <span>Register Facility</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4a665e' }}>Querying system logs...</div>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div style={styles.twoCol}>
              <div className="glass-card" style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>Account Density by Role</h3>
                <div style={styles.breakdownList}>
                  {Object.entries(metrics.usersByRole).map(([role, count]) => (
                    <div key={role} style={styles.breakdownRow}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#1b332a' }}>{role}</span>
                      <strong style={{ color: '#0f766e' }}>{count} users</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>Facilities Density by Classification</h3>
                <div style={styles.breakdownList}>
                  {Object.entries(metrics.facilitiesByType).map(([type, count]) => (
                    <div key={type} style={styles.breakdownRow}>
                      <span style={{ fontWeight: '600', color: '#1b332a' }}>{type}</span>
                      <strong style={{ color: '#0f766e' }}>{count} nodes</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="glass-card">
              <h3 style={{ ...styles.cardTitle, marginBottom: '1rem' }}>User Verification Panel</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Facility Node</th>
                      <th>Region</th>
                      <th>Access State</th>
                      <th>Verify Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: '600', color: '#1b332a' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                        <td>{u.facility ? u.facility.name : 'Surveillance Center'}</td>
                        <td>{u.city}, {u.state}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: u.isActive ? '#d1fae5' : '#fee2e2',
                            color: u.isActive ? '#065f46' : '#991b1b',
                            border: '1px solid ' + (u.isActive ? '#a7f3d0' : '#fca5a5')
                          }}>
                            {u.isActive ? 'Authorized' : 'Deactivated'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              color: u.isActive ? '#dc2626' : '#10b981',
                              borderColor: u.isActive ? '#fca5a5' : '#a7f3d0'
                            }}
                          >
                            {u.isActive ? 'Deauthorize' : 'Approve Access'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER FACILITY */}
          {activeTab === 'facilities' && (
            <div style={styles.twoCol}>
              {/* Form */}
              <div className="glass-card" style={{ flex: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <PlusCircle color="#0f766e" />
                  <h3 style={{ margin: 0, color: '#1b332a' }}>Register Healthcare Facility Node</h3>
                </div>

                {facError && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={16} />
                    <span>{facError}</span>
                  </div>
                )}

                {facSuccess && (
                  <div style={styles.successAlert}>
                    <CheckCircle size={16} />
                    <span>{facSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateFacility}>
                  <div className="form-group">
                    <label className="form-label">Facility Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newFac.name}
                      onChange={handleFacChange}
                      placeholder="e.g. Apollo General Hospital"
                      className="form-control"
                      style={{ borderColor: '#d1dfd6' }}
                      required
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Facility Classification</label>
                      <select
                        name="type"
                        value={newFac.type}
                        onChange={handleFacChange}
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                      >
                        <option value="Hospital">Hospital</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Dispensary">Dispensary</option>
                        <option value="Laboratory">Laboratory</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={newFac.city}
                        onChange={handleFacChange}
                        placeholder="Mumbai"
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">District</label>
                      <input
                        type="text"
                        name="district"
                        value={newFac.district}
                        onChange={handleFacChange}
                        placeholder="Mumbai City"
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={newFac.state}
                        onChange={handleFacChange}
                        placeholder="Maharashtra"
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Latitude Coordinates</label>
                      <input
                        type="text"
                        name="latitude"
                        value={newFac.latitude}
                        onChange={handleFacChange}
                        placeholder="e.g. 19.0760"
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Longitude Coordinates</label>
                      <input
                        type="text"
                        name="longitude"
                        value={newFac.longitude}
                        onChange={handleFacChange}
                        placeholder="e.g. 72.8777"
                        className="form-control"
                        style={{ borderColor: '#d1dfd6' }}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#1b4d3e' }}>
                    Register Node
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="glass-card" style={{ flex: 0.8, maxHeight: '430px', overflowY: 'auto' }}>
                <h3 style={{ ...styles.cardTitle, marginBottom: '0.75rem' }}>Registered Nodes</h3>
                <div style={styles.facList}>
                  {facilities.map((f) => (
                    <div key={f._id} style={styles.facItem}>
                      <span style={{ fontWeight: '600', color: '#1b332a', fontSize: '0.85rem' }}>{f.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#4a665e' }}>{f.type} • {f.city}, {f.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#1b332a'
  },
  header: {
    marginBottom: '1.5rem'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  kpiCard: {
    padding: '1.25rem 1rem',
    position: 'relative'
  },
  kpiIcon: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem'
  },
  kpiVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1b332a',
    lineHeight: 1
  },
  kpiTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4a665e',
    marginTop: '0.35rem'
  },
  tabsRow: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    padding: '0.35rem',
    borderRadius: '8px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  twoCol: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },
  cardTitle: {
    fontSize: '1rem',
    color: '#4a665e',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1.25rem',
    fontWeight: '700'
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#f4f8f5',
    borderRadius: '6px',
    border: '1px solid #d1dfd6',
    fontSize: '0.9rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#dc2626',
    padding: '0.625rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  successAlert: {
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    color: '#065f46',
    padding: '0.625rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  facList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  facItem: {
    padding: '0.625rem',
    borderBottom: '1px solid #edf3ef',
    display: 'flex',
    flexDirection: 'column'
  }
};

export default AdminDashboard;
