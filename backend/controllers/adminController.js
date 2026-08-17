const User = require('../models/User');
const Facility = require('../models/Facility');
const ClinicalReport = require('../models/ClinicalReport');
const Alert = require('../models/Alert');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('facility', 'name type city state')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle user status (Active/Deactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${isActive ? 'active' : 'deactivated'}`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get system-wide health and totals
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
exports.getSystemMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const totalReports = await ClinicalReport.countDocuments();
    const totalAlerts = await Alert.countDocuments();

    // Group users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Group facilities by type
    const facilitiesByType = await Facility.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalFacilities,
        totalReports,
        totalAlerts,
        usersByRole: usersByRole.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        facilitiesByType: facilitiesByType.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
