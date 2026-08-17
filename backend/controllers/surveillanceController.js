const ClinicalReport = require('../models/ClinicalReport');
const Alert = require('../models/Alert');
const Facility = require('../models/Facility');

// @desc    Get aggregated surveillance overview statistics
// @route   GET /api/surveillance/overview
// @access  Private (Authority, Admin)
exports.getOverview = async (req, res) => {
  try {
    const totalFacilities = await Facility.countDocuments({ isActive: true });
    
    // Reports in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reportsToday = await ClinicalReport.aggregate([
      { $match: { reportDate: { $gte: oneDayAgo } } },
      { $group: { _id: null, totalPatients: { $sum: '$patientCount' } } }
    ]);
    const patientsTodayCount = reportsToday.length > 0 ? reportsToday[0].totalPatients : 0;

    // Active outbreak signals
    const activeSignals = await Alert.countDocuments({
      type: 'Disease Cluster',
      status: { $in: ['New', 'Under Investigation'] }
    });

    // Active AMR signals
    const amrSignals = await Alert.countDocuments({
      type: 'AMR Signal',
      status: { $in: ['New', 'Under Investigation'] }
    });

    // Unique regions (states/districts) under monitoring (those with active alerts)
    const monitoredRegions = await Alert.distinct('state', {
      status: { $in: ['New', 'Under Investigation'] }
    });
    const regionsCount = monitoredRegions.length;

    res.status(200).json({
      success: true,
      stats: {
        participatingFacilities: totalFacilities,
        reportsToday: patientsTodayCount,
        activeSignals,
        regionsUnderMonitoring: regionsCount,
        amrSignals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get disease activity trends for charts
// @route   GET /api/surveillance/trends
// @access  Private
exports.getTrends = async (req, res) => {
  try {
    const { days = 30, state, district, diseaseCategory, facility } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let matchQuery = {
      reportDate: { $gte: startDate }
    };

    if (state) matchQuery.state = state;
    if (district) matchQuery.district = district;
    if (diseaseCategory) matchQuery.diseaseCategory = diseaseCategory;
    if (facility) matchQuery.facility = facility;

    // Group reports by date and category
    const trendData = await ClinicalReport.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$reportDate' } },
            category: '$diseaseCategory'
          },
          patientCount: { $sum: '$patientCount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format data into Recharts-friendly structure
    // e.g. [{ date: '2026-08-10', Respiratory: 5, Fever: 12, ... }]
    const formattedMap = {};
    
    // Initialize days in range to ensure empty dates are represented
    for (let i = 0; i < parseInt(days); i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      formattedMap[dateStr] = {
        date: dateStr,
        Respiratory: 0,
        Gastrointestinal: 0,
        'Vector-borne': 0,
        Fever: 0,
        Skin: 0,
        Neurological: 0,
        Other: 0
      };
    }

    trendData.forEach(item => {
      const { date, category } = item._id;
      if (formattedMap[date]) {
        formattedMap[date][category] = item.patientCount;
      }
    });

    const trends = Object.values(formattedMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get geographical hotspots for map
// @route   GET /api/surveillance/map
// @access  Private (Authority, Admin)
exports.getMapData = async (req, res) => {
  try {
    // Compile coordinates and stats grouped by state & city
    const stateAggregates = await ClinicalReport.aggregate([
      {
        $group: {
          _id: { state: '$state', city: '$city' },
          caseCount: { $sum: '$patientCount' },
          reportCount: { $sum: 1 }
        }
      }
    ]);

    // Query active alerts to map onto geographic points
    const activeAlerts = await Alert.find({
      status: { $in: ['New', 'Under Investigation'] }
    });

    // Provide pre-defined mockup coordinates for Indian States if geocoding isn't available
    const stateCoordinates = {
      'Maharashtra': { lat: 19.7515, lng: 75.7139 },
      'Karnataka': { lat: 15.3173, lng: 75.7139 },
      'Gujarat': { lat: 22.2587, lng: 71.1924 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
      'Kerala': { lat: 10.8505, lng: 76.2711 },
      'Rajasthan': { lat: 27.0238, lng: 74.2179 }
    };

    const hotspots = stateAggregates.map(agg => {
      const { state, city } = agg._id;
      const coords = stateCoordinates[state] || { lat: 20.5937, lng: 78.9629 }; // default central India
      
      // Check if there is an active alert in this state
      const stateAlerts = activeAlerts.filter(a => a.state === state);
      
      let maxRisk = 'Normal';
      if (stateAlerts.some(a => a.riskLevel === 'Critical')) maxRisk = 'Critical';
      else if (stateAlerts.some(a => a.riskLevel === 'High')) maxRisk = 'High';
      else if (stateAlerts.some(a => a.riskLevel === 'Elevated')) maxRisk = 'Elevated';

      return {
        state,
        city,
        caseCount: agg.caseCount,
        reportCount: agg.reportCount,
        latitude: coords.lat,
        longitude: coords.lng,
        riskLevel: maxRisk,
        activeAlertsCount: stateAlerts.length,
        alerts: stateAlerts.map(a => ({
          id: a._id,
          condition: a.condition,
          risk: a.riskLevel,
          type: a.type
        }))
      };
    });

    res.status(200).json({
      success: true,
      hotspots
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get chronological feed of reports and signals
// @route   GET /api/surveillance/feed
// @access  Private
exports.getFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    
    // Compile items from Alerts and Clinical Reports into a unified feed
    const alerts = await Alert.find().sort('-createdAt').limit(limit);
    const reports = await ClinicalReport.find().populate('facility', 'name').sort('-createdAt').limit(limit);

    let feed = [];

    alerts.forEach(a => {
      feed.push({
        id: a._id,
        type: 'alert_generated',
        alertType: a.type,
        title: a.type === 'AMR Signal' ? 'AMR Alert Detected' : 'Outbreak Cluster Detected',
        message: a.reason,
        region: a.region,
        riskLevel: a.riskLevel,
        timestamp: a.createdAt
      });
    });

    reports.forEach(r => {
      feed.push({
        id: r._id,
        type: 'report_submitted',
        title: 'New Clinical Report',
        message: `${r.patientCount} case(s) of suspected ${r.suspectedCondition} submitted by ${r.facility.name}`,
        region: `${r.city}, ${r.state}`,
        riskLevel: r.diagnosisStatus === 'Confirmed' ? 'Elevated' : 'Normal',
        timestamp: r.createdAt
      });
    });

    // Sort by timestamp desc
    feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    feed = feed.slice(0, limit);

    res.status(200).json({
      success: true,
      feed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
