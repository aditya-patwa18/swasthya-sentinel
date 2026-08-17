import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, PlusCircle, ArrowRight, Pill } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Shield size={14} color="#0f766e" />
            <span>Secure Clinical Surveillance Network</span>
          </div>
          
          <h1 style={styles.headline}>
            Turning Clinical Signals <br />
            <span style={{ color: '#0f766e' }}>Into Early Warnings</span>
          </h1>
          
          <p style={styles.supportingText}>
            Swasthya Sentinel connects hospitals, clinics, and dispensaries to transform de-identified clinical signals into early-warning intelligence for emerging diseases and antimicrobial resistance.
          </p>

          <div style={styles.ctaContainer}>
            <button 
              onClick={() => navigate('/login', { state: { defaultRole: 'doctor' } })} 
              style={styles.btnDoctor}
            >
              <PlusCircle size={18} />
              <span>Doctor / Facility Portal</span>
            </button>
            
            <button 
              onClick={() => navigate('/login', { state: { defaultRole: 'authority' } })} 
              style={styles.btnAuthority}
            >
              <Activity size={18} />
              <span>Health Authority Login</span>
            </button>
          </div>

          <div style={styles.privacyStatement}>
            Privacy-preserving • Network-based • Data-driven • Early-warning focused
          </div>
        </div>

        {/* Dataflow Visualization Diagram */}
        <div style={styles.visualFlow}>
          <div style={styles.glassCard}>
            <h3 style={{ fontSize: '1rem', color: '#0f766e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '700' }}>
              Surveillance Intelligence Dataflow
            </h3>
            
            <div style={styles.flowRow}>
              <div style={styles.flowNode}>
                <div style={styles.nodeIcon}><PlusCircle size={20} /></div>
                <span style={styles.nodeText}>Hospitals & Clinics</span>
              </div>
              <ArrowRight size={18} color="#789088" />
              
              <div style={styles.flowNode}>
                <div style={styles.nodeIcon}><Activity size={20} /></div>
                <span style={styles.nodeText}>Clinical Signals</span>
              </div>
              <ArrowRight size={18} color="#789088" />
              
              <div style={styles.flowNode}>
                <div style={{ ...styles.nodeIcon, backgroundColor: '#0f766e', color: '#ffffff' }}>
                  <Shield size={20} />
                </div>
                <span style={styles.nodeText}>Swasthya Sentinel Engine</span>
              </div>
              <ArrowRight size={18} color="#789088" />
              
              <div style={styles.flowNode}>
                <div style={{ ...styles.nodeIcon, backgroundColor: '#dc2626', color: '#ffffff' }}>
                  <Shield size={20} />
                </div>
                <span style={styles.nodeText}>Early Alerts</span>
              </div>
            </div>
            
            <p style={styles.flowLegend}>
              Individual diagnostic records remain locked at the facility. Aggregate de-identified trends are analyzed in real-time to detect cluster spikes across regions.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Core features */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionHeading}>Platform Features</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><PlusCircle size={24} color="#2563eb" /></div>
            <h3>Routine Clinical Entry</h3>
            <p>Doctors record rapid de-identified symptoms, caseload groups, and lab observations in a quick 5-step workflow.</p>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Activity size={24} color="#0f766e" /></div>
            <h3>Multi-Facility Spikes</h3>
            <p>Calculates percentage elevations over historical baseline levels. Triggers warnings when multiple clinics cross thresholds.</p>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Pill size={24} color="#8b5cf6" /></div>
            <h3>AMR Signal Tracking</h3>
            <p>Aggregates pathogen cultures and resistance listings (like E. coli ciprofloxacin susceptibility) to guide stewardship policies.</p>
          </div>

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Shield size={24} color="#dc2626" /></div>
            <h3>Audit Investigations</h3>
            <p>Health officials track timelines, inspect contributing clinics, leave collaborative case notes, and mark alerts resolved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#edf3ef',
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1.5rem'
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '900px',
    marginTop: '2rem',
    gap: '2.5rem'
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-sm)'
  },
  headline: {
    fontSize: '3rem',
    lineHeight: '1.15',
    fontWeight: '800',
    color: '#1b332a',
    marginBottom: '1rem'
  },
  supportingText: {
    fontSize: '1.1rem',
    color: '#4a665e',
    lineHeight: '1.6',
    maxWidth: '650px',
    marginBottom: '2rem'
  },
  ctaContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  btnDoctor: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: '#1b4d3e',
    color: '#ffffff',
    border: 'none',
    padding: '0.875rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
    ':hover': {
      backgroundColor: '#12352b',
      transform: 'translateY(-0.5px)'
    }
  },
  btnAuthority: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: '#ffffff',
    color: '#0f766e',
    border: '1px solid #d1dfd6',
    padding: '0.875rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
    ':hover': {
      backgroundColor: '#f4f8f5',
      borderColor: '#0f766e',
      transform: 'translateY(-0.5px)'
    }
  },
  privacyStatement: {
    fontSize: '0.8rem',
    color: '#789088',
    fontWeight: '600'
  },
  visualFlow: {
    width: '100%',
    maxWidth: '750px'
  },
  glassCard: {
    background: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md)'
  },
  flowRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    margin: '1rem 0 1.5rem 0'
  },
  flowNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: '100px'
  },
  nodeIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#f4f8f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f766e',
    border: '1px solid #d1dfd6'
  },
  nodeText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1b332a'
  },
  flowLegend: {
    fontSize: '0.75rem',
    color: '#789088',
    lineHeight: '1.4',
    margin: 0,
    borderTop: '1px solid #edf3ef',
    paddingTop: '1rem'
  },
  featuresSection: {
    width: '100%',
    maxWidth: '900px',
    marginTop: '4rem',
    borderTop: '1px solid #d1dfd6',
    paddingTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  sectionHeading: {
    fontSize: '1.75rem',
    color: '#1b332a',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
    width: '100%',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  featureItem: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    padding: '1.5rem',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
    ':hover': {
      borderColor: '#cbdcd0',
      transform: 'translateY(-0.5px)'
    },
    h3: {
      fontSize: '1.1rem',
      color: '#1b332a',
      marginBottom: '0.5rem'
    },
    p: {
      fontSize: '0.85rem',
      color: '#4a665e',
      lineHeight: '1.5',
      margin: 0
    }
  },
  featureIcon: {
    marginBottom: '1rem'
  }
};

export default LandingPage;
