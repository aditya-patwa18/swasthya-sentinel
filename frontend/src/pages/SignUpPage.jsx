import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, User, Mail, Lock, Phone, MapPin, Building2 } from 'lucide-react';

const SignUpPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'doctor',
    facility: '',
    department: '',
    city: '',
    state: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchFacilities();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
      facility: role === 'authority' ? '' : formData.facility,
      department: role === 'authority' ? '' : formData.department
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    if (formData.role === 'doctor' && !formData.facility) {
      return setError('Please select a healthcare facility');
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>Join Swasthya Sentinel Network</h2>
          <p>Register as a Clinician or Health Surveillance Authority</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <span>{success}</span>
          </div>
        )}

        {/* Role Toggle Selector */}
        <div style={styles.roleToggle}>
          <button
            type="button"
            onClick={() => handleRoleChange('doctor')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: formData.role === 'doctor' ? '#1b4d3e' : 'transparent',
              color: formData.role === 'doctor' ? '#ffffff' : '#4a665e',
              border: formData.role === 'doctor' ? '1px solid #1b4d3e' : 'none'
            }}
          >
            Doctor / Clinician
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('authority')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: formData.role === 'authority' ? '#1b4d3e' : 'transparent',
              color: formData.role === 'authority' ? '#ffffff' : '#4a665e',
              border: formData.role === 'authority' ? '1px solid #1b4d3e' : 'none'
            }}
          >
            Health Authority
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Full Name</label>
              <div style={styles.inputContainer}>
                <User size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Rajesh Varma"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email Address</label>
              <div style={styles.inputContainer}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rajesh.varma@facility.org"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Password</label>
              <div style={styles.inputContainer}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Confirm Password</label>
              <div style={styles.inputContainer}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone Number</label>
              <div style={styles.inputContainer}>
                <Phone size={16} style={styles.inputIcon} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 99999 88888"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">City</label>
              <div style={styles.inputContainer}>
                <MapPin size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <div style={styles.inputContainer}>
              <MapPin size={16} style={styles.inputIcon} />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                className="form-control"
                style={{ paddingLeft: '2.5rem', borderColor: '#d1dfd6' }}
                required
              />
            </div>
          </div>

          {formData.role === 'doctor' && (
            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Assigned Facility</label>
                <div style={styles.inputContainer}>
                  <Building2 size={16} style={styles.inputIcon} />
                  <select
                    name="facility"
                    value={formData.facility}
                    onChange={handleChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', appearance: 'none', height: '42px', borderColor: '#d1dfd6' }}
                    required
                  >
                    <option value="">Select Facility...</option>
                    {facilities.map((fac) => (
                      <option key={fac._id} value={fac._id}>
                        {fac.name} ({fac.city}, {fac.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ flex: 0.8 }}>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="General Medicine"
                  className="form-control"
                  style={{ borderColor: '#d1dfd6' }}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px', backgroundColor: '#1b4d3e' }} disabled={loading}>
            {loading ? 'Submitting Registration...' : 'Complete Registration'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: '#0f766e', fontWeight: '700' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#edf3ef',
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem'
  },
  card: {
    width: '100%',
    maxWidth: '580px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    h2: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#1b332a',
      marginBottom: '0.25rem'
    },
    p: {
      fontSize: '0.85rem',
      color: '#4a665e'
    }
  },
  roleToggle: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderRadius: '8px',
    overflow: 'hidden',
    padding: '3px',
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6'
  },
  toggleBtn: {
    flex: 1,
    border: 'none',
    padding: '0.55rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#dc2626',
    padding: '0.75rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  },
  successAlert: {
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    color: '#065f46',
    padding: '0.75rem',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#789088',
    zIndex: 2
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#4a665e'
  }
};

export default SignUpPage;
