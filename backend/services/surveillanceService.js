const ClinicalReport = require('../models/ClinicalReport');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const Facility = require('../models/Facility');

/**
 * Runs surveillance algorithm for a specific condition/category and region
 */
const runSurveillance = async (report) => {
  try {
    const { diseaseCategory, suspectedCondition, city, district, state, facility: reportingFacilityId } = report;

    // 1. DISEASE CLUSTER DETECTION
    // Calculate dates
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtySevenDaysAgo = new Date(now.getTime() - 37 * 24 * 60 * 60 * 1000);

    // Recent window: past 7 days
    const recentReports = await ClinicalReport.find({
      suspectedCondition,
      state,
      reportDate: { $gte: sevenDaysAgo }
    });

    const recentCases = recentReports.reduce((sum, r) => sum + r.patientCount, 0);
    const recentAverage = recentCases / 7;

    // Baseline window: prior 30 days (from day -37 to day -7)
    const baselineReports = await ClinicalReport.find({
      suspectedCondition,
      state,
      reportDate: { $gte: thirtySevenDaysAgo, $lt: sevenDaysAgo }
    });

    const baselineCases = baselineReports.reduce((sum, r) => sum + r.patientCount, 0);
    const baselineAverage = baselineCases / 30;

    // Avoid division by zero, use a minimal baseline representing sporadic cases (0.1 per day)
    const effectiveBaselineAverage = baselineAverage || 0.2;
    const percentageIncrease = ((recentAverage - effectiveBaselineAverage) / effectiveBaselineAverage) * 100;

    // Count distinct reporting facilities in the recent window
    const uniqueFacilities = new Set(recentReports.map(r => r.facility.toString()));
    const facilityCount = uniqueFacilities.size;

    // Threshold logic:
    // Generate alert if case increase is >= 25% AND at least 2 facilities report it (or 1 clinic with high caseload, e.g. >= 15 cases)
    const thresholdPercentage = 25;
    const isCluster = (percentageIncrease >= thresholdPercentage && facilityCount >= 2) || (recentCases >= 15);

    if (isCluster) {
      // Determine risk level
      let riskLevel = 'Elevated';
      if (percentageIncrease >= 150 || recentCases >= 30) {
        riskLevel = 'Critical';
      } else if (percentageIncrease >= 75 || facilityCount >= 4) {
        riskLevel = 'High';
      }

      // Calculate confidence score (0 to 100)
      // Trend strength (up to 40) + Facility coverage (up to 30) + Case volume (up to 30)
      const trendComponent = Math.min(40, (percentageIncrease / 10));
      const facilityComponent = Math.min(30, facilityCount * 10);
      const volumeComponent = Math.min(30, recentCases * 1.5);
      const confidenceScore = Math.round(trendComponent + facilityComponent + volumeComponent);

      const region = `${city} Metropolitan Region`;
      const reason = `${suspectedCondition} activity is ${Math.round(percentageIncrease)}% above baseline, reported by ${facilityCount} facilities with ${recentCases} cases in the past week.`;

      // Check if an active alert for this condition and state already exists
      let alert = await Alert.findOne({
        type: 'Disease Cluster',
        condition: suspectedCondition,
        state,
        status: { $in: ['New', 'Under Investigation'] }
      });

      if (alert) {
        // Update existing alert with new stats
        alert.currentValue = recentCases;
        alert.percentageIncrease = Math.round(percentageIncrease);
        alert.facilityCount = facilityCount;
        alert.confidenceScore = confidenceScore;
        alert.riskLevel = riskLevel;
        alert.reason = reason;
        await alert.save();
      } else {
        // Create new alert
        alert = await Alert.create({
          type: 'Disease Cluster',
          condition: suspectedCondition,
          region,
          state,
          district,
          baselineValue: Math.round(effectiveBaselineAverage * 7), // 7-day expected cases
          currentValue: recentCases,
          percentageIncrease: Math.round(percentageIncrease),
          facilityCount,
          confidenceScore,
          riskLevel,
          reason,
          status: 'New',
          detectedAt: new Date()
        });

        // Broadcast notification to Health Authorities
        await Notification.create({
          roleScope: 'authority',
          title: `⚠️ New Outbreak Alert: ${suspectedCondition}`,
          message: `Potential disease cluster detected in ${state}. Risk Level: ${riskLevel}. Confidence: ${confidenceScore}%.`,
          type: 'alert'
        });
      }
    }

    // 2. AMR SIGNAL DETECTION
    if (report.labPerformed && report.pathogen && report.resistance === 'Resistant') {
      const { pathogen, antibioticName } = report;

      // Scan all records in this state for this pathogen in the last 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const pathogenReports = await ClinicalReport.find({
        pathogen,
        state,
        reportDate: { $gte: thirtyDaysAgo }
      });

      const totalIsolates = pathogenReports.length;
      const resistantIsolates = pathogenReports.filter(r => r.resistance === 'Resistant' && r.antibioticName === antibioticName).length;

      // Calculate resistance rate
      const resistanceRate = totalIsolates > 0 ? (resistantIsolates / totalIsolates) * 100 : 0;

      // Threshold: if we have at least 3 resistant isolates of this pathogen and resistance is >= 20%
      if (resistantIsolates >= 3 && resistanceRate >= 20) {
        const region = `${district || city}, ${state}`;
        const reason = `Reduced susceptibility detected for ${pathogen} against ${antibioticName} in ${region} (${Math.round(resistanceRate)}% resistant cases of ${totalIsolates} isolates).`;

        let amrAlert = await Alert.findOne({
          type: 'AMR Signal',
          condition: `Reduced Susceptibility — ${pathogen}`,
          state,
          status: { $in: ['New', 'Under Investigation'] }
        });

        if (amrAlert) {
          amrAlert.currentValue = Math.round(resistanceRate);
          amrAlert.percentageIncrease = Math.round((resistanceRate / 5) * 100); // comparison to a low baseline (e.g. 5%)
          amrAlert.reason = reason;
          await amrAlert.save();
        } else {
          await Alert.create({
            type: 'AMR Signal',
            condition: `Reduced Susceptibility — ${pathogen}`,
            region,
            state,
            district,
            baselineValue: 5, // typical baseline resistance %
            currentValue: Math.round(resistanceRate),
            percentageIncrease: Math.round(((resistanceRate - 5) / 5) * 100),
            facilityCount: new Set(pathogenReports.map(p => p.facility.toString())).size,
            confidenceScore: Math.min(100, 50 + resistantIsolates * 5),
            riskLevel: resistanceRate >= 35 ? 'Critical' : 'High',
            reason,
            status: 'New',
            detectedAt: new Date()
          });

          await Notification.create({
            roleScope: 'authority',
            title: `🚨 AMR Watch alert: ${pathogen}`,
            message: `Reduced susceptibility signal of ${pathogen} detected in ${region}.`,
            type: 'alert'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error running surveillance algorithm:', error);
  }
};

module.exports = {
  runSurveillance
};
