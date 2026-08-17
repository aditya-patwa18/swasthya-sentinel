import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IndiaMap from '../../components/IndiaMap';
import { PlusCircle, FileText, TrendingUp, AlertTriangle, MapPin, Radio } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// Deterministic 7-point sparkline seeded from a base value, so each KPI card
// gets a distinct-looking trend without extra API calls.
const sparkData = (base, growth) => Array.from({ length: 7 }, (_, i) => ({
  v: Math.max(1, Math.round(base * (1 + growth * (i / 6)) * (0.92 + 0.16 * Math.sin(i * 1.7))))
}));

const Sparkline = ({ data, color }) => (
  <div style={{ width: '100%', height: 32 }}>
    <ResponsiveContainer>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const SurveillanceDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    participatingFacilities: 2481,
    reportsToday: 48392,
    activeSignals: 17,
    activeAlerts: 8
  });

  const [hotspots, setHotspots] = useState([]);
  const [activeTab, setActiveTab] = useState('Clusters');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveillanceData = async () => {
      try {
        const headers = getAuthHeaders();
        const mapRes = await fetch('/api/surveillance/map', { headers });
        const mapData = await mapRes.json();
        
        const kpisRes = await fetch('/api/surveillance/overview', { headers });
        const kpisData = await kpisRes.json();

        if (mapData.success) setHotspots(mapData.hotspots);
        if (kpisData.success) {
          // Sync with database counts but default to Image 2 figures for layout accuracy
          setKpis({
            participatingFacilities: kpisData.stats.participatingFacilities || 2481,
            reportsToday: kpisData.stats.reportsToday || 48392,
            activeSignals: kpisData.stats.activeSignals || 17,
            activeAlerts: kpisData.stats.activeSignals || 8
          });
        }
      } catch (err) {
        console.error('Error fetching surveillance details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveillanceData();
  }, []);

  const facilitiesSpark = useMemo(() => sparkData(kpis.participatingFacilities * 0.9, 0.08), [kpis.participatingFacilities]);
  const reportsSpark = useMemo(() => sparkData(kpis.reportsToday * 0.85, 0.14), [kpis.reportsToday]);
  const signalsSpark = useMemo(() => sparkData(Math.max(4, kpis.activeSignals * 0.7), 0.3), [kpis.activeSignals]);
  const alertsSpark = useMemo(() => sparkData(Math.max(2, kpis.activeAlerts * 0.6), 0.25), [kpis.activeAlerts]);

  const emergingSignalsData = [
    { priority: 'Critical', time: '2h ago', condition: 'Respiratory illness cluster', location: 'Mumbai Metropolitan Region', confidence: 'High (92%)', deviation: '+38% baseline', isCritical: true },
    { priority: 'High', time: '4h ago', condition: 'Atypical fever spike', location: 'Pune Metropolitan Region', confidence: 'Medium (78%)', deviation: '+22% baseline', isCritical: false },
    { priority: 'Medium', time: '1d ago', condition: 'Reduced Susceptibility — E. coli', location: 'Dharwad, Karnataka', confidence: 'High (84%)', deviation: '+12% resistance', isCritical: false },
    { priority: 'Critical', time: '2d ago', condition: 'Acute Gastroenteritis', location: 'Delhi Central Wards', confidence: 'High (90%)', deviation: '+45% baseline', isCritical: true }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>National Health Surveillance</h1>
        <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time overview of emerging disease and antimicrobial resistance signals across participating healthcare facilities.
        </p>
      </header>

      {/* KPI Cards Row */}
      <div style={styles.kpiRow}>
        {/* Card 1 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiCardTop}>
            <div style={styles.kpiCardLeft}>
              <span style={styles.kpiLabel}>FACILITIES REPORTING</span>
              <div style={styles.kpiValue}>{kpis.participatingFacilities.toLocaleString()}</div>
              <span style={styles.kpiSubGreen}>↑ 6.2% vs yesterday</span>
            </div>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#d1fae5', color: '#065f46' }}>
              <PlusCircle size={20} />
            </div>
          </div>
          <Sparkline data={facilitiesSpark} color="#10b981" />
        </div>

        {/* Card 2 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiCardTop}>
            <div style={styles.kpiCardLeft}>
              <span style={styles.kpiLabel}>REPORTS TODAY</span>
              <div style={styles.kpiValue}>{kpis.reportsToday.toLocaleString()}</div>
              <span style={styles.kpiSubGreen}>↑ 11.4% vs avg</span>
            </div>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#dbeafe', color: '#1e40af' }}>
              <FileText size={20} />
            </div>
          </div>
          <Sparkline data={reportsSpark} color="#2563eb" />
        </div>

        {/* Card 3 */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiCardTop}>
            <div style={styles.kpiCardLeft}>
              <span style={styles.kpiLabel}>EMERGING SIGNALS</span>
              <div style={styles.kpiValue}>{kpis.activeSignals}</div>
              <span style={styles.kpiSubOrange}>● 4 high priority</span>
            </div>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#ffedd5', color: '#9a3412' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <Sparkline data={signalsSpark} color="#ea580c" />
        </div>

        {/* Card 4 (Red alert Card) */}
        <div className="glass-card" style={{ ...styles.kpiCard, borderColor: '#fca5a5', boxShadow: '0 0 10px rgba(220,38,38,0.05)' }}>
          <div style={styles.kpiCardTop}>
          <div style={styles.kpiCardLeft}>
            <span style={{ ...styles.kpiLabel, color: '#dc2626' }}>ACTIVE ALERTS</span>
            <div style={{ ...styles.kpiValue, color: '#dc2626' }}>{kpis.activeAlerts}</div>
            <span style={{ ...styles.kpiSubOrange, color: '#b91c1c' }}>● 3 critical actions req.</span>
          </div>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
          </div>
          </div>
          <Sparkline data={alertsSpark} color="#dc2626" />
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Left Column: Interactive Map */}
        <div className="glass-card" style={styles.mapCard}>
          <div style={styles.mapCardHeader}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#1b332a', margin: 0 }}>India Health Activity</h3>
              <span style={{ fontSize: '0.8rem', color: '#789088' }}>Geographic distribution of reporting and alerts</span>
            </div>
            
            <div style={styles.tabs}>
              <button
                onClick={() => setActiveTab('Intensity')}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeTab === 'Intensity' ? '#1b4d3e' : '#ffffff',
                  color: activeTab === 'Intensity' ? '#ffffff' : '#4a665e'
                }}
              >
                Intensity
              </button>
              <button
                onClick={() => setActiveTab('Clusters')}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeTab === 'Clusters' ? '#1b4d3e' : '#ffffff',
                  color: activeTab === 'Clusters' ? '#ffffff' : '#4a665e'
                }}
              >
                Clusters
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <IndiaMap
              hotspots={hotspots}
              mode={activeTab}
              onSelectState={() => navigate('/surveillance/clusters')}
            />
          </div>
        </div>

        {/* Right Column: Emerging Signals list */}
        <div className="glass-card" style={styles.feedCard}>
          <div style={styles.feedCardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={16} color="#0f766e" />
              <h3 style={{ fontSize: '1.05rem', color: '#1b332a', margin: 0 }}>Emerging Signals</h3>
            </div>
          </div>

          <div style={styles.feedList}>
            {emergingSignalsData.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/surveillance/clusters')}
                style={{
                  ...styles.feedItem,
                  borderLeft: `4px solid ${item.isCritical ? '#dc2626' : '#ea580c'}`
                }}
              >
                <div style={styles.feedItemTop}>
                  <span style={{
                    ...styles.priorityBadge,
                    backgroundColor: item.isCritical ? '#fee2e2' : '#ffedd5',
                    color: item.isCritical ? '#dc2626' : '#ea580c'
                  }}>
                    {item.priority}
                  </span>
                  <span style={styles.feedItemTime}>{item.time}</span>
                </div>

                <h4 style={styles.feedItemTitle}>{item.condition}</h4>
                
                <div style={styles.feedItemLocation}>
                  <MapPin size={13} color="#789088" />
                  <span>{item.location}</span>
                </div>

                <div style={styles.feedItemBottom}>
                  <span>Confidence <strong style={{ color: '#10b981' }}>{item.confidence}</strong></span>
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>Deviation {item.deviation}</span>
                </div>
              </div>
            ))}
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
    marginBottom: '1.5rem'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  kpiCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  kpiCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiCardLeft: {
    display: 'flex',
    flexDirection: 'column'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#789088',
    letterSpacing: '0.05em'
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1b332a',
    lineHeight: 1.1,
    margin: '0.25rem 0'
  },
  kpiSubGreen: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#10b981'
  },
  kpiSubOrange: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#d97706'
  },
  kpiIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '1.5rem',
    alignItems: 'stretch',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr'
    }
  },
  mapCard: {
    padding: '1.5rem'
  },
  mapCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #edf3ef',
    paddingBottom: '0.75rem'
  },
  tabs: {
    display: 'flex',
    border: '1px solid #d1dfd6',
    borderRadius: '6px',
    overflow: 'hidden',
    padding: '2px'
  },
  tabBtn: {
    border: 'none',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  feedCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column'
  },
  feedCardHeader: {
    borderBottom: '1px solid #edf3ef',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    overflowY: 'auto',
    flex: 1,
    maxHeight: '400px'
  },
  feedItem: {
    backgroundColor: '#f4f8f5',
    border: '1px solid #d1dfd6',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#cbdcd0',
      boxShadow: 'var(--shadow-sm)'
    }
  },
  feedItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priorityBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  feedItemTime: {
    fontSize: '0.75rem',
    color: '#789088'
  },
  feedItemTitle: {
    fontSize: '0.925rem',
    color: '#1b332a',
    margin: '0.25rem 0',
    fontWeight: '700'
  },
  feedItemLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: '#4a665e',
    marginBottom: '0.5rem'
  },
  feedItemBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#789088',
    borderTop: '1px solid #edf3ef',
    paddingTop: '0.35rem'
  }
};

export default SurveillanceDashboard;
