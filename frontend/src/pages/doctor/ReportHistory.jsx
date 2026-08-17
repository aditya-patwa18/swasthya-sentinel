import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Filter, FileText } from 'lucide-react';

const ReportHistory = () => {
  const { getAuthHeaders } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [diagnosisStatus, setDiagnosisStatus] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports', {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setReports(data.reports);
          setFilteredReports(data.reports);
        }
      } catch (err) {
        console.error('Error fetching clinical reports history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filter calculation effect
  useEffect(() => {
    let result = [...reports];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.suspectedCondition.toLowerCase().includes(q) ||
        r.chiefComplaint.toLowerCase().includes(q) ||
        (r.pathogen && r.pathogen.toLowerCase().includes(q))
      );
    }

    if (category) {
      result = result.filter(r => r.diseaseCategory === category);
    }

    if (diagnosisStatus) {
      result = result.filter(r => r.diagnosisStatus === diagnosisStatus);
    }

    setFilteredReports(result);
  }, [search, category, diagnosisStatus, reports]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>Report Submission History</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        View and audit all clinical de-identified reports filed from your login session.
      </p>

      {/* Query Filter row */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div style={styles.searchBox}>
            <Search size={16} style={styles.filterIcon} />
            <input
              type="text"
              placeholder="Search condition, complaint, pathogen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={styles.dropdownBox}>
            <Filter size={16} style={styles.filterIcon} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', height: '42px' }}
            >
              <option value="">All Categories</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Fever">Fever</option>
              <option value="Gastrointestinal">Gastrointestinal</option>
              <option value="Vector-borne">Vector-borne</option>
              <option value="Skin">Skin</option>
              <option value="Neurological">Neurological</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.dropdownBox}>
            <Filter size={16} style={styles.filterIcon} />
            <select
              value={diagnosisStatus}
              onChange={(e) => setDiagnosisStatus(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', height: '42px' }}
            >
              <option value="">All Diagnosis States</option>
              <option value="Suspected">Suspected</option>
              <option value="Probable">Probable</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table list */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <div style={styles.centerText}>Loading report histories...</div>
        ) : filteredReports.length === 0 ? (
          <div style={{ ...styles.centerText, padding: '3rem 0' }}>
            <FileText size={32} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>No clinical reports match query</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Try adjusting filters or submit a new report.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Condition</th>
                  <th>Cases</th>
                  <th>Diagnosis Status</th>
                  <th>Lab Data</th>
                  <th>AMR Flag</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                      {report._id.substring(18)}
                    </td>
                    <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td>{report.department}</td>
                    <td style={{ fontWeight: '600' }}>{report.suspectedCondition}</td>
                    <td>{report.patientCount}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: report.diagnosisStatus === 'Confirmed' ? '#d1fae5' : '#fef3c7',
                        color: report.diagnosisStatus === 'Confirmed' ? '#065f46' : '#92400e'
                      }}>
                        {report.diagnosisStatus}
                      </span>
                    </td>
                    <td>{report.labPerformed ? 'Yes' : 'No'}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: report.resistance === 'Resistant' ? '#fee2e2' : '#f1f5f9',
                        color: report.resistance === 'Resistant' ? '#b91c1c' : '#64748b'
                      }}>
                        {report.resistance === 'Resistant' ? 'AMR Alert' : 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  filterCard: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  searchBox: {
    flex: '2',
    minWidth: '220px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  dropdownBox: {
    flex: '1',
    minWidth: '150px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  filterIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#94a3b8',
    zIndex: 2
  },
  centerText: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
  }
};

export default ReportHistory;
