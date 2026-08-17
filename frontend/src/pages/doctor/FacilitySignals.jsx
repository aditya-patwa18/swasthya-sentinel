import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldAlert, CheckCircle, Flame, Heart } from 'lucide-react';

const FacilitySignals = () => {
  const { user, getAuthHeaders } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      if (!user?.facility?._id) return;
      
      try {
        const response = await fetch(`/api/reports/facility/${user.facility._id}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
          const reports = data.reports;
          
          // Calculate signals dynamically
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thirtySevenDaysAgo = new Date(now.getTime() - 37 * 24 * 60 * 60 * 1000);

          const categories = ['Respiratory', 'Fever', 'Gastrointestinal', 'Vector-borne', 'Other'];
          
          const computedSignals = categories.map(cat => {
            // Recent cases (last 7 days)
            const recent = reports
              .filter(r => r.diseaseCategory === cat && new Date(r.reportDate) >= sevenDaysAgo)
              .reduce((sum, r) => sum + r.patientCount, 0);

            // Baseline cases (prior 30 days)
            const baseline = reports
              .filter(r => r.diseaseCategory === cat && new Date(r.reportDate) >= thirtySevenDaysAgo && new Date(r.reportDate) < sevenDaysAgo)
              .reduce((sum, r) => sum + r.patientCount, 0);

            const recentAvg = recent / 7;
            const baselineAvg = (baseline / 30) || 0.1; // fallback minimal baseline
            
            const pctChange = ((recentAvg - baselineAvg) / baselineAvg) * 100;
            
            let status = 'Normal';
            let color = '#10b981'; // Green
            
            if (pctChange >= 50 && recent >= 5) {
              status = 'Elevated';
              color = '#f97316'; // Orange
            } else if (pctChange >= 15 && recent >= 3) {
              status = 'Monitoring';
              color = '#eab308'; // Yellow
            }

            let pctLabel = 'Stable';
            if (pctChange > 0) pctLabel = `↑ ${Math.round(pctChange)}%`;
            else if (pctChange < 0) pctLabel = `↓ ${Math.round(Math.abs(pctChange))}%`;

            return {
              category: cat,
              pctLabel,
              pctValue: pctChange,
              status,
              color,
              recentCount: recent,
              baselineCount: Math.round(baselineAvg * 7)
            };
          });

          setSignals(computedSignals);
        }
      } catch (err) {
        console.error('Error fetching facility signals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [user]);

  if (!user?.facility) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>Local Facility Signals</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Automated baseline metrics computed for <strong style={{ color: '#0f172a' }}>{user.facility.name}</strong>.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Computing facility baseline comparisons...</div>
      ) : (
        <div style={styles.grid}>
          {signals.map((sig) => (
            <div key={sig.category} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {sig.category === 'Respiratory' && <Activity size={18} color="#3b82f6" />}
                  {sig.category === 'Fever' && <Flame size={18} color="#eab308" />}
                  {sig.category === 'Gastrointestinal' && <Heart size={18} color="#10b981" />}
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{sig.category}</h3>
                </div>
                
                <span style={{
                  ...styles.statusBadge,
                  color: sig.color,
                  backgroundColor: sig.color + '15',
                  borderColor: sig.color + '30'
                }}>
                  {sig.status}
                </span>
              </div>

              <div style={styles.body}>
                <div style={styles.statLine}>
                  <span style={styles.label}>Weekly Trend Change:</span>
                  <span style={{ fontWeight: '700', color: sig.pctValue > 0 ? sig.color : '#64748b' }}>
                    {sig.pctLabel}
                  </span>
                </div>
                
                <div style={styles.statLine}>
                  <span style={styles.label}>Recent cases (Past 7d):</span>
                  <span style={styles.value}>{sig.recentCount}</span>
                </div>

                <div style={styles.statLine}>
                  <span style={styles.label}>Expected cases (Baseline):</span>
                  <span style={styles.value}>{sig.baselineCount}</span>
                </div>
              </div>
              
              <div style={styles.footer}>
                {sig.status === 'Normal' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
                    <CheckCircle size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Within typical historical thresholds</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: sig.color }}>
                    <ShieldAlert size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Crossed alert thresholds, monitoring active</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  card: {
    padding: '1.25rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  statLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem'
  },
  label: {
    color: '#64748b'
  },
  value: {
    fontWeight: '600',
    color: '#0f172a'
  },
  footer: {
    marginTop: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.5rem'
  }
};

export default FacilitySignals;
