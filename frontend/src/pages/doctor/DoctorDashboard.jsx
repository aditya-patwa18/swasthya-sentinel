import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, ShieldAlert, FileText, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DoctorDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    patientsToday: 0,
    reportsSubmitted: 0,
    activeConditions: 0,
    facilityAlerts: 0
  });
  const [trends, setTrends] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = getAuthHeaders();
        
        // 1. Fetch doctor's reports
        const reportsRes = await fetch('/api/reports', { headers });
        const reportsData = await reportsRes.json();
        
        // 2. Fetch alerts in doctor's state
        const alertsRes = await fetch('/api/alerts', { headers });
        const alertsData = await alertsRes.json();

        // 3. Fetch trends
        const trendsRes = await fetch('/api/surveillance/trends?days=7', { headers });
        const trendsData = await trendsRes.json();

        if (reportsData.success && alertsData.success) {
          const reports = reportsData.reports;
          
          // Calculate patients today (reports created in last 24h)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const patientsToday = reports
            .filter(r => new Date(r.reportDate) >= oneDayAgo)
            .reduce((sum, r) => sum + r.patientCount, 0);

          // Unique conditions
          const uniqueConditions = new Set(reports.map(r => r.suspectedCondition));

          setKpis({
            patientsToday: patientsToday || 12, // fallback for styling if new clinic
            reportsSubmitted: reports.length,
            activeConditions: uniqueConditions.size,
            facilityAlerts: alertsData.alerts.filter(a => a.status !== 'Resolved').length
          });

          setRecentReports(reports.slice(0, 5));

          // Generate some mock signals to display compared with baseline
          // In a real application, this is parsed from a clinic-level signals endpoint
          setSignals([
            { category: 'Respiratory Symptoms', increase: '↑ 23% this week', status: 'Elevated', color: '#f97316' },
            { category: 'Fever Cases', increase: '↑ 14%', status: 'Monitoring', color: '#eab308' },
            { category: 'Gastrointestinal Cases', increase: 'Stable', status: 'Normal', color: '#10b981' }
          ]);
        }

        if (trendsData.success) {
          setTrends(trendsData.trends);
        }
      } catch (err) {
        console.error('Error fetching doctor dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Clinical Workspace</h1>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Logged-in Doctor: <strong style={{ color: '#0f172a' }}>{user.name}</strong> • Facility: <strong style={{ color: '#3b82f6' }}>{user.facility?.name}</strong> ({user.city}, {user.state})
          </p>
        </div>
        <button onClick={() => navigate('/doctor/submit')} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Submit Clinical Report</span>
        </button>
      </header>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiVal}>{kpis.patientsToday}</div>
          <div style={styles.kpiTitle}>Patients Today</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiVal}>{kpis.reportsSubmitted}</div>
          <div style={styles.kpiTitle}>Reports Submitted</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiVal}>{kpis.activeConditions}</div>
          <div style={styles.kpiTitle}>Active Conditions</div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={{ ...styles.kpiVal, color: kpis.facilityAlerts > 0 ? '#ef4444' : '#10b981' }}>{kpis.facilityAlerts}</div>
          <div style={styles.kpiTitle}>Facility Alerts</div>
        </div>
      </div>

      {/* Main Section */}
      <div style={styles.mainGrid}>
        {/* Left column: Chart and Reports list */}
        <div style={styles.leftCol}>
          {/* Chart */}
          <div className="glass-card">
            <h3 style={styles.cardHeading}>Disease Activity This Week (Aggregate Trends)</h3>
            <div style={{ width: '100%', height: 280 }}>
              {trends.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', marginTop: '5px' }} />
                    <Line type="monotone" dataKey="Respiratory" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Fever" stroke="#eab308" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Gastrointestinal" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.emptyChart}>No trend data available for this week.</div>
              )}
            </div>
          </div>

          {/* Recent Reports table */}
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Reports</h3>
              <Link to="/doctor/records" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>View All History</Link>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Condition</th>
                    <th>Patient Count</th>
                    <th>Location</th>
                    <th>Diagnosis Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No reports submitted yet. Click "Submit Clinical Report" to begin.
                      </td>
                    </tr>
                  ) : (
                    recentReports.map((report) => (
                      <tr key={report._id}>
                        <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>{report.suspectedCondition}</td>
                        <td>{report.patientCount}</td>
                        <td>{report.city}, {report.state}</td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Facility signals / local warnings */}
        <div style={styles.rightCol}>
          {/* Facility Signals panel */}
          <div className="glass-card">
            <h3 style={styles.cardHeading}>Facility Signals</h3>
            <div style={styles.signalsList}>
              {signals.map((sig) => (
                <div key={sig.category} style={styles.signalItem}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>{sig.category}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{sig.increase}</span>
                  </div>
                  <span
                    style={{
                      ...styles.signalStatus,
                      color: sig.color,
                      backgroundColor: sig.color + '15',
                      borderColor: sig.color + '30'
                    }}
                  >
                    {sig.status}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/doctor/signals')} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
              View Details & Baselines
            </button>
          </div>

          {/* Clinical Warnings */}
          <div className="glass-card" style={{ marginTop: '1.5rem', backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} color="#d97706" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#92400e' }}>Active Outbreak Alerts</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#b45309', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              <strong>Influenza-like Illness Outbreak Warning:</strong> Public health authorities have triggered an alert for elevated respiratory activity in the Mumbai Metropolitan Region.
            </p>
            <p style={{ fontSize: '0.825rem', color: '#b45309', lineHeight: '1.4', margin: 0 }}>
              Please request cultures / Rapid Antigen Tests for qualifying cases, and record lab findings in Step 3 of the report form.
            </p>
          </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  kpiCard: {
    textAlign: 'center',
    padding: '1.25rem 1rem'
  },
  kpiVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#3b82f6',
    lineHeight: 1
  },
  kpiTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    marginTop: '0.35rem'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '1.5rem',
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
  cardHeading: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    fontWeight: '700'
  },
  emptyChart: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '0.9rem'
  },
  signalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  signalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  signalStatus: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid'
  }
};

export default DoctorDashboard;
