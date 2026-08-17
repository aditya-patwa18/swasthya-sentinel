const express = require('express');
const router = express.Router();
const { getAMROverview, getAMRTrends } = require('../controllers/amrController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/overview', requireAuth, requireRole('doctor', 'authority', 'admin'), getAMROverview);
router.get('/trends', requireAuth, requireRole('doctor', 'authority', 'admin'), getAMRTrends);

module.exports = router;
