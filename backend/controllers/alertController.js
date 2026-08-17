const Alert = require('../models/Alert');
const Investigation = require('../models/Investigation');
const ClinicalReport = require('../models/ClinicalReport');
const Notification = require('../models/Notification');

// @desc    Get all surveillance alerts
// @route   GET /api/alerts
// @access  Private (Authority, Admin, Doctor - doctor can see alerts filtered for facility/state)
exports.getAlerts = async (req, res) => {
  try {
    let query = {};

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.riskLevel) {
      query.riskLevel = req.query.riskLevel;
    }
    
    // Doctor can only see alerts relevant to their state
    if (req.user.role === 'doctor') {
      query.state = req.user.state;
    }

    const alerts = await Alert.find(query).sort('-detectedAt');

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get alert details & associated investigation log
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    // Get investigation log
    const investigation = await Investigation.findOne({ alert: alert._id })
      .populate('authority', 'name email');

    // Get contributing facilities in the same state for the condition in the last 15 days
    const fifteenDaysAgo = new Date(alert.detectedAt.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    let contributingReports = [];
    if (alert.type === 'Disease Cluster') {
      contributingReports = await ClinicalReport.find({
        suspectedCondition: alert.condition,
        state: alert.state,
        reportDate: { $gte: fifteenDaysAgo, $lte: alert.detectedAt }
      }).populate('facility', 'name city state type');
    } else {
      // AMR Signal
      const pathogen = alert.condition.replace('Reduced Susceptibility — ', '');
      contributingReports = await ClinicalReport.find({
        pathogen,
        state: alert.state,
        labPerformed: true,
        resistance: 'Resistant',
        reportDate: { $gte: fifteenDaysAgo, $lte: alert.detectedAt }
      }).populate('facility', 'name city state type');
    }

    // Summarize contributing facilities cases
    const facilityMap = {};
    contributingReports.forEach(r => {
      const facId = r.facility._id.toString();
      if (!facilityMap[facId]) {
        facilityMap[facId] = {
          facilityId: facId,
          name: r.facility.name,
          city: r.facility.city,
          type: r.facility.type,
          cases: 0,
          lastReported: r.reportDate
        };
      }
      facilityMap[facId].cases += r.patientCount;
      if (new Date(r.reportDate) > new Date(facilityMap[facId].lastReported)) {
        facilityMap[facId].lastReported = r.reportDate;
      }
    });

    const contributingFacilities = Object.values(facilityMap).sort((a, b) => b.cases - a.cases);

    res.status(200).json({
      success: true,
      alert,
      investigation,
      contributingFacilities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update alert status (Acknowledge / Investigate / Resolve)
// @route   PUT /api/alerts/:id/status
// @access  Private (Authority, Admin)
exports.updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alert.status = status;

    if (status === 'Under Investigation') {
      alert.acknowledgedAt = new Date();
      
      // Auto-create or fetch Investigation log
      let investigation = await Investigation.findOne({ alert: alert._id });
      if (!investigation) {
        await Investigation.create({
          alert: alert._id,
          authority: req.user._id,
          status: 'Under Investigation',
          notes: [{
            author: req.user.name,
            text: `Investigation initiated. Alert acknowledged by ${req.user.name}.`
          }]
        });
      }
    } else if (status === 'Resolved') {
      alert.resolvedAt = new Date();
      
      // Update investigation status if log exists
      let investigation = await Investigation.findOne({ alert: alert._id });
      if (investigation) {
        investigation.status = 'Resolved';
        investigation.notes.push({
          author: req.user.name,
          text: `Alert resolved and closed by ${req.user.name}.`
        });
        await investigation.save();
      }
    }

    await alert.save();

    // Broadcast system notification
    await Notification.create({
      roleScope: 'all',
      title: `Alert Status Update: ${alert.condition}`,
      message: `Surveillance alert in ${alert.state} is now ${status}.`,
      type: 'investigation'
    });

    res.status(200).json({
      success: true,
      message: `Alert status updated to ${status}`,
      alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a note/log to an active investigation
// @route   POST /api/alerts/:id/investigation
// @access  Private (Authority, Admin)
exports.addInvestigationNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, error: 'Please provide note text' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    let investigation = await Investigation.findOne({ alert: alert._id });
    
    if (!investigation) {
      // If alert was not moved to investigation yet, do it now
      alert.status = 'Under Investigation';
      alert.acknowledgedAt = new Date();
      await alert.save();

      investigation = await Investigation.create({
        alert: alert._id,
        authority: req.user._id,
        status: 'Under Investigation',
        notes: []
      });
    }

    investigation.notes.push({
      author: req.user.name,
      text: note
    });

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Investigation note added successfully',
      investigation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
