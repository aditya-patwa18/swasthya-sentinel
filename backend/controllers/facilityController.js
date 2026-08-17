const Facility = require('../models/Facility');
const ClinicalReport = require('../models/ClinicalReport');

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public (to populate register dropdown)
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true }).sort('name');
    res.status(200).json({
      success: true,
      count: facilities.length,
      facilities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single facility details (Surveillance and Doctor views)
// @route   GET /api/facilities/:id
// @access  Private
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ success: false, error: 'Facility not found' });
    }

    // Get reporting statistics for this facility
    const reports = await ClinicalReport.find({ facility: facility._id });
    
    // Calculate total patients reported, and major categories
    const totalReports = reports.length;
    const totalPatients = reports.reduce((sum, r) => sum + r.patientCount, 0);
    
    // Group by category
    const categoryCounts = {};
    reports.forEach(r => {
      categoryCounts[r.diseaseCategory] = (categoryCounts[r.diseaseCategory] || 0) + r.patientCount;
    });

    const facilityStats = {
      totalReports,
      totalPatients,
      categoryCounts,
      recentReports: reports.slice(-10).reverse() // Last 10 reports
    };

    res.status(200).json({
      success: true,
      facility,
      stats: facilityStats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new facility
// @route   POST /api/facilities
// @access  Private (Admin)
exports.createFacility = async (req, res) => {
  try {
    const { name, type, city, district, state, latitude, longitude } = req.body;

    const facilityExists = await Facility.findOne({ name });
    if (facilityExists) {
      return res.status(400).json({ success: false, error: 'Facility already exists with this name' });
    }

    const facility = await Facility.create({
      name,
      type,
      city,
      district,
      state,
      latitude,
      longitude
    });

    res.status(201).json({
      success: true,
      facility
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
