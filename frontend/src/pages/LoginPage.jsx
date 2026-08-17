import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goToRoleHome = (role) => {
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'authority') navigate('/surveillance');
    else if (role === 'admin') navigate('/admin');
    else navigate('/doctor');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      goToRoleHome(result.role);
    } else {
      setError(result.error || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoLogin = (demoRole) => {
    setError('');
    setLoading(true);

    let demoEmail = '';
    if (demoRole === 'doctor') demoEmail = 'doctor@epiwatch.org';
    else if (demoRole === 'authority') demoEmail = 'authority@epiwatch.gov.in';
    else if (demoRole === 'admin') demoEmail = 'admin@epiwatch.gov.in';

    setEmail(demoEmail);
    setPassword('password123');

    // Instant offline demo entry (MongoDB not required)
    const result = demoLogin(demoRole);
    setLoading(false);

    if (result.success) {
      goToRoleHome(result.role);
    } else {
      setError(result.error || 'Demo login failed.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoDot} />
          <h2>Swasthya Sentinel Login</h2>
          <p>Access the surveillance and clinical workflow portal</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@epiwatch.org"
                className="form-control"
                style={{ paddingLeft: '2.5rem', height: '42px', borderColor: '#d1dfd6' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact system administration at admin@epiwatch.gov.in to reset credentials."); }} style={styles.forgotBtn}>Forgot password?</a>
            </div>
            <div style={styles.inputContainer}>
              <KeyRound size={16} style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '2.5rem', height: '42px', borderColor: '#d1dfd6' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '42px', backgroundColor: '#1b4d3e' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <Link to="/signup" style={{ color: '#0f766e', fontWeight: '700' }}>Register Facility/Doctor</Link>
        </div>

        {/* Demo Fast Login Selector */}
        <div style={styles.demoSection}>
          <div style={styles.demoTitle}>
            <Sparkles size={14} color="#0f766e" />
            <span>DEMO ACCOUNTS (HACKATHON EVALUATOR)</span>
          </div>
          <div style={styles.demoButtons}>
            <button onClick={() => handleDemoLogin('doctor')} style={styles.demoBtn}>
              Dr. Ananya (Doctor)
            </button>
            <button onClick={() => handleDemoLogin('authority')} style={styles.demoBtn}>
              Surveillance Officer
            </button>
            <button onClick={() => handleDemoLogin('admin')} style={styles.demoBtn}>
              Platform Admin
            </button>
          </div>
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
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
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
  logoDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
    margin: '0 auto 1rem auto'
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
  form: {
    display: 'flex',
    flexDirection: 'column'
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
  forgotBtn: {
    fontSize: '0.8rem',
    color: '#0f766e',
    fontWeight: '600'
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#4a665e'
  },
  demoSection: {
    marginTop: '2rem',
    borderTop: '1px solid #edf3ef',
    paddingTop: '1.25rem'
  },
  demoTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#0f766e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    letterSpacing: '0.05em'
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  demoBtn: {
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    color: '#1b332a',
    padding: '0.55rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e6efe8',
      borderColor: '#0f766e'
    }
  }
};

export default LoginPage;
