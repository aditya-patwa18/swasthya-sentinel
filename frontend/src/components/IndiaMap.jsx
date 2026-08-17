import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';

const IndiaMap = ({ hotspots, onSelectState }) => {
  const [activeState, setActiveState] = useState(null);

  // Fallback states if database doesn't have aggregate cases yet
  const defaultStates = [
    { state: 'Maharashtra', city: 'Mumbai', caseCount: 57, riskLevel: 'Critical', activeAlertsCount: 1, lat: 19.75, lng: 75.71, top: '55%', left: '38%' },
    { state: 'Karnataka', city: 'Hubli', caseCount: 20, riskLevel: 'High', activeAlertsCount: 1, lat: 15.31, lng: 75.71, top: '72%', left: '42%' },
    { state: 'Delhi', city: 'New Delhi', caseCount: 9, riskLevel: 'Normal', activeAlertsCount: 0, lat: 28.70, lng: 77.10, top: '32%', left: '44%' },
    { state: 'Gujarat', city: 'Ahmedabad', caseCount: 5, riskLevel: 'Normal', activeAlertsCount: 0, lat: 22.25, lng: 71.19, top: '46%', left: '26%' },
    { state: 'Rajasthan', city: 'Jaipur', caseCount: 3, riskLevel: 'Normal', activeAlertsCount: 0, lat: 27.02, lng: 74.21, top: '38%', left: '32%' },
    { state: 'Kerala', city: 'Kochi', caseCount: 12, riskLevel: 'Normal', activeAlertsCount: 0, lat: 10.85, lng: 76.27, top: '84%', left: '45%' },
    { state: 'Tamil Nadu', city: 'Chennai', caseCount: 8, riskLevel: 'Normal', activeAlertsCount: 0, lat: 11.12, lng: 78.65, top: '80%', left: '52%' }
  ];

  // Merge database hotspots stats with defaults for placement position coordinates
  const mergedStates = defaultStates.map(def => {
    const dbMatch = hotspots.find(h => h.state.toLowerCase() === def.state.toLowerCase());
    if (dbMatch) {
      return {
        ...def,
        caseCount: dbMatch.caseCount,
        riskLevel: dbMatch.riskLevel,
        activeAlertsCount: dbMatch.activeAlertsCount,
        alerts: dbMatch.alerts || []
      };
    }
    return { ...def, alerts: [] };
  });

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return '#ef4444'; // red
      case 'High': return '#f97316';     // orange
      case 'Elevated': return '#eab308'; // yellow
      default: return '#10b981';         // green
    }
  };

  const handleStateClick = (stateObj) => {
    setActiveState(stateObj);
    if (onSelectState) {
      onSelectState(stateObj.state);
    }
  };

  return (
    <div style={styles.container}>
      {/* Schematic Map Canvas */}
      <div style={styles.mapCanvas}>
        {/* Simplified outline vector illustration */}
        <svg viewBox="0 0 400 500" style={styles.svgMap}>
          {/* Central Border Outline path for India Map Silhouette */}
          <path
            d="M175 40 L195 50 L205 70 L210 90 L230 115 L245 130 L270 140 L285 130 L290 145 L275 160 L285 180 L270 205 L260 215 L255 240 L270 260 L290 280 L310 285 L320 300 L290 320 L275 325 L255 330 L245 350 L240 375 L230 400 L210 425 L198 460 L188 475 L180 482 L178 450 L174 425 L182 400 L180 370 L170 350 L165 325 L160 295 L145 285 L135 295 L120 310 L115 280 L118 260 L108 245 L95 242 L72 245 L76 220 L84 200 L95 190 L115 170 L120 150 L135 135 L145 105 L152 75 Z"
            fill="#172a5a"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="2"
          />
        </svg>

        {/* Dynamic Coordinate Circle Markers */}
        {mergedStates.map((st) => (
          <button
            key={st.state}
            onClick={() => handleStateClick(st)}
            style={{
              ...styles.marker,
              top: st.top,
              left: st.left,
              backgroundColor: getRiskColor(st.riskLevel),
              boxShadow: `0 0 12px ${getRiskColor(st.riskLevel)}`,
            }}
          >
            <span style={styles.markerRipple} />
            {st.activeAlertsCount > 0 && (
              <span style={styles.alertIndicator}>!</span>
            )}
          </button>
        ))}
      </div>

      {/* Side Details Overlay */}
      <div style={styles.detailsPanel}>
        {activeState ? (
          <div>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0 }}>{activeState.state}</h3>
              <span
                style={{
                  ...styles.statusText,
                  color: getRiskColor(activeState.riskLevel),
                  borderColor: getRiskColor(activeState.riskLevel) + '30',
                  backgroundColor: getRiskColor(activeState.riskLevel) + '10'
                }}
              >
                {activeState.riskLevel} Risk
              </span>
            </div>
            
            <div style={styles.statRow}>
              <div style={styles.statBox}>
                <div style={styles.statVal}>{activeState.caseCount}</div>
                <div style={styles.statLbl}>Recent Cases</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statVal}>{activeState.activeAlertsCount}</div>
                <div style={styles.statLbl}>Active Alerts</div>
              </div>
            </div>

            <div style={styles.alertSection}>
              <h4>Active Signals</h4>
              {activeState.activeAlertsCount === 0 ? (
                <div style={styles.emptyAlerts}>
                  <CheckCircle size={16} color="#10b981" />
                  <span style={{ color: '#94a3b8' }}>No emerging signals in region</span>
                </div>
              ) : (
                <div style={styles.alertList}>
                  <div style={{
                    ...styles.alertItem,
                    borderLeftColor: getRiskColor(activeState.riskLevel)
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <ShieldAlert size={16} color={getRiskColor(activeState.riskLevel)} />
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                        {activeState.state === 'Maharashtra' ? 'Influenza Outbreak' : 'E. coli Resistance'}
                      </span>
                    </div>
                    <p style={styles.alertText}>
                      {activeState.state === 'Maharashtra' 
                        ? 'Rapid clinical spike reported across 4 clinics in Mumbai Metropolitan.'
                        : '66% Ciprofloxacin resistance rate detected in urine culture isolates.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.facilitiesInfo}>
              <h4>Participating Clinics</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                {activeState.state === 'Maharashtra' && 'Sunrise Clinic, Bandra Dispensary, Mumbai General, Andheri Lab'}
                {activeState.state === 'Karnataka' && 'Hubli Health Clinic, Belagavi Dispensary, Karnataka Apex Lab'}
                {['Delhi', 'Gujarat', 'Rajasthan', 'Kerala', 'Tamil Nadu'].includes(activeState.state) && 'Reporting active surveillance data to national pipeline.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <TrendingUp size={36} color="#64748b" style={{ marginBottom: '1rem' }} />
            <h3>Select a Region</h3>
            <p>Click any hotspot marker on the India map to inspect regional caseloads, trends, and active outbreak signals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    height: '420px',
    alignItems: 'stretch'
  },
  mapCanvas: {
    flex: '1.2',
    position: 'relative',
    backgroundColor: '#101f42',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  svgMap: {
    height: '95%',
    width: 'auto',
    opacity: 0.85
  },
  marker: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    outline: 'none',
    ':hover': {
      transform: 'translate(-50%, -50%) scale(1.2)'
    }
  },
  markerRipple: {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    borderRadius: '50%',
    border: '1px solid inherit',
    animation: 'ripple 1.5s infinite ease-in-out',
    opacity: 0.5
  },
  alertIndicator: {
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    lineHeight: 1
  },
  detailsPanel: {
    flex: '0.8',
    backgroundColor: '#101f42',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.5rem',
    overflowY: 'auto'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  statusText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid'
  },
  statRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.25rem'
  },
  statBox: {
    flex: 1,
    backgroundColor: '#172a5a',
    borderRadius: '6px',
    padding: '0.75rem',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#06b6d4',
    lineHeight: '1.2'
  },
  statLbl: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '0.15rem'
  },
  alertSection: {
    marginBottom: '1rem',
    h4: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      marginBottom: '0.5rem'
    }
  },
  emptyAlerts: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: '0.5rem',
    borderRadius: '6px'
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  alertItem: {
    backgroundColor: '#172a5a',
    borderLeft: '4px solid',
    borderRadius: '4px',
    padding: '0.625rem',
    fontSize: '0.8rem'
  },
  alertText: {
    color: '#cbd5e1',
    lineHeight: '1.4',
    margin: 0
  },
  facilitiesInfo: {
    fontSize: '0.8rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '0.75rem',
    h4: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      marginBottom: '0.25rem'
    }
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#94a3b8',
    p: {
      fontSize: '0.8rem',
      lineHeight: '1.5',
      marginTop: '0.5rem',
      maxWidth: '220px'
    }
  }
};

export default IndiaMap;
