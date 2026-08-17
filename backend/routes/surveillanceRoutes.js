const express = require('express');
const router = express.Router();
const { getOverview, getTrends, getMapData, getFeed } = require('../controllers/surveillanceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/overview', requireAuth, requireRole('doctor', 'authority', 'admin'), getOverview);
router.get('/trends', requireAuth, getTrends);
router.get('/map', requireAuth, requireRole('doctor', 'authority', 'admin'), getMapData);
router.get('/feed', requireAuth, getFeed);

module.exports = router;
