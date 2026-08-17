import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Building, FileText, CheckCircle } from 'lucide-react';

const FacilityDetail = () => {
  const { getAuthHeaders } = useAuth();
  
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Selected facility deep-dive state
  const [selectedFac, setSelectedFac] = useState(null);
  const [facStats, setFacStats] = useState(null);
  const [facLoading, setFacLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch facilities list
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/api/facilities', {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setFacilities(data.facilities);
          setFilteredFacilities(data.facilities);
        }
      } catch (err) {
        console.error('Error fetching facilities directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  // Filter facilities listing
  useEffect(() => {
    let result = [...facilities];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.state.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter(f => f.type === typeFilter);
    }
    setFilteredFacilities(result);
  }, [search, typeFilter, facilities]);

  // Handle drill down on click
  const handleSelectFacility = async (fac) => {
    setFacLoading(true);
    try {
      const response = await fetch(`/api/facilities/${fac._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSelectedFac(data.facility);
        setFacStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching facility details:', err);
    } finally {
      setFacLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Facilities Directory</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Inspect participating hospitals, clinics, and labs connected to the surveillance network
        </p>
      </header>

      <div style={styles.layout}>
        {/* Left Column: Directory listings */}
        <div style={styles.leftCol}>
          {/* Filters */}
          <div className="glass-card" style={styles.filtersBox}>
            <div style={styles.searchContainer}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search facility name, city, state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-control"
              style={{ flex: 0.5, height: '42px' }}
            >
              <option value="">All Facility Types</option>
              <option value="Hospital">Hospitals</option>
              <option value="Clinic">Clinics</option>
              <option value="Dispensary">Dispensaries</option>
              <option value="Laboratory">Laboratories</option>
            </select>
          </div>

          {/* Directory Listings */}
          <div className="glass-card" style={{ marginTop: '1rem', padding: 0 }}>
            {loading ? (
              <div style={styles.centerText}>Loading directory...</div>
            ) : filteredFacilities.length === 0 ? (
              <div style={styles.centerText}>No connected facilities match this query.</div>
            ) : (
              <div style={styles.list}>
                {filteredFacilities.map((fac) => (
                  <div
                    key={fac._id}
                    onClick={() => handleSelectFacility(fac)}
                    style={{
                      ...styles.listItem,
                      backgroundColor: selectedFac?._id === fac._id ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      borderLeftColor: selectedFac?._id === fac._id ? '#06b6d4' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={styles.facIconBox}><Building size={16} /></div>
                      <div>
                        <h4 style={styles.facName}>{fac.name}</h4>
                        <span style={styles.facSub}>{fac.type} • {fac.city}, {fac.state}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deep-dive inspector */}
        <div className="glass-card" style={styles.rightCol}>
          {facLoading ? (
            <div style={styles.centerFlex}>Querying clinical records dossier...</div>
          ) : selectedFac ? (
            <div>
              <div style={styles.facHeader}>
                <h3 style={{ margin: 0, color: '#fff' }}>{selectedFac.name}</h3>
                <span style={styles.typeBadge}>{selectedFac.type}</span>
              </div>
              
              <div style={styles.metaBox}>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <MapPin size={14} color="#64748b" />
                  <span>{selectedFac.city}, {selectedFac.state}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Coordinates: {selectedFac.latitude.toFixed(4)}, {selectedFac.longitude.toFixed(4)}
                </div>
              </div>

              {/* Aggregated Totals */}
              <div style={styles.statGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statVal}>{facStats.totalReports}</span>
                  <span style={styles.statLbl}>Submitted Reports</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statVal}>{facStats.totalPatients}</span>
                  <span style={styles.statLbl}>Patients Logged</span>
                </div>
              </div>

              {/* Conditions Breakdown */}
              <div style={styles.conditionsSec}>
                <h4 style={styles.secTitle}>Caseload by Disease Category</h4>
                {Object.keys(facStats.categoryCounts).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No cases reported yet.</p>
                ) : (
                  <div style={styles.catCounts}>
                    {Object.entries(facStats.categoryCounts).map(([cat, val]) => (
                      <div key={cat} style={styles.catRow}>
                        <span style={{ fontSize: '0.85rem' }}>{cat}</span>
                        <span style={{ fontWeight: '700', color: '#06b6d4' }}>{val} cases</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History Table */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={styles.secTitle}>Recent Reports Submitted</h4>
                {facStats.recentReports.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No recent report activity.</p>
                ) : (
                  <div className="table-container">
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Condition</th>
                          <th>Cases</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facStats.recentReports.map((r) => (
                          <tr key={r._id}>
                            <td>{new Date(r.reportDate).toLocaleDateString()}</td>
                            <td style={{ fontWeight: '600' }}>{r.suspectedCondition}</td>
                            <td>{r.patientCount}</td>
                            <td>{r.diagnosisStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.centerFlex}>
              <FileText size={36} color="#64748b" style={{ marginBottom: '1rem' }} />
              <h3>Select a Facility</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '240px', marginTop: '0.5rem' }}>
                Click any connected clinic from the directory list to inspect its case logs, baseline aggregates, and submission frequencies.
              </p>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
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
    flexDirection: 'column',
    minHeight: '400px',
    padding: '1.5rem'
  },
  filtersBox: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    alignItems: 'center'
  },
  searchContainer: {
    flex: 1.2,
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#94a3b8',
    zIndex: 2
  },
  list: {
    maxHeight: '440px',
    overflowY: 'auto',
    borderRadius: '8px'
  },
  listItem: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderLeft: '4px solid transparent',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.02)'
    }
  },
  listItemActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)'
  },
  facIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#172a5a',
    color: '#06b6d4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  facName: {
    fontSize: '0.9rem',
    color: '#ffffff',
    margin: 0,
    fontWeight: '600'
  },
  facSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  facHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  typeBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    color: '#06b6d4',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid rgba(6, 182, 212, 0.3)'
  },
  metaBox: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    marginBottom: '1.25rem'
  },
  statGrid: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#172a5a',
    borderRadius: '6px',
    padding: '0.75rem',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  statVal: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#06b6d4'
  },
  statLbl: {
    fontSize: '0.7rem',
    color: '#64748b'
  },
  secTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
    fontWeight: '700'
  },
  catCounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  catRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.625rem 0.75rem',
    backgroundColor: '#172a5a',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  centerFlex: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#94a3b8'
  },
  centerText: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
    fontSize: '0.9rem'
  }
};

export default FacilityDetail;
