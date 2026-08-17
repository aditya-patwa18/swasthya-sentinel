// Sourced national statistics — dated and citable.
// Distinguishes REAL government/ICMR data (safe to present as fact) from
// SIMULATED platform data (illustrative pilot numbers, always labeled as such).
// See project doc "Real Statistics for Dashboard" for full citations.

export const DATA_PROVENANCE = {
  real: {
    label: 'Verified National Data',
    description: 'Sourced from government and peer-reviewed reports, with citation and date.'
  },
  simulated: {
    label: 'Simulated Pilot Data',
    description: "Illustrative figures for this prototype's demo — not a live national feed."
  }
};

// ---------------------------------------------------------------------------
// 1. India Healthcare Infrastructure
// Source: MoHFW, "Health Dynamics of India (Infrastructure and Human
// Resources) 2022-23" (formerly Rural Health Statistics), as of 2023-03-31.
// ---------------------------------------------------------------------------
export const HEALTHCARE_INFRASTRUCTURE = {
  asOf: '2023-03-31',
  source: 'Ministry of Health & Family Welfare — Health Dynamics of India (Infrastructure and Human Resources) 2022-23',
  facilities: [
    { type: 'Sub-Centres (SCs)', count: 169615 },
    { type: 'Primary Health Centres (PHCs)', count: 31882, breakdown: { rural: 25354, urban: 6528 } },
    { type: 'Community Health Centres (CHCs)', count: 6359, breakdown: { rural: 5491, urban: 868 } },
    { type: 'Sub-Divisional / District Hospitals (SDHs)', count: 1340 },
    { type: 'District Hospitals (DHs)', count: 714 },
    { type: 'Medical Colleges', count: 362 }
  ],
  totalFacilities: 209910 // 169615 + 31882 + 6359 + 1340 + 714 (sum of rows above, excludes medical colleges)
};

// ---------------------------------------------------------------------------
// 2. ABDM (Ayushman Bharat Digital Mission)
// Source: Union MoS Health, written reply to Rajya Sabha, reported 2025-02-11
// (data collected till 2025-02-06). Official government-confirmed figure.
// ---------------------------------------------------------------------------
export const ABDM_STATS = {
  asOf: '2025-02-06',
  source: 'Union Minister of State for Health — written reply to Rajya Sabha (reported 2025-02-11)',
  abhaAccountsCrore: 73.98,
  abhaAccountsAbsolute: 739800000,
  healthRecordsLinkedCrore: 49.06,
  healthRecordsLinkedAbsolute: 490600000,
  facilitiesRegisteredLakh: 3.63,
  facilitiesRegisteredAbsolute: 363000,
  healthProfessionalsRegisteredLakh: 5.64,
  healthProfessionalsRegisteredAbsolute: 564000
};

// ---------------------------------------------------------------------------
// 3. AMR Resistance Rates — ICMR AMRSN/NARS-Net 2023 Annual Report
// Source: ICMR Antimicrobial Resistance Research & Surveillance Network,
// 7th Annual Report, Jan–Dec 2023, 99,492 isolates, tertiary care hospitals.
// ---------------------------------------------------------------------------
export const AMR_RESISTANCE_DATA = {
  asOf: '2023-12-31',
  source: 'ICMR AMRSN/NARS-Net — 7th Annual Report (Jan–Dec 2023), 99,492 isolates nationwide',
  isolatesTested: 99492,
  resistanceRates: [
    { pathogen: 'E. coli', antibiotic: 'Ciprofloxacin', type: 'Resistance', rate2023: 38.5, ratePrior: 26.0, priorYear: 2017, trend: 'up' },
    { pathogen: 'E. coli', antibiotic: 'Levofloxacin', type: 'Resistance', rate2023: 34.5, ratePrior: 31.3, priorYear: 2017, trend: 'up' },
    { pathogen: 'E. coli (blood isolates)', antibiotic: 'Carbapenems', type: 'Resistance', rate2023: 40.0, trend: 'flat' },
    { pathogen: 'Klebsiella pneumoniae (blood isolates)', antibiotic: '≥1 Carbapenem', type: 'Resistance', rate2023: 54.0, trend: 'flat' },
    { pathogen: 'Enterobacterales', antibiotic: 'Carbapenems (CRE)', type: 'Resistance', rate2023: 49.0, trend: 'up', note: 'increased from prior period' },
    { pathogen: 'Acinetobacter baumannii', antibiotic: 'Carbapenems', type: 'Resistance', rate2023: 88.0, trend: 'flat', note: 'no significant change vs. prior year' },
    { pathogen: 'Salmonella Typhi', antibiotic: 'Fluoroquinolones', type: 'Resistance', rate2023: 95.0, trend: 'flat', note: '>95% reported' },
    { pathogen: 'All pathogens', antibiotic: 'Piperacillin-tazobactam', type: 'Susceptibility', rate2023: 42.4, ratePrior: 56.8, priorYear: 2017, trend: 'down' },
    { pathogen: 'All pathogens', antibiotic: 'Amikacin', type: 'Susceptibility', rate2023: 68.2, ratePrior: 79.2, priorYear: 2017, trend: 'down' }
  ],
  isolateFrequency: [
    { pathogen: 'E. coli', percentOfIsolates: 23.2 },
    { pathogen: 'Klebsiella pneumoniae', percentOfIsolates: 16.3 },
    { pathogen: 'Acinetobacter baumannii', percentOfIsolates: 12.1 },
    { pathogen: 'Pseudomonas aeruginosa', percentOfIsolates: 11.8 },
    { pathogen: 'Staphylococcus aureus', percentOfIsolates: 8.9 }
  ]
};

// ---------------------------------------------------------------------------
// 4. Disease Burden — Vector-Borne Diseases
// Source: National Center for Vector Borne Diseases Control (NCVBDC), MoHFW.
// ---------------------------------------------------------------------------
export const VECTOR_BORNE_DISEASE_DATA = {
  source: 'National Center for Vector Borne Diseases Control (NCVBDC), MoHFW',
  dengue: {
    year: 2023,
    cases: 289235,
    deaths: 485,
    sentinelHospitals: 805,
    apexReferralLabs: 17
  },
  malaria: {
    year: 2024,
    annualParasiteIncidencePerThousand: 0.18,
    annualParasiteIncidence1995: 3.29,
    declinePercent: 94.5,
    pFalciparumCasesMillion: 0.15,
    pFalciparumCases1995Million: 1.14,
    totalPositivityRate: 0.14,
    totalPositivityRate1995: 3.50,
    pFalciparumSharePercent: 60.07,
    pFalciparumShare1995Percent: 39,
    deathsApproxPerYear: 1000
  }
};

// ---------------------------------------------------------------------------
// 5. SIMULATED platform pilot data — explicitly NOT a live national feed.
// Calibrated to be plausible against real infrastructure counts above:
// an early pilot of ~142 facilities (~0.07% of ~210K national facilities)
// generating ~19-20 reports/facility/day (realistic busy-OPD volume).
// ---------------------------------------------------------------------------
export const SIMULATED_PILOT_STATS = {
  isSimulated: true,
  label: 'Simulated data for demonstration',
  participatingFacilities: 142,
  reportsToday: 2716, // ~19.1 reports/facility/day
  activeSignals: 6,
  activeAlerts: 3,
  pilotStatesCovered: 7
};
