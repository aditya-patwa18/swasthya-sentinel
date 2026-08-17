import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Activity, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const defaultStates = [
  { state: 'Maharashtra', city: 'Mumbai', caseCount: 57, riskLevel: 'Critical', activeAlertsCount: 1, lat: 19.75, lng: 75.71 },
  { state: 'Karnataka', city: 'Hubli', caseCount: 20, riskLevel: 'High', activeAlertsCount: 1, lat: 15.31, lng: 75.71 },
  { state: 'Delhi', city: 'New Delhi', caseCount: 9, riskLevel: 'Normal', activeAlertsCount: 0, lat: 28.70, lng: 77.10 },
  { state: 'Gujarat', city: 'Ahmedabad', caseCount: 5, riskLevel: 'Normal', activeAlertsCount: 0, lat: 22.25, lng: 71.19 },
  { state: 'Rajasthan', city: 'Jaipur', caseCount: 3, riskLevel: 'Normal', activeAlertsCount: 0, lat: 27.02, lng: 74.21 },
  { state: 'Kerala', city: 'Kochi', caseCount: 12, riskLevel: 'Normal', activeAlertsCount: 0, lat: 10.85, lng: 76.27 },
  { state: 'Tamil Nadu', city: 'Chennai', caseCount: 8, riskLevel: 'Normal', activeAlertsCount: 0, lat: 11.12, lng: 78.65 }
];

const getRiskColor = (level) => {
  switch (level) {
    case 'Critical': return '#ef4444';
    case 'High': return '#f97316';
    case 'Elevated': return '#eab308';
    default: return '#10b981';
  }
};

const MapFocus = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.flyTo(center, zoom || 6, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
};

const IndiaMap = ({ hotspots = [], onSelectState, mode = 'Clusters' }) => {
  const [activeState, setActiveState] = useState(null);
  const [focus, setFocus] = useState(null);

  const mergedStates = useMemo(() => {
    return defaultStates.map((def) => {
      const dbMatch = hotspots.find((h) => h.state?.toLowerCase() === def.state.toLowerCase());
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
  }, [hotspots]);

  const handleSelect = (stateObj) => {
    setActiveState(stateObj);
    setFocus({ center: [stateObj.lat, stateObj.lng], zoom: 6.5 });
  };

  return (
    <div style={styles.container}>
      <div style={styles.mapCanvas}>
        <MapContainer
          center={[22.5, 79.5]}
          zoom={4.6}
          minZoom={4}
          maxZoom={12}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {focus && <MapFocus center={focus.center} zoom={focus.zoom} />}

          {mergedStates.map((st) => {
            const color = getRiskColor(st.riskLevel);
            const radius = mode === 'Intensity'
              ? Math.max(8, Math.min(28, 6 + st.caseCount / 3))
              : st.activeAlertsCount > 0 ? 14 : 10;
            const isHot = st.riskLevel === 'Critical' || st.riskLevel === 'High';

            return (
              <React.Fragment key={st.state}>
                {isHot && (
                  <CircleMarker
                    center={[st.lat, st.lng]}
                    pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.18, className: 'pulse-ring' }}
                    radius={radius + 10}
                    interactive={false}
                  />
                )}
                <CircleMarker
                  center={[st.lat, st.lng]}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.9
                  }}
                  radius={radius}
                  eventHandlers={{ click: () => handleSelect(st) }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <strong>{st.state}</strong> · {st.caseCount} cases
                  </Tooltip>
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <strong style={{ color: '#1b332a' }}>{st.state}</strong>
                      <div style={{ fontSize: 12, color: '#4a665e', marginTop: 4 }}>
                        {st.city} · {st.riskLevel} risk
                      </div>
                      <div style={{ fontSize: 12, marginTop: 6 }}>
                        Cases: <strong>{st.caseCount}</strong> · Alerts: <strong>{st.activeAlertsCount}</strong>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        <div style={styles.legend}>
          <span style={styles.legendTitle}>Risk</span>
          {[
            { label: 'Critical', color: '#ef4444' },
            { label: 'High', color: '#f97316' },
            { label: 'Normal', color: '#10b981' }
          ].map((item) => (
            <span key={item.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.detailsPanel}>
        {activeState ? (
          <div>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0, color: '#1b332a' }}>{activeState.state}</h3>
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
              <h4 style={styles.sectionLabel}>Active Signals</h4>
              {activeState.activeAlertsCount === 0 ? (
                <div style={styles.emptyAlerts}>
                  <CheckCircle size={16} color="#10b981" />
                  <span style={{ color: '#4a665e' }}>No emerging signals in region</span>
                </div>
              ) : (
                <div style={styles.alertItem}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <ShieldAlert size={16} color={getRiskColor(activeState.riskLevel)} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1b332a' }}>
                      {activeState.state === 'Maharashtra' ? 'Influenza Outbreak' : 'E. coli Resistance'}
                    </span>
                  </div>
                  <p style={styles.alertText}>
                    {activeState.state === 'Maharashtra'
                      ? 'Rapid clinical spike reported across 4 clinics in Mumbai Metropolitan.'
                      : 'Elevated resistance rate detected in urine culture isolates.'}
                  </p>
                </div>
              )}
            </div>

            <div style={styles.facilitiesInfo}>
              <h4 style={styles.sectionLabel}>Participating Clinics</h4>
              <p style={{ fontSize: '0.8rem', color: '#4a665e', margin: 0 }}>
                {activeState.state === 'Maharashtra' && 'Sunrise Clinic, Bandra Dispensary, Mumbai General, Andheri Lab'}
                {activeState.state === 'Karnataka' && 'Hubli Health Clinic, Belagavi Dispensary, Karnataka Apex Lab'}
                {['Delhi', 'Gujarat', 'Rajasthan', 'Kerala', 'Tamil Nadu'].includes(activeState.state) &&
                  'Reporting active surveillance data to national pipeline.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectState?.(activeState.state)}
              style={styles.inspectBtn}
            >
              <Activity size={14} />
              Inspect Geographic Cluster
            </button>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <TrendingUp size={36} color="#789088" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#1b332a', marginBottom: '0.35rem' }}>Select a Region</h3>
            <p>
              Click any hotspot on the live India map to inspect regional caseloads, trends, and active outbreak signals.
            </p>
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
    borderRadius: '12px',
    border: '1px solid #d1dfd6',
    overflow: 'hidden',
    minHeight: 0
  },
  legend: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    zIndex: 500,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid #d1dfd6',
    borderRadius: 8,
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#4a665e',
    boxShadow: '0 4px 10px rgba(16,40,24,0.08)'
  },
  legendTitle: {
    fontWeight: 800,
    color: '#1b332a',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%'
  },
  detailsPanel: {
    flex: '0.8',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #d1dfd6',
    padding: '1.5rem',
    overflowY: 'auto'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #edf3ef',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  statusText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: 4,
    border: '1px solid'
  },
  statRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.25rem'
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f4f8f5',
    borderRadius: 6,
    padding: '0.75rem',
    textAlign: 'center',
    border: '1px solid #d1dfd6'
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0f766e',
    lineHeight: 1.2
  },
  statLbl: {
    fontSize: '0.7rem',
    color: '#789088',
    marginTop: '0.15rem'
  },
  alertSection: {
    marginBottom: '1rem'
  },
  sectionLabel: {
    fontSize: '0.8rem',
    color: '#789088',
    marginBottom: '0.5rem',
    fontWeight: 700
  },
  emptyAlerts: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '0.5rem',
    borderRadius: 6
  },
  alertItem: {
    backgroundColor: '#f4f8f5',
    borderLeft: '4px solid #f97316',
    borderRadius: 4,
    padding: '0.625rem',
    fontSize: '0.8rem',
    border: '1px solid #d1dfd6'
  },
  alertText: {
    color: '#4a665e',
    lineHeight: 1.4,
    margin: 0
  },
  facilitiesInfo: {
    fontSize: '0.8rem',
    borderTop: '1px solid #edf3ef',
    paddingTop: '0.75rem',
    marginBottom: '1rem'
  },
  inspectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    backgroundColor: '#0f766e',
    color: '#fff',
    borderRadius: 6,
    padding: '0.55rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#789088',
    fontSize: '0.8rem',
    lineHeight: 1.5
  }
};

export default IndiaMap;
