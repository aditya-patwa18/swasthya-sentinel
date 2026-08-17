import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight, ShieldAlert, CheckCircle, Info, Landmark, HelpCircle, User } from 'lucide-react';

const GeographicClusters = () => {
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState(78);
  const [hospitalChecked, setHospitalChecked] = useState(true);
  const [clinicChecked, setClinicChecked] = useState(false);

  const handleCreateInvestigation = () => {
    alert("Outbreak investigation folder created. Dispatched to local surveillance officers.");
    navigate('/surveillance/alerts');
  };

  return (
    <div style={styles.container}>
      {/* Breadcrumbs */}
      <div style={styles.breadcrumbs}>
        <span>Surveillance</span>
        <span style={styles.bcSeparator}>&gt;</span>
        <span>Geographic Clusters</span>
        <span style={styles.bcSeparator}>&gt;</span>
        <span style={styles.bcActive}>Mumbai Respiratory Signal</span>
      </div>

      {/* Header and badges */}
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>
          Respiratory Illness Cluster Mumbai Metropolitan Region
        </h1>
        <div style={styles.badgeRow}>
          <span style={styles.priorityBadge}>HIGH PRIORITY</span>
          <span style={styles.metaBadge}>Detected: 16 Aug 2026, 14:32</span>
          <span style={styles.metaBadge}>Confidence: 87%</span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Map overlay & Signal Core */}
        <div className="glass-card" style={styles.mapCard}>
          {/* Stylized vector map canvas */}
          <div style={styles.mapCanvas}>
            <svg viewBox="0 0 400 300" style={styles.svgMap}>
              {/* Maharashtra outline path silhouette */}
              <path
                d="M 120 70 L 160 50 L 210 60 L 250 80 L 280 110 L 290 150 L 270 180 L 250 220 L 220 250 L 190 270 L 160 250 L 140 220 L 130 180 L 110 140 L 90 100 Z"
                fill="#e2ede5"
                stroke="#cbdad1"
                strokeWidth="2"
              />
              {/* Mumbai coordinates circles */}
              <circle cx="150" cy="140" r="15" fill="rgba(220,38,38,0.2)" />
              <circle cx="150" cy="140" r="6" fill="#dc2626" />
              <circle cx="170" cy="160" r="8" fill="rgba(234,179,8,0.2)" />
              <circle cx="170" cy="160" r="4" fill="#eab308" />
            </svg>

            {/* Floating Signal Core overlay */}
            <div style={styles.signalCoreCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Map size={16} color="#1b4d3e" />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1b332a' }}>Signal Core</h4>
              </div>
              
              <p style={styles.signalCoreText}>
                Potential cluster detected across central wards. Not a confirmed outbreak. Requires field verification.
              </p>

              {/* Intensity Slider bar */}
              <div style={styles.intensityRow}>
                <span style={styles.intensityLbl}>Intensity</span>
                <div style={styles.sliderContainer}>
                  <div style={{ ...styles.sliderFill, width: `${intensity}%` }} />
                </div>
              </div>

              {/* Facility Class Filter Checks */}
              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={hospitalChecked}
                    onChange={(e) => setHospitalChecked(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Hospital</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={clinicChecked}
                    onChange={(e) => setClinicChecked(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Clinic</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cluster summary panels */}
        <div className="glass-card" style={styles.summaryCard}>
          <h3 style={styles.summaryHeading}>Cluster Summary</h3>
          
          <div style={styles.summaryGrid}>
            <div style={styles.summaryBox}>
              <span style={styles.summaryBoxVal}>18</span>
              <span style={styles.summaryBoxLbl}>Facilities</span>
            </div>

            <div style={{ ...styles.summaryBox, backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
              <span style={{ ...styles.summaryBoxVal, color: '#dc2626' }}>↑ +38%</span>
              <span style={styles.summaryBoxLbl}>Reporting Increase</span>
            </div>

            <div style={styles.summaryBox}>
              <span style={styles.summaryBoxVal}>3</span>
              <span style={styles.summaryBoxLbl}>Affected Districts</span>
            </div>

            <div style={styles.summaryBox}>
              <span style={styles.summaryBoxVal}>6 days</span>
              <span style={styles.summaryBoxLbl}>Signal Duration</span>
            </div>
          </div>

          <div style={styles.expectedCurrentRow}>
            <span>Expected: <strong>124/wk</strong></span>
            <span style={{ color: '#dc2626' }}>Current: <strong>171/wk</strong></span>
          </div>
        </div>
      </div>

      {/* Recommendations & Action Footer row */}
      <div className="glass-card" style={styles.recommendationsCard}>
        <div style={styles.recommendationLeft}>
          <Info size={20} color="#1b4d3e" style={{ flexShrink: 0 }} />
          <p style={styles.recommendationText}>
            <strong>Recommended:</strong> Review recent clinical trends across top contributing facilities to rule out artifact.
          </p>
        </div>

        <div style={styles.actionsRow}>
          <button onClick={() => alert("Summary details exported.")} className="btn btn-secondary" style={styles.footerBtn}>
            Export Summary
          </button>
          <button onClick={() => navigate('/surveillance')} className="btn btn-secondary" style={styles.footerBtn}>
            Compare Regions
          </button>
          <button onClick={() => navigate('/surveillance/trends')} className="btn btn-secondary" style={styles.footerBtn}>
            View Disease Trend
          </button>
          <button onClick={handleCreateInvestigation} className="btn btn-primary" style={{ ...styles.footerBtn, backgroundColor: '#0f766e' }}>
            Create Investigation
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#4a665e',
    fontWeight: '500',
    marginBottom: '0.75rem'
  },
  bcSeparator: {
    color: '#cbdad1'
  },
  bcActive: {
    color: '#1b332a',
    fontWeight: '700'
  },
  header: {
    marginBottom: '1.5rem'
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    alignItems: 'center'
  },
  priorityBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  metaBadge: {
    fontSize: '0.75rem',
    color: '#4a665e',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '500'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1.5rem',
    alignItems: 'stretch',
    marginBottom: '1.5rem',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr'
    }
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden'
  },
  mapCanvas: {
    height: '350px',
    backgroundColor: '#ffffff',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  svgMap: {
    height: '90%',
    opacity: 0.8
  },
  signalCoreCard: {
    position: 'absolute',
    left: '1rem',
    top: '1rem',
    width: '240px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    padding: '0.875rem',
    boxShadow: 'var(--shadow-md)'
  },
  signalCoreText: {
    fontSize: '0.75rem',
    color: '#4a665e',
    margin: '0.25rem 0 0.75rem 0',
    lineHeight: '1.4'
  },
  intensityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem'
  },
  intensityLbl: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4a665e'
  },
  sliderContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#edf3ef',
    borderRadius: '3px',
    marginLeft: '0.5rem',
    overflow: 'hidden',
    position: 'relative'
  },
  sliderFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981 0%, #ea580c 100%)'
  },
  checkboxRow: {
    display: 'flex',
    gap: '1rem'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1b332a',
    cursor: 'pointer'
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer'
  },
  summaryCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  summaryHeading: {
    fontSize: '1rem',
    color: '#789088',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    fontWeight: '700'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  summaryBox: {
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    borderRadius: '6px',
    padding: '1rem 0.75rem',
    textAlign: 'center'
  },
  summaryBoxVal: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1b332a'
  },
  summaryBoxLbl: {
    fontSize: '0.7rem',
    color: '#4a665e',
    marginTop: '0.15rem'
  },
  expectedCurrentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    borderTop: '1px solid #edf3ef',
    paddingTop: '1rem',
    marginTop: '1.5rem'
  },
  recommendationsCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f8f5',
    borderColor: '#d1dfd6',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem 1.5rem'
  },
  recommendationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: '280px'
  },
  recommendationText: {
    fontSize: '0.85rem',
    color: '#1b4d3e',
    margin: 0
  },
  actionsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  footerBtn: {
    padding: '0.45rem 0.875rem',
    fontSize: '0.8rem'
  }
};

export default GeographicClusters;
