import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Calendar, Filter, MapPin, Building, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DiseaseTrends = () => {
  const { getAuthHeaders } = useAuth();
  
  const [compareBaseline, setCompareBaseline] = useState(true);

  // Filters State
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [diseaseFilter, setDiseaseFilter] = useState('All Diseases');
  const [locationFilter, setLocationFilter] = useState('All India');
  const [facilityFilter, setFacilityFilter] = useState('All Facilities');

  const [cardsData, setCardsData] = useState([]);
  const [graphData, setGraphData] = useState([]);

  // Generate realistic data based on filters dynamically
  useEffect(() => {
    // 1. Establish multipliers based on date range
    let dateMultiplier = 1.0;
    let daysCount = 30;
    if (dateFilter === 'Last 7 Days') {
      dateMultiplier = 0.23;
      daysCount = 7;
    } else if (dateFilter === 'Last 90 Days') {
      dateMultiplier = 2.95;
      daysCount = 90;
    }

    // 2. Establish multipliers based on location
    let locMultiplier = 1.0;
    if (locationFilter === 'Maharashtra') locMultiplier = 0.32;
    else if (locationFilter === 'Karnataka') locMultiplier = 0.24;
    else if (locationFilter === 'Delhi') locMultiplier = 0.16;

    // 3. Establish multipliers based on facility type
    let facMultiplier = 1.0;
    if (facilityFilter !== 'All Facilities') {
      if (facilityFilter === 'Sunrise Clinic') facMultiplier = 0.035;
      else if (facilityFilter === 'Bandra Dispensary') facMultiplier = 0.045;
      else if (facilityFilter === 'Karnataka Lab') facMultiplier = 0.025;
    }

    // Combined scaling factor
    const scale = dateMultiplier * locMultiplier * facMultiplier;

    // 4. Handle category/disease filters to suppress/raise certain symptoms
    let repMod = 1.0;
    let gastroMod = 1.0;
    let vectorMod = 1.0;
    let urinaryMod = 1.0;
    let feverMod = 1.0;

    if (categoryFilter === 'Respiratory' || diseaseFilter === 'Influenza-like Illness') {
      repMod = 1.8;
      gastroMod = 0.1;
      vectorMod = 0.1;
      urinaryMod = 0.1;
      feverMod = 0.7;
    } else if (categoryFilter === 'Gastrointestinal' || diseaseFilter === 'Acute Gastroenteritis') {
      repMod = 0.1;
      gastroMod = 1.9;
      vectorMod = 0.1;
      urinaryMod = 0.1;
      feverMod = 0.6;
    } else if (categoryFilter === 'Urinary' || diseaseFilter === 'UTI') {
      repMod = 0.1;
      gastroMod = 0.1;
      vectorMod = 0.1;
      urinaryMod = 1.7;
      feverMod = 0.5;
    }

    // Calculate baseline card numbers
    const baseResp = Math.round(12482 * scale * repMod);
    const baseGastro = Math.round(8104 * scale * gastroMod);
    const baseVector = Math.round(5930 * scale * vectorMod);
    const baseUrinary = Math.round(3241 * scale * urinaryMod);
    const baseFever = Math.round(4890 * scale * feverMod);

    // Set 5 cards dynamically
    setCardsData([
      { 
        title: 'Respiratory', 
        cases: baseResp.toLocaleString(), 
        change7d: repMod > 0.5 ? '↑ 4.2%' : '↓ 1.2%', 
        change30d: '↓ 1.5%', 
        status: repMod > 1.2 ? 'Critical Alert' : repMod > 0.5 ? 'Elevated' : 'Stable', 
        color: repMod > 1.2 ? '#dc2626' : repMod > 0.5 ? '#ea580c' : '#10b981', 
        bg: repMod > 1.2 ? '#fee2e2' : repMod > 0.5 ? '#ffedd5' : '#d1fae5', 
        borderRed: repMod > 1.2 
      },
      { 
        title: 'Gastrointestinal', 
        cases: baseGastro.toLocaleString(), 
        change7d: '↓ 0.8%', 
        change30d: '↓ 0.0%', 
        status: gastroMod > 1.2 ? 'Critical Alert' : 'Stable', 
        color: gastroMod > 1.2 ? '#dc2626' : '#10b981', 
        bg: gastroMod > 1.2 ? '#fee2e2' : '#d1fae5',
        borderRed: gastroMod > 1.2
      },
      { 
        title: 'Vector-borne', 
        cases: baseVector.toLocaleString(), 
        change7d: '↑ 12.4%', 
        change30d: '↑ 8.1%', 
        status: vectorMod > 1.2 ? 'Critical Alert' : 'Rising Alert', 
        color: '#dc2626', 
        bg: '#fee2e2', 
        borderRed: true 
      },
      { 
        title: 'Urinary', 
        cases: baseUrinary.toLocaleString(), 
        change7d: '↓ 2.1%', 
        change30d: '↓ 4.5%', 
        status: urinaryMod > 1.2 ? 'Critical Alert' : 'Stable', 
        color: urinaryMod > 1.2 ? '#dc2626' : '#10b981', 
        bg: urinaryMod > 1.2 ? '#fee2e2' : '#d1fae5',
        borderRed: urinaryMod > 1.2
      },
      { 
        title: 'Febrile Illness', 
        cases: baseFever.toLocaleString(), 
        change7d: '↑ 3.8%', 
        change30d: '↓ 1.2%', 
        status: feverMod > 1.2 ? 'Critical Alert' : 'Elevated', 
        color: '#ea580c', 
        bg: '#ffedd5' 
      }
    ]);

    // Generate Recharts daily points deterministically
    const generatedPoints = [];
    const now = new Date();
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      // Deterministic variations using sine waves seeded by dates
      const sinVal = Math.sin(i * 0.4) * 15;
      const noise = (Math.cos(i * 0.9) * 8);

      // Raw counts scaled down per day
      const dailyScale = scale * 0.05; // average points count
      const respVal = Math.max(0, Math.round((280 + sinVal + noise) * dailyScale * repMod));
      const feverVal = Math.max(0, Math.round((140 + sinVal * 0.5 + noise * 1.2) * dailyScale * feverMod));
      const gastroVal = Math.max(0, Math.round((180 - sinVal * 0.3 + noise) * dailyScale * gastroMod));
      const vectorVal = Math.max(0, Math.round((90 + sinVal * 0.4 + noise * 0.7) * dailyScale * vectorMod));
      const urinaryVal = Math.max(0, Math.round((70 - sinVal * 0.2 + noise * 0.5) * dailyScale * urinaryMod));
      
      // Dynamic baseline average
      const baseVal = Math.max(0, Math.round((230 + noise * 0.5) * dailyScale));

      generatedPoints.push({
        date: dateStr,
        Respiratory: respVal,
        Fever: feverVal,
        Gastrointestinal: gastroVal,
        Vector: vectorVal,
        Urinary: urinaryVal,
        Baseline: baseVal
      });
    }

    setGraphData(generatedPoints);
  }, [dateFilter, categoryFilter, diseaseFilter, locationFilter, facilityFilter]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1b332a' }}>Disease Trends</h1>
          <p style={{ color: '#4a665e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Explore changes in reported conditions across time and geography.
          </p>
        </div>
        <button onClick={() => alert("Report Analysis exported successfully.")} className="btn btn-secondary">
          <FileText size={18} />
          <span>Export Analysis</span>
        </button>
      </header>

      {/* Filter Row */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.selectWrapper}>
          <Calendar size={15} style={styles.filterIcon} />
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="form-control" style={styles.filterSelect}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <Filter size={15} style={styles.filterIcon} />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="form-control" style={styles.filterSelect}>
            <option>All Categories</option>
            <option>Respiratory</option>
            <option>Gastrointestinal</option>
            <option>Urinary</option>
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <Filter size={15} style={styles.filterIcon} />
          <select value={diseaseFilter} onChange={e => setDiseaseFilter(e.target.value)} className="form-control" style={styles.filterSelect}>
            <option>All Diseases</option>
            <option>Influenza-like Illness</option>
            <option>UTI</option>
            <option>Acute Gastroenteritis</option>
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <MapPin size={15} style={styles.filterIcon} />
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="form-control" style={styles.filterSelect}>
            <option>All India</option>
            <option>Maharashtra</option>
            <option>Karnataka</option>
            <option>Delhi</option>
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <Building size={15} style={styles.filterIcon} />
          <select value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)} className="form-control" style={styles.filterSelect}>
            <option>All Facilities</option>
            <option>Sunrise Clinic</option>
            <option>Bandra Dispensary</option>
            <option>Karnataka Lab</option>
          </select>
        </div>
      </div>

      {/* Cards Row */}
      <div style={styles.cardsRow}>
        {cardsData.map((card, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              ...styles.trendCard,
              borderColor: card.borderRed ? '#dc2626' : '#d1dfd6',
              boxShadow: card.borderRed ? '0 0 10px rgba(220, 38, 38, 0.1)' : 'var(--shadow-sm)'
            }}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardTitle}>{card.title}</span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: card.bg,
                color: card.color
              }}>
                {card.status}
              </span>
            </div>
            
            <div style={styles.casesCount}>{card.cases}</div>
            
            <div style={styles.changeRow}>
              <span style={{ color: card.color === '#dc2626' || card.color === '#ea580c' ? card.color : '#10b981', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {card.change7d.startsWith('↑') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <strong>{card.change7d.substring(2)}</strong> <span style={{ color: '#789088', fontSize: '0.75rem' }}>7d</span>
              </span>
              
              <span style={{ color: '#789088', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {card.change30d.startsWith('↑') ? <ArrowUpRight size={14} color="#ea580c" /> : <ArrowDownRight size={14} color="#10b981" />}
                <strong style={{ color: card.change30d.startsWith('↑') ? '#ea580c' : '#10b981' }}>{card.change30d.substring(2)}</strong> <span style={{ fontSize: '0.75rem' }}>30d</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reported Disease Activity */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={styles.chartHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={styles.bulletDot} />
            <h3 style={{ fontSize: '1.05rem', color: '#1b332a', margin: 0 }}>Reported Disease Activity</h3>
          </div>

          <div style={styles.toggleWrapper} onClick={() => setCompareBaseline(!compareBaseline)}>
            <span style={{ fontSize: '0.825rem', color: '#4a665e', fontWeight: '600' }}>COMPARE BASELINE</span>
            {compareBaseline ? (
              <ToggleRight size={26} color="#10b981" style={{ cursor: 'pointer' }} />
            ) : (
              <ToggleLeft size={26} color="#cbdad1" style={{ cursor: 'pointer' }} />
            )}
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          {graphData.length === 0 ? (
            <div style={styles.emptyChart}>Compiling disease data...</div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6efe8" />
                <XAxis dataKey="date" stroke="#789088" style={{ fontSize: '11px' }} />
                <YAxis stroke="#789088" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1dfd6', color: '#1b332a', fontSize: '12px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '5px' }} />
                <Line type="monotone" name="Respiratory" dataKey="Respiratory" stroke="#1b4d3e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" name="Fever" dataKey="Fever" stroke="#ea580c" strokeWidth={1.5} dot={false} />
                <Line type="monotone" name="Gastrointestinal" dataKey="Gastrointestinal" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                <Line type="monotone" name="Vector-borne" dataKey="Vector" stroke="#dc2626" strokeWidth={1.5} dot={false} />
                <Line type="monotone" name="Urinary" dataKey="Urinary" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                {compareBaseline && (
                  <Line type="monotone" name="95% CI Baseline" dataKey="Baseline" stroke="#cbdad1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
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
  filterCard: {
    display: 'flex',
    gap: '0.875rem',
    padding: '0.75rem 1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '150px'
  },
  filterIcon: {
    position: 'absolute',
    left: '0.875rem',
    color: '#789088',
    zIndex: 2
  },
  filterSelect: {
    paddingLeft: '2.3rem',
    height: '38px',
    fontSize: '0.85rem'
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  trendCard: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: '#4a665e'
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px'
  },
  casesCount: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1b332a',
    margin: '0.5rem 0'
  },
  changeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.825rem'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  bulletDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#1b4d3e'
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none'
  },
  emptyChart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#789088'
  }
};

export default DiseaseTrends;
