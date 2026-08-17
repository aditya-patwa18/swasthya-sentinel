const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Facility = require('../models/Facility');
const ClinicalReport = require('../models/ClinicalReport');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const Investigation = require('../models/Investigation');

const runSeeder = async () => {
  try {
    // 1. Clear existing database collections
    await User.deleteMany({});
    await Facility.deleteMany({});
    await ClinicalReport.deleteMany({});
    await Alert.deleteMany({});
    await Notification.deleteMany({});
    await Investigation.deleteMany({});

    console.log('Database cleared.');

    // 2. Create Facilities (20+ facilities in India)
    const facilitiesData = [
      { name: 'Sunrise Multispeciality Clinic', type: 'Clinic', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Bandra Dispensary', type: 'Dispensary', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.0596, longitude: 72.8295 },
      { name: 'Mumbai General Hospital', type: 'Hospital', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', latitude: 18.9438, longitude: 72.8359 },
      { name: 'Andheri Diagnostics & Lab', type: 'Laboratory', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.1136, longitude: 72.8697 },
      
      { name: 'Pune General Hospital', type: 'Hospital', city: 'Pune', district: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
      { name: 'Deccan Clinic', type: 'Clinic', city: 'Pune', district: 'Pune', state: 'Maharashtra', latitude: 18.5144, longitude: 73.8407 },
      
      { name: 'Hubli Health Clinic', type: 'Clinic', city: 'Hubli', district: 'Dharwad', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
      { name: 'Belagavi Dispensary', type: 'Dispensary', city: 'Belagavi', district: 'Belagavi', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977 },
      { name: 'Karnataka Apex Lab', type: 'Laboratory', city: 'Dharwad', district: 'Dharwad', state: 'Karnataka', latitude: 15.4589, longitude: 75.0078 },
      { name: 'Bangalore Medical Center', type: 'Hospital', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
      
      { name: 'Delhi Health Center', type: 'Hospital', city: 'Delhi', district: 'New Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
      { name: 'Connaught Place Clinic', type: 'Clinic', city: 'Delhi', district: 'Central Delhi', state: 'Delhi', latitude: 28.6304, longitude: 77.2177 },
      
      { name: 'Ahmedabad General Hospital', type: 'Hospital', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
      { name: 'Gujarat Health Lab', type: 'Laboratory', city: 'Gandhinagar', district: 'Gandhinagar', state: 'Gujarat', latitude: 23.2156, longitude: 72.6369 },
      
      { name: 'Jaipur Health Clinic', type: 'Clinic', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
      { name: 'Kochi Medical College', type: 'Hospital', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
      { name: 'Trivandrum Dispensary', type: 'Dispensary', city: 'Trivandrum', district: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366 },
      
      { name: 'Chennai Central Hospital', type: 'Hospital', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
      { name: 'Coimbatore Diagnostics', type: 'Laboratory', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
      { name: 'Jodhpur Clinic', type: 'Clinic', city: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 }
    ];

    const facilities = await Facility.insertMany(facilitiesData);
    console.log(`${facilities.length} facilities created.`);

    // 3. Create Users
    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'Dr. Ananya Sharma',
        email: 'doctor@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43210',
        facility: facilities[0]._id, // Sunrise Clinic, Mumbai
        department: 'General Medicine',
        city: 'Mumbai',
        state: 'Maharashtra',
        isActive: true
      },
      {
        name: 'Dr. Ramesh Kumar',
        email: 'doctor2@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43211',
        facility: facilities[6]._id, // Hubli Health Clinic, Karnataka
        department: 'Pediatrics',
        city: 'Hubli',
        state: 'Karnataka',
        isActive: true
      },
      {
        name: 'Dr. Suresh Patel',
        email: 'doctor3@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43212',
        facility: facilities[10]._id, // Delhi Health Center
        department: 'Pulmonology',
        city: 'Delhi',
        state: 'Delhi',
        isActive: true
      },
      {
        name: 'Dr. Vikram Mehra',
        email: 'doctor4@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43213',
        facility: facilities[4]._id, // Pune General Hospital
        department: 'Internal Medicine',
        city: 'Pune',
        state: 'Maharashtra',
        isActive: true
      },
      {
        name: 'Dr. Rajesh Patel',
        email: 'doctor5@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43214',
        facility: facilities[12]._id, // Ahmedabad General
        department: 'Infectious Diseases',
        city: 'Ahmedabad',
        state: 'Gujarat',
        isActive: true
      },
      {
        name: 'Dr. Priya Nair',
        email: 'doctor6@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43215',
        facility: facilities[15]._id, // Kochi Medical College
        department: 'General Medicine',
        city: 'Kochi',
        state: 'Kerala',
        isActive: true
      },
      {
        name: 'Dr. S. Ramakrishnan',
        email: 'doctor7@epiwatch.org',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 98765 43216',
        facility: facilities[17]._id, // Chennai Central Hospital
        department: 'Emergency Medicine',
        city: 'Chennai',
        state: 'Tamil Nadu',
        isActive: true
      },
      {
        name: 'Kavita Rao',
        email: 'lab@epiwatch.org',
        password: hashedPassword,
        role: 'lab',
        phone: '+91 98765 43220',
        facility: facilities[8]._id, // Karnataka Apex Lab, Dharwad
        department: 'Microbiology Lab',
        city: 'Dharwad',
        state: 'Karnataka',
        isActive: true
      },
      {
        name: 'Rajeev Chandrasekhar',
        email: 'authority@epiwatch.gov.in',
        password: hashedPassword,
        role: 'authority',
        phone: '+91 99999 88888',
        city: 'Delhi',
        state: 'Delhi',
        isActive: true
      },
      {
        name: 'Super Admin User',
        email: 'admin@epiwatch.gov.in',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 11111 22222',
        city: 'Delhi',
        state: 'Delhi',
        isActive: true
      }
    ];

    const users = await User.insertMany(usersData);
    console.log(`${users.length} users created.`);

    const drAnanya = users[0];
    const drRamesh = users[1];
    const drSuresh = users[2];
    const drVikram = users[3];
    const drRajesh = users[4];
    const drPriya = users[5];
    const drRamakrishnan = users[6];
    const labKavita = users[7];
    const authorityUser = users[8];

    // 4. Create Historical & Recent Reports (100+)
    const reportsData = [];
    const now = new Date();

    // Helper to generate dates in range [now - X days]
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    // --- MOCK SCENARIO 1: MUMBAI RESPIRATORY OUTBREAK CLUSTER ---
    // Background: Normal baseline of Influenza-like Illness is ~1-2 cases per week.
    // In the last 7 days, multiple facilities in Mumbai report large patient clusters.
    
    // Historical Mumbai (Baseline): sporadic respiratory cases 10 to 35 days ago
    for (let day = 8; day <= 35; day += 3) {
      reportsData.push({
        reportingDoctor: drAnanya._id,
        facility: facilities[0]._id, // Sunrise Clinic
        reportDate: daysAgo(day),
        department: 'General Medicine',
        chiefComplaint: 'Cough and running nose',
        symptoms: ['Fever', 'Cough', 'Body Ache'],
        symptomDuration: 3,
        patientCount: Math.floor(Math.random() * 2) + 1, // 1-2 cases
        ageGroup: 'Adult (19-60)',
        area: 'Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra',
        diseaseCategory: 'Respiratory',
        suspectedCondition: 'Influenza-like Illness',
        diagnosisStatus: 'Suspected',
        labPerformed: false
      });

      reportsData.push({
        reportingDoctor: drAnanya._id,
        facility: facilities[1]._id, // Bandra Dispensary
        reportDate: daysAgo(day + 1),
        department: 'Outpatient',
        chiefComplaint: 'Mild chest pain and dry cough',
        symptoms: ['Cough', 'Fatigue'],
        symptomDuration: 5,
        patientCount: 1,
        ageGroup: 'Geriatric (60+)',
        area: 'Mumbai', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra',
        diseaseCategory: 'Respiratory',
        suspectedCondition: 'Influenza-like Illness',
        diagnosisStatus: 'Probable',
        labPerformed: false
      });
    }

    // Recent Mumbai spike (Last 7 days): Multiple clinics report clusters
    const recentMumbaiCases = [
      { doc: drAnanya, fac: facilities[0], count: 8, days: 1, sym: ['Fever', 'Cough', 'Sore Throat', 'Shortness of Breath'] },
      { doc: drAnanya, fac: facilities[0], count: 12, days: 3, sym: ['Fever', 'Cough', 'Fatigue'] },
      { doc: drAnanya, fac: facilities[1], count: 6, days: 2, sym: ['Cough', 'Runny Nose', 'Fever'] },
      { doc: drAnanya, fac: facilities[2], count: 14, days: 4, sym: ['Fever', 'Dry Cough', 'Difficulty Breathing'] },
      { doc: drAnanya, fac: facilities[2], count: 10, days: 5, sym: ['Fever', 'Sore Throat', 'Headache'] },
      { doc: drAnanya, fac: facilities[3], count: 7, days: 6, sym: ['Cough', 'Fever', 'Congestion'] }
    ];

    recentMumbaiCases.forEach((c, index) => {
      reportsData.push({
        reportingDoctor: c.doc._id,
        facility: c.fac._id,
        reportDate: daysAgo(c.days),
        department: 'General Medicine',
        chiefComplaint: 'Acute onset of high fever and severe dry cough',
        symptoms: c.sym,
        symptomDuration: 4,
        patientCount: c.count,
        ageGroup: index % 2 === 0 ? 'Adult (19-60)' : 'Pediatric (0-12)',
        area: 'Mumbai', city: 'Mumbai', district: c.fac.district, state: 'Maharashtra',
        diseaseCategory: 'Respiratory',
        suspectedCondition: 'Influenza-like Illness',
        diagnosisStatus: 'Suspected',
        labPerformed: index % 3 === 0,
        testName: index % 3 === 0 ? 'Influenza A Rapid Antigen' : '',
        testResult: index % 3 === 0 ? 'Positive' : ''
      });
    });


    // --- MOCK SCENARIO 2: NORTH KARNATAKA AMR RESISTANCE (E. COLI VS CIPRO) ---
    // Background: Lab reports from Dharwad/Hubli showing E. coli urinary infections with high resistance rates to Ciprofloxacin.
    
    // Karnataka reports (AMR dataset)
    const pathogens = ['E. coli', 'Klebsiella pneumoniae', 'Staphylococcus aureus'];
    const antibiotics = [
      { name: 'Ciprofloxacin', class: 'Fluoroquinolones' },
      { name: 'Ceftriaxone', class: 'Cephalosporins' },
      { name: 'Amoxicillin', class: 'Penicillins' }
    ];

    // Seed 15 lab reports in Dharwad/Hubli state Karnataka over last 30 days
    for (let i = 1; i <= 20; i++) {
      const isRecent = i <= 8;
      const isResistant = i % 3 !== 0; // 66% resistance rate for Ciprofloxacin
      
      reportsData.push({
        reportingDoctor: drRamesh._id,
        facility: facilities[6]._id, // Hubli Health Clinic
        reportDate: daysAgo(isRecent ? i : i + 7),
        department: 'Urology',
        chiefComplaint: 'Burning micturition and lower abdominal pain',
        symptoms: ['Dysuria', 'Frequency', 'Lower Abdominal Pain'],
        symptomDuration: 3,
        patientCount: 1,
        ageGroup: 'Adult (19-60)',
        area: 'Hubli', city: 'Hubli', district: 'Dharwad', state: 'Karnataka',
        diseaseCategory: 'Gastrointestinal', // or general/other
        suspectedCondition: 'Urinary Tract Infection',
        diagnosisStatus: 'Confirmed',
        confirmedDiagnosis: 'E. coli Urinary Tract Infection',
        labPerformed: true,
        testName: 'Urine Culture & Sensitivity',
        testResult: 'Growth of Escherichia coli',
        cultureResult: 'E. coli > 10^5 CFU/mL',
        pathogen: 'E. coli',
        antibioticPrescribed: true,
        antibioticName: 'Ciprofloxacin',
        antibioticClass: 'Fluoroquinolones',
        resistance: isResistant ? 'Resistant' : 'Susceptible',
        susceptibility: isResistant ? 'Amikacin, Meropenem' : 'Ciprofloxacin, Ceftriaxone'
      });
    }

    // --- MOCK SCENARIO 2b: LAB-SUBMITTED AMR ISOLATES (Kavita Rao, Karnataka Apex Lab) ---
    // Broader pathogen panel so AMR Watch shows more than one organism/antibiotic pair.
    const labPanel = [
      { pathogen: 'Klebsiella pneumoniae', antibiotic: 'Ceftriaxone', class: 'Cephalosporins', resistant: true, sus: 'Meropenem, Amikacin' },
      { pathogen: 'Klebsiella pneumoniae', antibiotic: 'Meropenem', class: 'Other', resistant: false, sus: '' },
      { pathogen: 'Acinetobacter baumannii', antibiotic: 'Meropenem', class: 'Other', resistant: true, sus: 'Colistin' },
      { pathogen: 'Staphylococcus aureus', antibiotic: 'Amoxicillin', class: 'Penicillins', resistant: true, sus: 'Vancomycin' },
      { pathogen: 'Staphylococcus aureus', antibiotic: 'Ciprofloxacin', class: 'Fluoroquinolones', resistant: false, sus: '' },
      { pathogen: 'Pseudomonas aeruginosa', antibiotic: 'Ceftazidime', class: 'Cephalosporins', resistant: true, sus: 'Meropenem, Amikacin' },
      { pathogen: 'Salmonella Typhi', antibiotic: 'Ciprofloxacin', class: 'Fluoroquinolones', resistant: true, sus: 'Ceftriaxone' }
    ];
    labPanel.forEach((p, i) => {
      reportsData.push({
        reportingDoctor: labKavita._id,
        facility: facilities[8]._id, // Karnataka Apex Lab
        reportDate: daysAgo(i + 1),
        department: 'Microbiology Lab',
        chiefComplaint: 'Culture and sensitivity referral',
        symptoms: ['Fever'],
        symptomDuration: 3,
        patientCount: 1,
        ageGroup: 'Adult (19-60)',
        area: 'Dharwad', city: 'Dharwad', district: 'Dharwad', state: 'Karnataka',
        diseaseCategory: 'Other',
        suspectedCondition: 'Suspected Infection',
        diagnosisStatus: 'Confirmed',
        confirmedDiagnosis: `${p.pathogen} infection`,
        labPerformed: true,
        testName: 'Culture & Sensitivity',
        testResult: `Growth of ${p.pathogen}`,
        cultureResult: `${p.pathogen} isolated`,
        pathogen: p.pathogen,
        antibioticPrescribed: true,
        antibioticName: p.antibiotic,
        antibioticClass: p.class,
        resistance: p.resistant ? 'Resistant' : 'Susceptible',
        susceptibility: p.sus
      });
    });

    // --- GENERAL PROTO-DATA: NATIONWIDE SPORADIC CASES ---
    // Seed general cases for other states (Delhi, Gujarat, Kerala, Tamil Nadu, Rajasthan)
    const conditions = [
      { cat: 'Fever', cond: 'Dengue Fever', symptoms: ['Fever', 'Joint Pain', 'Headache', 'Rashes'] },
      { cat: 'Gastrointestinal', cond: 'Acute Gastroenteritis', symptoms: ['Diarrhea', 'Vomiting', 'Nausea', 'Abdominal Cramps'] },
      { cat: 'Vector-borne', cond: 'Malaria', symptoms: ['Fever', 'Chills', 'Sweating', 'Anemia'] },
      { cat: 'Skin', cond: 'Scabies', symptoms: ['Itching', 'Skin Rashes'] },
      { cat: 'Neurological', cond: 'Aseptic Meningitis', symptoms: ['Headache', 'Stiff Neck', 'Fever'] }
    ];

    const targetDoctors = [
      { doc: drSuresh, fac: facilities[10] }, // Delhi
      { doc: drRajesh, fac: facilities[12] }, // Gujarat
      { doc: drPriya, fac: facilities[15] },  // Kerala
      { doc: drRamakrishnan, fac: facilities[17] } // Tamil Nadu
    ];

    targetDoctors.forEach(({ doc, fac }) => {
      // Create ~10 reports per doc over the last 30 days
      for (let day = 1; day <= 25; day += 3) {
        const randCond = conditions[Math.floor(Math.random() * conditions.length)];
        const patients = Math.floor(Math.random() * 3) + 1;
        const prescribeAb = Math.random() > 0.4;
        const selectAb = antibiotics[Math.floor(Math.random() * antibiotics.length)];

        reportsData.push({
          reportingDoctor: doc._id,
          facility: fac._id,
          reportDate: daysAgo(day),
          department: doc.department || 'Outpatient',
          chiefComplaint: `Presents with acute ${randCond.cat.toLowerCase()} symptoms`,
          symptoms: randCond.symptoms,
          symptomDuration: Math.floor(Math.random() * 5) + 2,
          patientCount: patients,
          ageGroup: day % 3 === 0 ? 'Pediatric (0-12)' : 'Adult (19-60)',
          area: fac.city, city: fac.city, district: fac.district, state: fac.state,
          diseaseCategory: randCond.cat,
          suspectedCondition: randCond.cond,
          diagnosisStatus: Math.random() > 0.5 ? 'Confirmed' : 'Suspected',
          labPerformed: Math.random() > 0.6,
          testName: Math.random() > 0.6 ? 'Complete Blood Count / Diagnostic Kit' : '',
          testResult: 'Normal / Presumptive Positive',
          antibioticPrescribed: prescribeAb,
          antibioticName: prescribeAb ? selectAb.name : '',
          antibioticClass: prescribeAb ? selectAb.class : '',
          resistance: prescribeAb && Math.random() > 0.7 ? 'Resistant' : 'None'
        });
      }
    });

    const insertedReports = await ClinicalReport.insertMany(reportsData);
    console.log(`${insertedReports.length} clinical reports created.`);


    // 5. Pre-create Alert Cases ( मुंबई Respiratory and कर्नाटक AMR Signals )
    const alertsData = [
      {
        type: 'Disease Cluster',
        condition: 'Influenza-like Illness',
        region: 'Mumbai Metropolitan Region',
        state: 'Maharashtra',
        district: 'Mumbai City',
        baselineValue: 5,
        currentValue: 57,
        percentageIncrease: 1040,
        facilityCount: 4,
        confidenceScore: 92,
        riskLevel: 'Critical',
        reason: 'Influenza-like Illness activity is 1040% above baseline, reported by 4 facilities with 57 cases in the past week.',
        status: 'New',
        detectedAt: daysAgo(2)
      },
      {
        type: 'AMR Signal',
        condition: 'Reduced Susceptibility — E. coli',
        region: 'Dharwad, Karnataka',
        state: 'Karnataka',
        district: 'Dharwad',
        baselineValue: 5,
        currentValue: 66,
        percentageIncrease: 1220,
        facilityCount: 2,
        confidenceScore: 78,
        riskLevel: 'High',
        reason: 'E. coli shows reduced susceptibility to Ciprofloxacin in Dharwad, Karnataka (66% resistant cases of 15 isolates).',
        status: 'Under Investigation',
        detectedAt: daysAgo(3),
        acknowledgedAt: daysAgo(2)
      },
      {
        type: 'Disease Cluster',
        condition: 'Dengue Fever',
        region: 'Delhi Central',
        state: 'Delhi',
        district: 'Central Delhi',
        baselineValue: 4,
        currentValue: 9,
        percentageIncrease: 125,
        facilityCount: 2,
        confidenceScore: 56,
        riskLevel: 'Elevated',
        reason: 'Dengue Fever activity is 125% above baseline, reported by 2 facilities with 9 cases in the past week.',
        status: 'Resolved',
        detectedAt: daysAgo(10),
        acknowledgedAt: daysAgo(9),
        resolvedAt: daysAgo(1)
      },
      {
        type: 'AMR Signal',
        condition: 'Carbapenem-Resistant Acinetobacter baumannii',
        region: 'Dharwad, Karnataka',
        state: 'Karnataka',
        district: 'Dharwad',
        baselineValue: 2,
        currentValue: 4,
        percentageIncrease: 100,
        facilityCount: 1,
        confidenceScore: 71,
        riskLevel: 'High',
        reason: 'Karnataka Apex Lab reports carbapenem resistance in Acinetobacter baumannii isolates, consistent with the national ICMR AMRSN trend (88% resistance, 2023).',
        status: 'New',
        detectedAt: daysAgo(1)
      },
      {
        type: 'Disease Cluster',
        condition: 'Acute Gastroenteritis',
        region: 'Chennai Metropolitan Region',
        state: 'Tamil Nadu',
        district: 'Chennai',
        baselineValue: 6,
        currentValue: 15,
        percentageIncrease: 150,
        facilityCount: 1,
        confidenceScore: 64,
        riskLevel: 'Elevated',
        reason: 'Acute Gastroenteritis activity is 150% above baseline in Chennai, reported by Chennai Central Hospital over the past week.',
        status: 'Under Investigation',
        detectedAt: daysAgo(4),
        acknowledgedAt: daysAgo(3)
      }
    ];

    const alerts = await Alert.insertMany(alertsData);
    console.log(`${alerts.length} alerts created.`);

    // 6. Pre-create Investigation log for the Karnataka AMR Signal
    await Investigation.create({
      alert: alerts[1]._id,
      authority: authorityUser._id,
      status: 'Under Investigation',
      notes: [
        {
          author: 'System Surveillance',
          text: 'Alert auto-generated. Elevated Ciprofloxacin resistance (66%) observed in E. coli isolates in Dharwad district.',
          createdAt: daysAgo(3)
        },
        {
          author: authorityUser.name,
          text: 'Acknowledged. Querying contributing laboratories. Recommending Hubli Health Clinic to double check local guidelines for urinary tract infections.',
          createdAt: daysAgo(2)
        },
        {
          author: 'Dr. Ramesh Kumar',
          text: 'Hubli Clinic is reviewing prescribing files. Most isolates represent adult female uncomplicated cystitis. We are coordinating culture verification.',
          createdAt: daysAgo(1)
        }
      ]
    });

    // 7. Pre-create Investigation log for Resolved Dengue Signal
    await Investigation.create({
      alert: alerts[2]._id,
      authority: authorityUser._id,
      status: 'Resolved',
      notes: [
        {
          author: 'System Surveillance',
          text: 'Dengue Cluster alert generated.',
          createdAt: daysAgo(10)
        },
        {
          author: authorityUser.name,
          text: 'Alert acknowledged. Vector control teams dispatched to Central Delhi for source reduction.',
          createdAt: daysAgo(9)
        },
        {
          author: authorityUser.name,
          text: 'Larval indices have stabilized and new reports dropped to normal. Closing surveillance entry.',
          createdAt: daysAgo(1)
        }
      ]
    });

    // 8. Create Notifications
    const notificationsData = [
      {
        roleScope: 'authority',
        title: '⚠️ New Outbreak Alert: Influenza-like Illness',
        message: 'Potential disease cluster detected in Mumbai. Risk Level: Critical. Confidence: 92%.',
        type: 'alert',
        createdAt: daysAgo(2)
      },
      {
        roleScope: 'authority',
        title: '🚨 AMR Watch alert: E. coli',
        message: 'Reduced susceptibility signal of E. coli detected in Dharwad, Karnataka.',
        type: 'alert',
        createdAt: daysAgo(3)
      },
      {
        user: drAnanya._id,
        title: 'Outbreak Warning in Your Region',
        message: 'Health authorities have triggered an alert for Influenza-like Illness in Mumbai. Review clinic guidelines.',
        type: 'alert',
        createdAt: daysAgo(1)
      }
    ];

    await Notification.insertMany(notificationsData);
    console.log('Notifications created.');
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

module.exports = runSeeder;

// Allow direct execution
if (require.main === module) {
  dotenv = require('dotenv');
  dotenv.config();
  connectDB = require('../config/db');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/epiwatch')
    .then(async () => {
      await runSeeder();
      mongoose.connection.close();
    })
    .catch(err => {
      console.error(err);
    });
}
