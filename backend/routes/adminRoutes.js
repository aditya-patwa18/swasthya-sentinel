const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, getSystemMetrics } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/users', requireAuth, requireRole('admin'), getUsers);
router.get('/metrics', requireAuth, requireRole('admin'), getSystemMetrics);
router.put('/users/:id/status', requireAuth, requireRole('admin'), toggleUserStatus);

module.exports = router;
