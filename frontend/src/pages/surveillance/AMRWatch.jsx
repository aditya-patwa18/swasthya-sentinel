import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pill, Activity, ShieldAlert, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AMRWatch = () => {
  const { getAuthHeaders } = useAuth();
  const [kpis, setKpis] = useState({
    activeAMRSignals: 0,
    totalIsolates: 0,
    resistantIsolates: 0,
    antibioticPrescribingRate: 0
  });

  const [pathogenTable, setPathogenTable] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAMRData = async () => {
      try {
        const headers = getAuthHeaders();
        
        // 1. Fetch overview resistance data
        const resOverview = await fetch('/api/amr/overview', { headers });
        const dataOverview = await resOverview.json();

        // 2. Fetch prescribing trends
        const resTrends = await fetch('/api/amr/trends', { headers });
        const dataTrends = await resTrends.json();

        if (dataOverview.success) {
          setKpis(dataOverview.stats);
          setPathogenTable(dataOverview.pathogenTable);
        }

        if (dataTrends.success) {
          setTrends(dataTrends.trends);
        }
      } catch (err) {
        console.error('Error fetching AMR data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAMRData();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>AMR Watch</h1>
        <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Monitoring antimicrobial resistance trends and prescribing densities across participating facilities
        </p>
      </header>

      {/* AMR KPIs */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><ShieldAlert size={20} color="#dc2626" /></div>
          <div style={{ ...styles.kpiVal, color: '#dc2626' }}>{kpis.activeAMRSignals}</div>
          <div style={styles.kpiTitle}>Active AMR Signals</div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><Activity size={20} color="#0f766e" /></div>
          <div style={styles.kpiVal}>{kpis.totalIsolates}</div>
          <div style={styles.kpiTitle}>Total Isolates Logged</div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><Pill size={20} color="#ea580c" /></div>
          <div style={styles.kpiVal}>{kpis.resistantIsolates}</div>
          <div style={styles.kpiTitle}>Resistant Isolates</div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiIcon}><TrendingUp size={20} color="#8b5cf6" /></div>
          <div style={styles.kpiVal}>{kpis.antibioticPrescribingRate}%</div>
          <div style={styles.kpiTitle}>Antibiotic Prescription Density</div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Left Column: Pathogens table */}
        <div className="glass-card" style={styles.leftCol}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1b332a' }}>Pathogen Resistance Surveillance</h3>
          
          {loading ? (
            <div style={styles.centerText}>Compiling isolates logs...</div>
          ) : pathogenTable.length === 0 ? (
            <div style={styles.centerText}>No significant resistance signals logged.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Pathogen</th>
                    <th>Antibiotic Class / Name</th>
                    <th>Region</th>
                    <th>Isolates Tested</th>
                    <th>Resistance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {pathogenTable.map((row, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '700', color: '#0f766e' }}>{row.pathogen}</td>
                      <td>{row.antibiotic}</td>
                      <td>{row.region}</td>
                      <td>{row.isolatesTested}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontWeight: '800',
                            color: row.resistanceRate >= 50 ? '#dc2626' : row.resistanceRate >= 25 ? '#ea580c' : '#10b981'
                          }}>
                            {row.resistanceRate}%
                          </span>
                          <div style={styles.miniBarContainer}>
                            <div style={{
                              ...styles.miniBarFill,
                              width: `${row.resistanceRate}%`,
                              backgroundColor: row.resistanceRate >= 50 ? '#dc2626' : row.resistanceRate >= 25 ? '#ea580c' : '#10b981'
                            }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Prescribing trends chart */}
        <div className="glass-card" style={styles.rightCol}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1b332a' }}>Antibiotic Prescriptions (Drug Class Density)</h3>
          
          <div style={{ width: '100%', height: 280 }}>
            {trends.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6efe8" />
                  <XAxis dataKey="date" stroke="#789088" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#789088" style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1dfd6', color: '#1b332a', fontSize: '12px', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '5px' }} />
                  <Line type="monotone" dataKey="Fluoroquinolones" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Penicillins" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Cephalosporins" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Other" stroke="#789088" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.centerText}>Compiling drug prescriptions...</div>
            )}
          </div>
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
  header: {
    marginBottom: '1.5rem'
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
    padding: '1.25rem 1rem',
    position: 'relative'
  },
  kpiIcon: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem'
  },
  kpiVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1b332a',
    lineHeight: 1
  },
  kpiTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4a665e',
    marginTop: '0.35rem'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
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
  centerText: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#789088',
    fontSize: '0.9rem'
  },
  miniBarContainer: {
    width: '60px',
    height: '6px',
    backgroundColor: '#edf3ef',
    borderRadius: '3px',
    overflow: 'hidden',
    flexShrink: 0
  },
  miniBarFill: {
    height: '100%'
  }
};

export default AMRWatch;
