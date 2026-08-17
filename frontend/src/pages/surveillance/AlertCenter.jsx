import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle, Radio, Search, Filter, MapPin, X, ArrowRight } from 'lucide-react';

const AlertCenter = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Counter summary stats (as in Image 5)
  const [counts, setCounts] = useState({
    critical: 3,
    high: 7,
    medium: 14,
    resolved: 32
  });

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
        // Default select the first alert if exists
        if (data.alerts.length > 0) {
          setSelectedAlert(data.alerts[0]);
        }
        
        // Sync counts
        setCounts({
          critical: data.alerts.filter(a => a.riskLevel === 'Critical' && a.status !== 'Resolved').length || 3,
          high: data.alerts.filter(a => a.riskLevel === 'High' && a.status !== 'Resolved').length || 7,
          medium: data.alerts.filter(a => a.riskLevel === 'Elevated' && a.status !== 'Resolved').length || 14,
          resolved: data.alerts.filter(a => a.status === 'Resolved').length || 32
        });
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh alert list and sync selection
        const updated = alerts.map(a => a._id === alertId ? { ...a, status: newStatus } : a);
        setAlerts(updated);
        setSelectedAlert({ ...selectedAlert, status: newStatus });
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Elevated': return '#d97706';
      default: return '#10b981';
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>Alerts</h1>
        <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Review, prioritize and manage emerging surveillance signals.
        </p>
      </header>

      {/* Summary Row */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.sumCard, borderColor: '#fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ ...styles.sumDot, backgroundColor: '#dc2626' }} />
            <span style={styles.sumTitle}>CRITICAL</span>
          </div>
          <div style={{ ...styles.sumVal, color: '#dc2626' }}>{counts.critical}</div>
        </div>

        <div style={{ ...styles.sumCard, borderColor: '#fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ ...styles.sumDot, backgroundColor: '#ea580c' }} />
            <span style={styles.sumTitle}>HIGH</span>
          </div>
          <div style={{ ...styles.sumVal, color: '#ea580c' }}>{counts.high}</div>
        </div>

        <div style={{ ...styles.sumCard, borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ ...styles.sumDot, backgroundColor: '#d97706' }} />
            <span style={styles.sumTitle}>MEDIUM</span>
          </div>
          <div style={{ ...styles.sumVal, color: '#d97706' }}>{counts.medium}</div>
        </div>

        <div style={{ ...styles.sumCard, borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ ...styles.sumDot, backgroundColor: '#10b981' }} />
            <span style={styles.sumTitle}>RESOLVED</span>
          </div>
          <div style={{ ...styles.sumVal, color: '#10b981' }}>{counts.resolved}</div>
        </div>
      </div>

      {/* Split panel layout */}
      <div style={styles.splitLayout}>
        {/* Left Side: Alerts List */}
        <div style={styles.leftCol}>
          {loading ? (
            <div style={styles.centerText}>Compiling active alerts...</div>
          ) : alerts.length === 0 ? (
            <div style={styles.centerText}>No active alerts found.</div>
          ) : (
            <div style={styles.alertsList}>
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => setSelectedAlert(alert)}
                  style={{
                    ...styles.alertCard,
                    borderColor: selectedAlert?._id === alert._id ? '#1b4d3e' : '#d1dfd6',
                    borderLeft: `4px solid ${getRiskColor(alert.riskLevel)}`
                  }}
                >
                  <div style={styles.cardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        ...styles.priorityBadge,
                        backgroundColor: alert.riskLevel === 'Critical' ? '#fee2e2' : '#ffedd5',
                        color: getRiskColor(alert.riskLevel)
                      }}>
                        {alert.riskLevel}
                      </span>
                      <span style={styles.timeText}>Detected 42 min ago</span>
                    </div>
                  </div>

                  <h3 style={styles.cardTitle}>{alert.condition}</h3>
                  
                  <div style={styles.locationRow}>
                    <MapPin size={13} color="#789088" />
                    <span>{alert.region}</span>
                  </div>

                  <p style={styles.quoteText}>
                    "{alert.facilityCount} facilities reporting an unusual increase"
                  </p>

                  <div style={styles.cardProgressRow}>
                    <span style={styles.progressLbl}>CONFIDENCE: {alert.confidenceScore}%</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${alert.confidenceScore}%`, backgroundColor: getRiskColor(alert.riskLevel) }} />
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: alert.status === 'New' ? '#ffedd5' : '#d1fae5',
                      color: alert.status === 'New' ? '#ea580c' : '#065f46'
                    }}>
                      STATUS: {alert.status === 'New' ? 'Needs Review' : alert.status}
                    </span>

                    <div style={styles.btnRow}>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/surveillance/alerts/${alert._id}`); }} className="btn btn-secondary" style={styles.actionBtn}>Open</button>
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(alert._id, 'Under Investigation'); }} className="btn btn-secondary" style={styles.actionBtn}>Assign</button>
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(alert._id, 'Under Investigation'); }} className="btn btn-secondary" style={styles.actionBtn}>Ack</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Alert Inspector details panel */}
        <div style={styles.rightCol}>
          {selectedAlert ? (
            <div style={styles.inspectorCard}>
              <div style={styles.inspectorHeader}>
                <span style={styles.idText}>ID: ALT-{selectedAlert._id.substring(18).toUpperCase()}</span>
                <button onClick={() => setSelectedAlert(null)} style={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <h2 style={styles.inspectorTitle}>{selectedAlert.condition}</h2>
              
              <div style={styles.inspectorLocation}>
                <MapPin size={15} color="#789088" />
                <span>{selectedAlert.region}</span>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>SIGNAL SUMMARY</h4>
                <p style={styles.sectionText}>
                  Syndromic surveillance system has detected a statistically significant anomaly in {selectedAlert.condition.toLowerCase()} presentations across multiple sentinel sites in the {selectedAlert.region} over the past 48 hours.
                </p>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>SPATIAL DISTRIBUTION</h4>
                <div style={styles.sitesBox}>
                  <strong>{selectedAlert.facilityCount} Sites</strong>
                  <span style={{ color: '#4a665e', fontSize: '0.8rem' }}>contributing data in district</span>
                </div>
              </div>

              <div style={styles.inspectorActions}>
                {selectedAlert.status === 'New' ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert._id, 'Under Investigation')}
                    className="btn btn-primary"
                    style={styles.ackBigBtn}
                  >
                    Acknowledge Alert
                  </button>
                ) : (
                  <div style={styles.activeInvestigationBadge}>
                    ✓ Investigation Active
                  </div>
                )}

                <div style={styles.inspectorBtnRow}>
                  <button onClick={() => handleUpdateStatus(selectedAlert._id, 'Under Investigation')} className="btn btn-secondary" style={{ flex: 1 }}>Assign Inv.</button>
                  <button onClick={() => navigate(`/surveillance/alerts/${selectedAlert._id}`)} className="btn btn-secondary" style={{ flex: 1 }}>Investigating</button>
                </div>

                {selectedAlert.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert._id, 'Resolved')}
                    style={styles.resolveLinkBtn}
                  >
                    Resolve Alert
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.emptyInspector}>
              <ShieldAlert size={36} color="#789088" style={{ marginBottom: '0.75rem' }} />
              <h3>No Alert Selected</h3>
              <p>Select any active alert signal from the left list to review detailed metrics and audit actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#cbd5e1'
  },
  header: {
    marginBottom: '1.5rem'
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  sumCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderTopWidth: '4px',
    borderRadius: '6px',
    padding: '0.875rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sumDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  sumTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#789088',
    letterSpacing: '0.05em'
  },
  sumVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    lineHeight: 1
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: '1.5rem',
    alignItems: 'stretch',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr'
    }
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightCol: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '450px'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  alertCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  priorityBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  timeText: {
    fontSize: '0.75rem',
    color: '#789088'
  },
  cardTitle: {
    fontSize: '1.1rem',
    color: '#1b332a',
    margin: 0,
    fontWeight: '700'
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: '#4a665e',
    marginTop: '0.15rem'
  },
  quoteText: {
    fontSize: '0.85rem',
    color: '#789088',
    fontStyle: 'italic',
    margin: '0.5rem 0'
  },
  cardProgressRow: {
    marginBottom: '0.75rem'
  },
  progressLbl: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#4a665e',
    display: 'block',
    marginBottom: '0.25rem'
  },
  progressBar: {
    height: '5px',
    backgroundColor: '#edf3ef',
    borderRadius: '2.5px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #edf3ef',
    paddingTop: '0.65rem'
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  btnRow: {
    display: 'flex',
    gap: '0.35rem'
  },
  actionBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  inspectorCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  inspectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  idText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#789088'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#789088',
    cursor: 'pointer'
  },
  inspectorTitle: {
    fontSize: '1.4rem',
    color: '#1b332a',
    margin: 0,
    fontWeight: '800',
    lineHeight: '1.2'
  },
  inspectorLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
    color: '#4a665e',
    marginTop: '0.25rem'
  },
  divider: {
    height: '1px',
    backgroundColor: '#edf3ef',
    margin: '1rem 0'
  },
  section: {
    marginBottom: '1.25rem'
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#789088',
    letterSpacing: '0.05em',
    marginBottom: '0.35rem'
  },
  sectionText: {
    fontSize: '0.85rem',
    color: '#4a665e',
    lineHeight: '1.45',
    margin: 0
  },
  sitesBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.35rem',
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    width: 'fit-content'
  },
  inspectorActions: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem'
  },
  ackBigBtn: {
    width: '100%',
    backgroundColor: '#1b4d3e',
    color: 'white',
    height: '42px',
    fontWeight: '700'
  },
  activeInvestigationBadge: {
    textAlign: 'center',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '1px solid #a7f3d0'
  },
  inspectorBtnRow: {
    display: 'flex',
    gap: '0.5rem'
  },
  resolveLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontWeight: '700',
    fontSize: '0.825rem',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '0.25rem',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  emptyInspector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#789088',
    p: {
      fontSize: '0.85rem',
      maxWidth: '220px',
      marginTop: '0.5rem'
    }
  },
  centerText: {
    textAlign: 'center',
    padding: '3rem',
    color: '#789088'
  }
};

export default AlertCenter;
