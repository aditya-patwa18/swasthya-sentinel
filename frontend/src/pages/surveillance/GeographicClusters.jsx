import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip } from 'react-leaflet';
import { Map, ArrowRight, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const hospitalSites = [
  { id: 1, name: 'KEM Hospital', type: 'Hospital', lat: 19.0005, lng: 72.8405, intensity: 92, cases: 38 },
  { id: 2, name: 'JJ Hospital', type: 'Hospital', lat: 18.9633, lng: 72.8331, intensity: 84, cases: 29 },
  { id: 3, name: 'Lilavati Hospital', type: 'Hospital', lat: 19.0510, lng: 72.8290, intensity: 71, cases: 18 },
  { id: 4, name: 'Hinduja Hospital', type: 'Hospital', lat: 19.0528, lng: 72.8386, intensity: 66, cases: 15 }
];

const clinicSites = [
  { id: 5, name: 'Bandra Dispensary', type: 'Clinic', lat: 19.0596, lng: 72.8295, intensity: 58, cases: 12 },
  { id: 6, name: 'Andheri Sentinel Clinic', type: 'Clinic', lat: 19.1197, lng: 72.8464, intensity: 62, cases: 14 },
  { id: 7, name: 'Dadar Ward Clinic', type: 'Clinic', lat: 19.0178, lng: 72.8478, intensity: 74, cases: 21 },
  { id: 8, name: 'Worli Health Post', type: 'Clinic', lat: 19.0170, lng: 72.8170, intensity: 55, cases: 9 }
];

const GeographicClusters = () => {
  const navigate = useNavigate();
  const [intensity] = useState(78);
  const [hospitalChecked, setHospitalChecked] = useState(true);
  const [clinicChecked, setClinicChecked] = useState(true);

  const sites = useMemo(() => {
    const list = [];
    if (hospitalChecked) list.push(...hospitalSites);
    if (clinicChecked) list.push(...clinicSites);
    return list;
  }, [hospitalChecked, clinicChecked]);

  const handleCreateInvestigation = () => {
    alert('Outbreak investigation folder created. Dispatched to local surveillance officers.');
    navigate('/surveillance/alerts');
  };

  const markerColor = (type, value) => {
    if (type === 'Hospital') return value >= 80 ? '#dc2626' : '#ea580c';
    return value >= 70 ? '#eab308' : '#0f766e';
  };

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumbs}>
        <span>Surveillance</span>
        <span style={styles.bcSeparator}>&gt;</span>
        <span>Geographic Clusters</span>
        <span style={styles.bcSeparator}>&gt;</span>
        <span style={styles.bcActive}>Mumbai Respiratory Signal</span>
      </div>

      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1b332a' }}>
          Respiratory Illness Cluster Mumbai Metropolitan Region
        </h1>
        <div style={styles.badgeRow}>
          <span style={styles.priorityBadge}>HIGH PRIORITY</span>
          <span style={styles.metaBadge}>Detected: 16 Aug 2026, 14:32</span>
          <span style={styles.metaBadge}>Confidence: 87%</span>
        </div>
      </header>

      <div style={styles.layoutGrid}>
        <div className="glass-card" style={styles.mapCard}>
          <div style={styles.mapCanvas}>
            <MapContainer
              center={[19.05, 72.86]}
              zoom={11.2}
              minZoom={10}
              maxZoom={16}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* Cluster heat halo over central wards */}
              <Circle
                center={[19.03, 72.84]}
                radius={4200}
                pathOptions={{
                  color: '#dc2626',
                  weight: 1,
                  fillColor: '#dc2626',
                  fillOpacity: 0.12
                }}
              />
              <Circle
                center={[19.03, 72.84]}
                radius={1800}
                pathOptions={{
                  color: '#dc2626',
                  weight: 1,
                  fillColor: '#ef4444',
                  fillOpacity: 0.18
                }}
              />

              {sites.map((site) => {
                const color = markerColor(site.type, site.intensity);
                return (
                  <CircleMarker
                    key={site.id}
                    center={[site.lat, site.lng]}
                    radius={site.type === 'Hospital' ? 12 : 8}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: color,
                      fillOpacity: 0.9
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -4]}>
                      {site.name}
                    </Tooltip>
                    <Popup>
                      <div style={{ minWidth: 150 }}>
                        <strong style={{ color: '#1b332a' }}>{site.name}</strong>
                        <div style={{ fontSize: 12, color: '#4a665e', marginTop: 4 }}>
                          {site.type} · Intensity {site.intensity}%
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          Recent cases: <strong>{site.cases}</strong>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            <div style={styles.signalCoreCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Map size={16} color="#1b4d3e" />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1b332a' }}>Signal Core</h4>
              </div>

              <p style={styles.signalCoreText}>
                Potential cluster detected across central wards. Not a confirmed outbreak. Requires field verification.
              </p>

              <div style={styles.intensityRow}>
                <span style={styles.intensityLbl}>Intensity</span>
                <div style={styles.sliderContainer}>
                  <div style={{ ...styles.sliderFill, width: `${intensity}%` }} />
                </div>
                <span style={styles.intensityVal}>{intensity}%</span>
              </div>

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

            <div style={styles.mapLegend}>
              <span><i style={{ ...styles.dot, background: '#dc2626' }} /> High hospital load</span>
              <span><i style={{ ...styles.dot, background: '#eab308' }} /> Clinic spike</span>
              <span><i style={{ ...styles.dot, background: '#0f766e' }} /> Monitoring</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <h3 style={styles.summaryHeading}>Cluster Summary</h3>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryBox}>
              <span style={styles.summaryBoxVal}>{sites.length || 18}</span>
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

      <div className="glass-card" style={styles.recommendationsCard}>
        <div style={styles.recommendationLeft}>
          <Info size={20} color="#1b4d3e" style={{ flexShrink: 0 }} />
          <p style={styles.recommendationText}>
            <strong>Recommended:</strong> Review recent clinical trends across top contributing facilities to rule out artifact.
          </p>
        </div>

        <div style={styles.actionsRow}>
          <button onClick={() => alert('Summary details exported.')} className="btn btn-secondary" style={styles.footerBtn}>
            Export Summary
          </button>
          <button onClick={() => navigate('/surveillance')} className="btn btn-secondary" style={styles.footerBtn}>
            Compare Regions
          </button>
          <button onClick={() => navigate('/surveillance/trends')} className="btn btn-secondary" style={styles.footerBtn}>
            View Disease Trend
          </button>
          <button onClick={handleCreateInvestigation} className="btn btn-primary" style={{ ...styles.footerBtn, backgroundColor: '#0f766e' }}>
            Create Investigation <ArrowRight size={14} style={{ marginLeft: 4 }} />
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
    fontWeight: 500,
    marginBottom: '0.75rem'
  },
  bcSeparator: {
    color: '#cbdad1'
  },
  bcActive: {
    color: '#1b332a',
    fontWeight: 700
  },
  header: {
    marginBottom: '1.5rem'
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  priorityBadge: {
    fontSize: '0.7rem',
    fontWeight: 800,
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    padding: '0.15rem 0.5rem',
    borderRadius: 4
  },
  metaBadge: {
    fontSize: '0.75rem',
    color: '#4a665e',
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    padding: '0.15rem 0.5rem',
    borderRadius: 4,
    fontWeight: 500
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1.5rem',
    alignItems: 'stretch',
    marginBottom: '1.5rem'
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden'
  },
  mapCanvas: {
    height: 420,
    backgroundColor: '#ffffff',
    position: 'relative'
  },
  signalCoreCard: {
    position: 'absolute',
    left: '1rem',
    top: '1rem',
    width: 250,
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: 8,
    padding: '0.875rem',
    boxShadow: 'var(--shadow-md)',
    zIndex: 500
  },
  signalCoreText: {
    fontSize: '0.75rem',
    color: '#4a665e',
    margin: '0.25rem 0 0.75rem 0',
    lineHeight: 1.4
  },
  intensityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  intensityLbl: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#4a665e'
  },
  intensityVal: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#0f766e'
  },
  sliderContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#edf3ef',
    borderRadius: 3,
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
    fontWeight: 700,
    color: '#1b332a',
    cursor: 'pointer'
  },
  checkbox: {
    width: 14,
    height: 14,
    cursor: 'pointer'
  },
  mapLegend: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    zIndex: 500,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid #d1dfd6',
    borderRadius: 8,
    padding: '0.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#4a665e',
    boxShadow: '0 4px 10px rgba(16,40,24,0.08)'
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6
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
    fontWeight: 700
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  summaryBox: {
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    borderRadius: 6,
    padding: '1rem 0.75rem',
    textAlign: 'center'
  },
  summaryBoxVal: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 800,
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
    minWidth: 280
  },
  recommendationText: {
    fontSize: '0.85rem',
    color: '#1b4d3e',
    margin: 0
  },
  actionsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  footerBtn: {
    padding: '0.45rem 0.875rem',
    fontSize: '0.8rem',
    display: 'inline-flex',
    alignItems: 'center'
  }
};

export default GeographicClusters;
