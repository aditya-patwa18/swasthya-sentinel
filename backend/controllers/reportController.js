const ClinicalReport = require('../models/ClinicalReport');
const Facility = require('../models/Facility');
const { runSurveillance } = require('../services/surveillanceService');
const Notification = require('../models/Notification');

// @desc    Create a clinical report
// @route   POST /api/reports
// @access  Private (Doctor only)
exports.createReport = async (req, res) => {
  try {
    const doctor = req.user;
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Only doctors can submit clinical reports' });
    }

    // Get doctor's facility to capture locations automatically
    const facility = await Facility.findById(doctor.facility);
    if (!facility) {
      return res.status(404).json({ success: false, error: 'Doctor facility not found' });
    }

    const {
      department,
      chiefComplaint,
      symptoms,
      symptomDuration,
      patientCount,
      ageGroup,
      diseaseCategory,
      suspectedCondition,
      diagnosisStatus,
      confirmedDiagnosis,
      labPerformed,
      testName,
      testResult,
      cultureResult,
      pathogen,
      antibioticPrescribed,
      antibioticName,
      antibioticClass,
      resistance,
      susceptibility
    } = req.body;

    const report = new ClinicalReport({
      reportingDoctor: doctor._id,
      facility: facility._id,
      department,
      chiefComplaint,
      symptoms,
      symptomDuration,
      patientCount: parseInt(patientCount) || 1,
      ageGroup,
      area: facility.city, // fallback to city name
      city: facility.city,
      district: facility.district,
      state: facility.state,
      diseaseCategory,
      suspectedCondition,
      diagnosisStatus,
      confirmedDiagnosis,
      labPerformed,
      testName,
      testResult,
      cultureResult,
      pathogen,
      antibioticPrescribed,
      antibioticName,
      antibioticClass,
      resistance: resistance || 'None',
      susceptibility
    });

    await report.save();

    // Trigger surveillance engine check in background
    // This will analyze trends and generate alerts if thresholds are exceeded
    // Set immediate to avoid blocking client response
    setImmediate(async () => {
      await runSurveillance(report);
    });

    // Create doctor-specific notification
    await Notification.create({
      user: doctor._id,
      title: 'Report Submitted Successfully',
      message: `Your clinical report for ${patientCount} case(s) of ${suspectedCondition} has been submitted to the facility surveillance pipeline.`,
      type: 'report'
    });

    res.status(201).json({
      success: true,
      message: 'Clinical report submitted successfully.',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get clinical reports
// @route   GET /api/reports
// @access  Private (Doctor, Authority, Admin)
exports.getReports = async (req, res) => {
  try {
    let query = {};

    // Role-based restrictions
    if (req.user.role === 'doctor') {
      // Doctors see only reports they submitted
      query.reportingDoctor = req.user._id;
    }

    // Filters
    if (req.query.diseaseCategory) {
      query.diseaseCategory = req.query.diseaseCategory;
    }
    if (req.query.state) {
      query.state = req.query.state;
    }
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Pagination/Sorting
    const reports = await ClinicalReport.find(query)
      .populate('facility', 'name type city state')
      .sort('-reportDate');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single report details
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await ClinicalReport.findById(req.params.id)
      .populate('facility', 'name type city state district latitude longitude')
      .populate('reportingDoctor', 'name email phone');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Clinical report not found' });
    }

    // Security check: doctors can only view their own reports
    if (req.user.role === 'doctor' && report.reportingDoctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this report' });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get facility reports
// @route   GET /api/reports/facility/:facilityId
// @access  Private
exports.getFacilityReports = async (req, res) => {
  try {
    const reports = await ClinicalReport.find({ facility: req.params.facilityId })
      .populate('reportingDoctor', 'name')
      .sort('-reportDate');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
