import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FlaskConical, PlusCircle, ShieldAlert } from 'lucide-react';

// Fallback culture/AMR report log, used whenever the backend/database isn't
// reachable (offline demo login, unseeded DB). Mirrors the lab panel seeded
// for Karnataka Apex Lab so the demo account sees a consistent story.
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
const FALLBACK_REPORTS = [
  { _id: 'demo-r1', reportDate: daysAgo(1), pathogen: 'Salmonella Typhi', testName: 'Culture & Sensitivity', antibioticName: 'Ciprofloxacin', resistance: 'Resistant', labPerformed: true },
  { _id: 'demo-r2', reportDate: daysAgo(2), pathogen: 'Pseudomonas aeruginosa', testName: 'Culture & Sensitivity', antibioticName: 'Ceftazidime', resistance: 'Resistant', labPerformed: true },
  { _id: 'demo-r3', reportDate: daysAgo(3), pathogen: 'Staphylococcus aureus', testName: 'Culture & Sensitivity', antibioticName: 'Ciprofloxacin', resistance: 'Susceptible', labPerformed: true },
  { _id: 'demo-r4', reportDate: daysAgo(4), pathogen: 'Staphylococcus aureus', testName: 'Culture & Sensitivity', antibioticName: 'Amoxicillin', resistance: 'Resistant', labPerformed: true },
  { _id: 'demo-r5', reportDate: daysAgo(5), pathogen: 'Acinetobacter baumannii', testName: 'Culture & Sensitivity', antibioticName: 'Meropenem', resistance: 'Resistant', labPerformed: true },
  { _id: 'demo-r6', reportDate: daysAgo(6), pathogen: 'Klebsiella pneumoniae', testName: 'Culture & Sensitivity', antibioticName: 'Meropenem', resistance: 'Susceptible', labPerformed: true },
  { _id: 'demo-r7', reportDate: daysAgo(7), pathogen: 'Klebsiella pneumoniae', testName: 'Culture & Sensitivity', antibioticName: 'Ceftriaxone', resistance: 'Resistant', labPerformed: true },
  { _id: 'demo-r8', reportDate: daysAgo(8), pathogen: 'E. coli', testName: 'Urine Culture & Sensitivity', antibioticName: 'Ciprofloxacin', resistance: 'Resistant', labPerformed: true }
];

const LabDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState(FALLBACK_REPORTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports', { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success && data.reports?.length > 0) setReports(data.reports);
      } catch (err) {
        console.error('Error fetching lab reports, using demo dataset:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const totalIsolates = reports.filter(r => r.labPerformed).length;
  const resistantIsolates = reports.filter(r => r.resistance === 'Resistant').length;
  const resistanceRate = totalIsolates > 0 ? Math.round((resistantIsolates / totalIsolates) * 100) : 0;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>Lab Workspace</h1>
          <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Logged in: <strong>{user?.name}</strong> · Facility: <strong>{user?.facility?.name}</strong> ({user?.city}, {user?.state})
          </p>
        </div>
        <button onClick={() => navigate('/lab/submit')} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Submit AMR / Culture Report</span>
        </button>
      </header>

      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiVal}>{reports.length}</div>
          <div style={styles.kpiTitle}>Reports Submitted</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiVal}>{totalIsolates}</div>
          <div style={styles.kpiTitle}>Isolates Logged</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={{ ...styles.kpiVal, color: resistanceRate >= 50 ? '#dc2626' : '#ea580c' }}>{resistanceRate}%</div>
          <div style={styles.kpiTitle}>Resistance Rate</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FlaskConical size={18} color="#0f766e" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1b332a' }}>Recent Culture & AMR Reports</h3>
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pathogen</th>
                <th>Test</th>
                <th>Antibiotic</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#789088' }}>Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#789088' }}>No reports submitted yet.</td></tr>
              ) : (
                reports.slice(0, 8).map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.reportDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: '#0f766e' }}>{r.pathogen || '—'}</td>
                    <td>{r.testName || '—'}</td>
                    <td>{r.antibioticName || '—'}</td>
                    <td>
                      <span className={`badge ${r.resistance === 'Resistant' ? 'badge-critical' : r.resistance === 'Susceptible' ? 'badge-normal' : 'badge-monitoring'}`}>
                        {r.resistance}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem', backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <ShieldAlert size={18} color="#d97706" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#92400e' }}>AMR Stewardship Reminder</h3>
        </div>
        <p style={{ fontSize: '0.825rem', color: '#b45309', margin: 0 }}>
          Every culture with resistance findings feeds directly into the national AMR Watch dashboard.
          Log the identified pathogen and tested antibiotic accurately — see <Link to="/lab/submit" style={{ color: '#92400e', fontWeight: 700 }}>Submit Report</Link>.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  kpiCard: { textAlign: 'center', padding: '1.25rem 1rem' },
  kpiVal: { fontSize: '2rem', fontWeight: '800', color: '#0f766e', lineHeight: 1 },
  kpiTitle: { fontSize: '0.8rem', fontWeight: '600', color: '#4a665e', marginTop: '0.35rem' }
};

export default LabDashboard;
