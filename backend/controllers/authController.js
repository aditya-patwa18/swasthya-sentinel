const User = require('../models/User');
const Facility = require('../models/Facility');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, facility, department, city, state } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Role safety validation (admin accounts cannot be registered publicly)
    if (role === 'admin') {
      return res.status(403).json({ success: false, error: 'Admin accounts cannot be publicly registered' });
    }

    // Facility validation for doctor/lab roles
    let linkedFacility = null;
    if (role === 'doctor' || role === 'lab') {
      if (!facility) {
        return res.status(400).json({ success: false, error: 'Doctors and lab technicians must select a facility' });
      }
      const fac = await Facility.findById(facility);
      if (!fac) {
        return res.status(404).json({ success: false, error: 'Selected facility not found' });
      }
      linkedFacility = fac._id;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      facility: linkedFacility,
      department: (role === 'doctor' || role === 'lab') ? department : undefined,
      city,
      state
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('facility');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Your account is deactivated' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        facility: user.facility,
        department: user.department,
        city: user.city,
        state: user.state
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('facility');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, city, state } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.city = city || user.city;
    user.state = state || user.state;
    
    if (user.role === 'doctor' || user.role === 'lab') {
      user.department = department || user.department;
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('facility');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
