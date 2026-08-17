import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, LabelList
} from 'recharts';
import { BadgeCheck, FlaskConical, Building2, Bug, Info } from 'lucide-react';
import {
  HEALTHCARE_INFRASTRUCTURE,
  ABDM_STATS,
  AMR_RESISTANCE_DATA,
  VECTOR_BORNE_DISEASE_DATA,
  SIMULATED_PILOT_STATS
} from '../../data/nationalStatistics';

// Validated categorical palette (dataviz skill default order — passes CVD/contrast
// gates on a white surface; light-mode WARN slots get direct labels per the relief rule)
const SERIES = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  yellow: '#eda100',
  magenta: '#e87ba4',
  violet: '#4a3aa7'
};

const TEXT_PRIMARY = '#1b332a';
const TEXT_SECONDARY = '#4a665e';
const TEXT_MUTED = '#789088';
const GRIDLINE = '#e6efe8';

const fmtCompact = (n) => {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

const SourceTag = ({ source, asOf }) => (
  <div style={styles.sourceTag}>
    <BadgeCheck size={13} color="#0f766e" />
    <span>{source}{asOf ? ` · as of ${asOf}` : ''}</span>
  </div>
);

const StatTile = ({ label, value, sub, icon }) => (
  <div className="glass-card" style={styles.statTile}>
    <div style={styles.statTileTop}>
      <span style={styles.statLabel}>{label}</span>
      {icon}
    </div>
    <div style={styles.statValue}>{value}</div>
    {sub && <div style={styles.statSub}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label, unit = '%' }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={styles.tooltip}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: p.color }}>
          <span>{p.name}</span>
          <strong>{p.value}{unit}</strong>
        </div>
      ))}
    </div>
  );
};

const NationalStatistics = () => {
  const [amrView, setAmrView] = useState('resistance');

  const infraChartData = HEALTHCARE_INFRASTRUCTURE.facilities.map((f) => ({
    type: f.type.replace(/\s*\([^)]*\)/, ''),
    count: f.count
  }));

  const amrTrendData = AMR_RESISTANCE_DATA.resistanceRates
    .filter((r) => r.ratePrior !== undefined)
    .map((r) => ({
      name: `${r.pathogen} — ${r.antibiotic}`,
      [`${r.priorYear}`]: r.ratePrior,
      '2023': r.rate2023,
      type: r.type
    }));

  const isolateFreqData = AMR_RESISTANCE_DATA.isolateFrequency.map((f) => ({
    pathogen: f.pathogen,
    share: f.percentOfIsolates
  }));

  const resistanceSnapshot = AMR_RESISTANCE_DATA.resistanceRates.filter((r) => r.type === 'Resistance');

  const seriesColors = [SERIES.blue, SERIES.orange, SERIES.aqua, SERIES.yellow, SERIES.magenta, SERIES.violet];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: TEXT_PRIMARY }}>National Statistics</h1>
        <p style={{ color: TEXT_SECONDARY, fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '760px' }}>
          Sourced government and ICMR figures that ground this platform's design — shown alongside clearly
          labeled simulated pilot data so evaluators can tell real national baselines apart from demo output.
        </p>
      </header>

      {/* Section: Healthcare Infrastructure */}
      <section className="glass-card" style={styles.section}>
        <div style={styles.sectionHeader}>
          <Building2 size={18} color="#0f766e" />
          <h3 style={styles.sectionTitle}>India's Public Health Infrastructure</h3>
        </div>
        <SourceTag source={HEALTHCARE_INFRASTRUCTURE.source} asOf={HEALTHCARE_INFRASTRUCTURE.asOf} />

        <div style={styles.kpiRow3}>
          <StatTile
            label="Total addressable facilities"
            value={fmtCompact(HEALTHCARE_INFRASTRUCTURE.totalFacilities)}
            sub="SCs + PHCs + CHCs + SDHs + DHs"
            icon={<Building2 size={18} color={TEXT_MUTED} />}
          />
          <StatTile
            label="ABHA health accounts created"
            value={`${ABDM_STATS.abhaAccountsCrore} Cr`}
            sub={`≈${fmtCompact(ABDM_STATS.abhaAccountsAbsolute)} accounts · as of ${ABDM_STATS.asOf}`}
            icon={<BadgeCheck size={18} color={TEXT_MUTED} />}
          />
          <StatTile
            label="Facilities registered on ABDM (HFR)"
            value={`${ABDM_STATS.facilitiesRegisteredLakh} L`}
            sub={`≈${fmtCompact(ABDM_STATS.facilitiesRegisteredAbsolute)} facilities`}
            icon={<Building2 size={18} color={TEXT_MUTED} />}
          />
        </div>

        <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
          <ResponsiveContainer>
            <BarChart data={infraChartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRIDLINE} horizontal={false} />
              <XAxis type="number" stroke={TEXT_MUTED} style={{ fontSize: '11px' }} tickFormatter={fmtCompact} />
              <YAxis type="category" dataKey="type" stroke={TEXT_MUTED} width={190} style={{ fontSize: '11px' }} />
              <Tooltip
                content={<CustomTooltip unit="" />}
                formatter={(v) => v.toLocaleString('en-IN')}
                cursor={{ fill: 'rgba(15,118,110,0.06)' }}
              />
              <Bar dataKey="count" name="Facility count" fill={SERIES.blue} radius={[0, 4, 4, 0]} maxBarSize={22}>
                <LabelList dataKey="count" position="right" formatter={fmtCompact} style={{ fill: TEXT_PRIMARY, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Section: AMR Resistance */}
      <section className="glass-card" style={styles.section}>
        <div style={styles.sectionHeader}>
          <FlaskConical size={18} color="#dc2626" />
          <h3 style={styles.sectionTitle}>AMR Resistance — ICMR AMRSN/NARS-Net 2023</h3>
        </div>
        <SourceTag source={AMR_RESISTANCE_DATA.source} />

        <div style={styles.toggleRow}>
          <button
            onClick={() => setAmrView('resistance')}
            style={{ ...styles.viewToggleBtn, ...(amrView === 'resistance' ? styles.viewToggleActive : {}) }}
          >
            2023 Snapshot
          </button>
          <button
            onClick={() => setAmrView('trend')}
            style={{ ...styles.viewToggleBtn, ...(amrView === 'trend' ? styles.viewToggleActive : {}) }}
          >
            2017 → 2023 Trend
          </button>
          <button
            onClick={() => setAmrView('frequency')}
            style={{ ...styles.viewToggleBtn, ...(amrView === 'frequency' ? styles.viewToggleActive : {}) }}
          >
            Isolate Frequency
          </button>
        </div>

        {amrView === 'resistance' && (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={resistanceSnapshot} margin={{ top: 20, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRIDLINE} vertical={false} />
                <XAxis
                  dataKey="pathogen"
                  stroke={TEXT_MUTED}
                  style={{ fontSize: '10px' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis stroke={TEXT_MUTED} style={{ fontSize: '11px' }} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(220,38,38,0.05)' }} />
                <Bar dataKey="rate2023" name="Resistance rate (2023)" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {resistanceSnapshot.map((entry, idx) => (
                    <Cell key={idx} fill={entry.rate2023 >= 50 ? '#d03b3b' : entry.rate2023 >= 25 ? SERIES.orange : SERIES.aqua} />
                  ))}
                  <LabelList dataKey="rate2023" position="top" formatter={(v) => `${v}%`} style={{ fill: TEXT_PRIMARY, fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {amrView === 'trend' && (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={amrTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRIDLINE} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={TEXT_MUTED}
                  style={{ fontSize: '10px' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={95}
                />
                <YAxis stroke={TEXT_MUTED} style={{ fontSize: '11px' }} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,118,110,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="2017" name="2017" fill={SERIES.blue} radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="2023" name="2023" fill={SERIES.orange} radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {amrView === 'frequency' && (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={isolateFreqData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRIDLINE} vertical={false} />
                <XAxis dataKey="pathogen" stroke={TEXT_MUTED} style={{ fontSize: '10px' }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke={TEXT_MUTED} style={{ fontSize: '11px' }} unit="%" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,118,110,0.05)' }} />
                <Bar dataKey="share" name="Share of isolates" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {isolateFreqData.map((_, idx) => (
                    <Cell key={idx} fill={seriesColors[idx % seriesColors.length]} />
                  ))}
                  <LabelList dataKey="share" position="top" formatter={(v) => `${v}%`} style={{ fill: TEXT_PRIMARY, fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <p style={styles.footnote}>
          Based on {AMR_RESISTANCE_DATA.isolatesTested.toLocaleString('en-IN')} isolates tested nationwide in {AMR_RESISTANCE_DATA.asOf.slice(0, 4)}.
          E. coli resistance to fluoroquinolones rose from 26% (2017) to 38.5% (2023) — the exact class of
          drug-resistance trend this platform is built to catch earlier at the facility level.
        </p>
      </section>

      {/* Section: Vector-Borne Disease Burden */}
      <section className="glass-card" style={styles.section}>
        <div style={styles.sectionHeader}>
          <Bug size={18} color="#ea580c" />
          <h3 style={styles.sectionTitle}>Vector-Borne Disease Burden</h3>
        </div>
        <SourceTag source={VECTOR_BORNE_DISEASE_DATA.source} />

        <div style={styles.kpiRow3}>
          <StatTile
            label={`Dengue cases (${VECTOR_BORNE_DISEASE_DATA.dengue.year})`}
            value={VECTOR_BORNE_DISEASE_DATA.dengue.cases.toLocaleString('en-IN')}
            sub={`${VECTOR_BORNE_DISEASE_DATA.dengue.deaths} deaths · ${VECTOR_BORNE_DISEASE_DATA.dengue.sentinelHospitals} sentinel hospitals`}
          />
          <StatTile
            label={`Malaria API (${VECTOR_BORNE_DISEASE_DATA.malaria.year})`}
            value={`${VECTOR_BORNE_DISEASE_DATA.malaria.annualParasiteIncidencePerThousand}`}
            sub={`per 1,000 · down from ${VECTOR_BORNE_DISEASE_DATA.malaria.annualParasiteIncidence1995} in 1995 (−${VECTOR_BORNE_DISEASE_DATA.malaria.declinePercent}%)`}
          />
          <StatTile
            label="P. falciparum share of malaria"
            value={`${VECTOR_BORNE_DISEASE_DATA.malaria.pFalciparumSharePercent}%`}
            sub={`up from ${VECTOR_BORNE_DISEASE_DATA.malaria.pFalciparumShare1995Percent}% in 1995 — remaining cases concentrating in high-risk pockets`}
          />
        </div>
      </section>

      {/* Section: Simulated Pilot Data — explicit label */}
      <section className="glass-card" style={{ ...styles.section, borderColor: '#fde68a', background: '#fffbeb' }}>
        <div style={styles.sectionHeader}>
          <Info size={18} color="#d97706" />
          <h3 style={styles.sectionTitle}>Platform Pilot Snapshot</h3>
        </div>
        <div style={styles.simulatedBadge}>
          <span>⚠ Simulated data for demonstration — not a live national feed</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: TEXT_SECONDARY, marginTop: '0.5rem', maxWidth: '700px' }}>
          Calibrated to be plausible against real infrastructure counts above: an early pilot of{' '}
          {SIMULATED_PILOT_STATS.participatingFacilities} facilities (≈{(SIMULATED_PILOT_STATS.participatingFacilities / HEALTHCARE_INFRASTRUCTURE.totalFacilities * 100).toFixed(2)}%
          of ~{fmtCompact(HEALTHCARE_INFRASTRUCTURE.totalFacilities)} national facilities) generating{' '}
          {(SIMULATED_PILOT_STATS.reportsToday / SIMULATED_PILOT_STATS.participatingFacilities).toFixed(1)} reports/facility/day —
          a realistic busy-OPD volume, consistent with a 10–20 facility pilot-to-national roadmap.
        </p>
        <div style={styles.kpiRow4}>
          <StatTile label="Facilities reporting" value={SIMULATED_PILOT_STATS.participatingFacilities} />
          <StatTile label="Reports today" value={SIMULATED_PILOT_STATS.reportsToday.toLocaleString('en-IN')} />
          <StatTile label="Emerging signals" value={SIMULATED_PILOT_STATS.activeSignals} />
          <StatTile label="Active alerts" value={SIMULATED_PILOT_STATS.activeAlerts} />
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '2rem'
  },
  header: {
    marginBottom: '1.5rem'
  },
  section: {
    marginBottom: '1.5rem'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: TEXT_PRIMARY,
    margin: 0
  },
  sourceTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: TEXT_SECONDARY,
    marginBottom: '1rem',
    fontWeight: 500
  },
  kpiRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  kpiRow4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginTop: '1rem'
  },
  statTile: {
    padding: '1rem',
    background: '#ffffff'
  },
  statTileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: TEXT_MUTED,
    letterSpacing: '0.03em',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: TEXT_PRIMARY,
    marginTop: '0.35rem',
    lineHeight: 1.1
  },
  statSub: {
    fontSize: '0.75rem',
    color: TEXT_SECONDARY,
    marginTop: '0.3rem'
  },
  toggleRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  viewToggleBtn: {
    border: '1px solid #d1dfd6',
    background: '#ffffff',
    color: TEXT_SECONDARY,
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  viewToggleActive: {
    background: '#1b4d3e',
    color: '#ffffff',
    border: '1px solid #1b4d3e'
  },
  footnote: {
    fontSize: '0.8rem',
    color: TEXT_SECONDARY,
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #edf3ef'
  },
  simulatedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.78rem',
    fontWeight: 700,
    border: '1px solid #fde68a'
  },
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1dfd6',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(16,40,24,0.1)'
  }
};

export default NationalStatistics;
