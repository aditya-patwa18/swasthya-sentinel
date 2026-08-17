import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Clock, ShieldAlert, MessageSquare, Send, Building2, Calendar, Radio } from 'lucide-react';

const InvestigationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [alertDetails, setAlertDetails] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note creation input state
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAlertDetails(data.alert);
        setInvestigation(data.investigation);
        setFacilities(data.contributingFacilities);
      }
    } catch (err) {
      console.error('Error fetching alert details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/alerts/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        await fetchDetails();
      }
    } catch (err) {
      console.error('Error changing investigation status:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmittingNote(true);
    try {
      const response = await fetch(`/api/alerts/${id}/investigation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: noteText })
      });
      const data = await response.json();
      if (data.success) {
        setNoteText('');
        await fetchDetails();
      }
    } catch (err) {
      console.error('Error submitting investigation log note:', err);
    } finally {
      setSubmittingNote(false);
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#4a665e' }}>Loading investigation dossier...</div>;
  }

  if (!alertDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#4a665e' }}>
        <h3>Signal not found</h3>
        <button onClick={() => navigate('/surveillance/alerts')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Alert Center
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back navigation */}
      <button onClick={() => navigate('/surveillance/alerts')} style={styles.backBtn}>
        <ArrowLeft size={16} />
        <span>Back to Alert Center</span>
      </button>

      {/* Signal Banner */}
      <div className="glass-card" style={styles.bannerCard}>
        <div style={styles.bannerHeader}>
          <div>
            <span style={{
              ...styles.riskBadge,
              backgroundColor: getRiskColor(alertDetails.riskLevel) + '15',
              color: getRiskColor(alertDetails.riskLevel),
              borderColor: getRiskColor(alertDetails.riskLevel) + '40'
            }}>
              {alertDetails.riskLevel} Risk
            </span>
            <h1 style={styles.bannerTitle}>{alertDetails.condition}</h1>
            <span style={styles.regionText}>{alertDetails.region}</span>
          </div>

          <div style={styles.statusSection}>
            <span style={{
              ...styles.statusText,
              backgroundColor: alertDetails.status === 'New' ? '#ffedd5' : alertDetails.status === 'Resolved' ? '#d1fae5' : '#e0f2fe',
              color: alertDetails.status === 'New' ? '#ea580c' : alertDetails.status === 'Resolved' ? '#065f46' : '#0369a1',
              border: '1px solid ' + (alertDetails.status === 'New' ? '#fed7aa' : alertDetails.status === 'Resolved' ? '#a7f3d0' : '#bae6fd')
            }}>
              Status: {alertDetails.status}
            </span>

            {/* Quick status actions */}
            <div style={styles.statusActions}>
              {alertDetails.status === 'New' && (
                <button onClick={() => handleStatusChange('Under Investigation')} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#1b4d3e' }}>
                  Begin Investigation
                </button>
              )}
              {alertDetails.status !== 'Resolved' && (
                <button onClick={() => handleStatusChange('Resolved')} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}>
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed KPI statistics */}
        <div style={styles.statSummaryGrid}>
          <div style={styles.summaryBox}>
            <span style={styles.sumVal}>{alertDetails.currentValue}</span>
            <span style={styles.sumLbl}>Recent Cases</span>
          </div>
          <div style={styles.summaryBox}>
            <span style={styles.sumVal}>{alertDetails.baselineValue}</span>
            <span style={styles.sumLbl}>Expected Cases</span>
          </div>
          <div style={{ ...styles.summaryBox, borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
            <span style={{ ...styles.sumVal, color: '#dc2626' }}>+{alertDetails.percentageIncrease}%</span>
            <span style={styles.sumLbl}>Elevation Over Baseline</span>
          </div>
          <div style={styles.summaryBox}>
            <span style={styles.sumVal}>{alertDetails.confidenceScore}%</span>
            <span style={styles.sumLbl}>Signal Confidence</span>
          </div>
        </div>
      </div>

      <div style={styles.detailsGrid}>
        {/* Left Column: Contributing facilities table */}
        <div className="glass-card" style={styles.leftCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building2 size={18} color="#0f766e" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1b332a' }}>Contributing Healthcare Facilities</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Location</th>
                  <th>Cases Reported</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((fac) => (
                  <tr key={fac.facilityId}>
                    <td style={{ fontWeight: '600', color: '#1b332a' }}>{fac.name}</td>
                    <td>{fac.city}</td>
                    <td>{fac.cases}</td>
                    <td>{new Date(fac.lastReported).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Investigation log & timeline */}
        <div className="glass-card" style={styles.rightCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Clock size={18} color="#0f766e" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1b332a' }}>Investigation Log & Timeline</h3>
          </div>

          {/* Timeline Feed */}
          <div style={styles.timelineFeed}>
            {!investigation || investigation.notes.length === 0 ? (
              <div style={styles.emptyTimeline}>Timeline is empty. Begin investigation to log actions.</div>
            ) : (
              investigation.notes.map((note, index) => (
                <div key={note._id || index} style={styles.timelineItem}>
                  <div style={styles.timelineIcon}><MessageSquare size={12} /></div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineAuthor}>
                      <span>{note.author}</span>
                      <span style={styles.timelineDate}>
                        {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={styles.timelineText}>{note.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add note input form */}
          {alertDetails.status !== 'Resolved' && (
            <form onSubmit={handleAddNote} style={styles.noteForm}>
              <div style={styles.noteInputWrapper}>
                <input
                  type="text"
                  placeholder="Enter audit finding or note for investigators..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="form-control"
                  style={{ height: '42px', paddingRight: '3.5rem', borderColor: '#d1dfd6' }}
                  required
                />
                <button type="submit" style={styles.sendNoteBtn} disabled={submittingNote}>
                  <Send size={18} />
                </button>
              </div>
            </form>
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
    color: '#1b332a'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#0f766e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  bannerCard: {
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  bannerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #edf3ef',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  riskBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid',
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: '0.35rem'
  },
  bannerTitle: {
    fontSize: '1.6rem',
    color: '#1b332a',
    margin: 0,
    fontWeight: '800'
  },
  regionText: {
    fontSize: '0.85rem',
    color: '#0f766e',
    fontWeight: '600',
    marginTop: '0.15rem',
    display: 'inline-block'
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem'
  },
  statusText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    padding: '0.2rem 0.625rem',
    borderRadius: '4px',
    display: 'inline-block'
  },
  statusActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  statSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  summaryBox: {
    backgroundColor: '#f4f8f5',
    borderRadius: '8px',
    padding: '0.75rem',
    textAlign: 'center',
    border: '1px solid #d1dfd6'
  },
  sumVal: {
    display: 'block',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#1b332a'
  },
  sumLbl: {
    fontSize: '0.7rem',
    color: '#4a665e',
    marginTop: '0.15rem'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
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
    display: 'flex',
    flexDirection: 'column'
  },
  timelineFeed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    overflowY: 'auto',
    flex: 1,
    maxHeight: '340px',
    marginBottom: '1.25rem',
    paddingRight: '0.25rem'
  },
  emptyTimeline: {
    textAlign: 'center',
    padding: '2rem',
    color: '#789088',
    fontSize: '0.85rem'
  },
  timelineItem: {
    position: 'relative',
    display: 'flex',
    gap: '0.875rem'
  },
  timelineIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#e6efe8',
    color: '#0f766e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid #d1dfd6'
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    borderRadius: '8px',
    padding: '0.75rem'
  },
  timelineAuthor: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#1b332a',
    marginBottom: '0.25rem'
  },
  timelineDate: {
    fontSize: '0.65rem',
    color: '#4a665e',
    fontWeight: 'normal'
  },
  timelineText: {
    fontSize: '0.85rem',
    color: '#1b332a',  /* High contrast dark text to resolve Image 2 bug */
    lineHeight: '1.45',
    margin: 0
  },
  noteForm: {
    marginTop: 'auto',
    borderTop: '1px solid #edf3ef',
    paddingTop: '1rem'
  },
  noteInputWrapper: {
    position: 'relative'
  },
  sendNoteBtn: {
    position: 'absolute',
    right: '0.375rem',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#1b4d3e',
    color: '#ffffff',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#12352b'
    }
  }
};

export default InvestigationDetail;
