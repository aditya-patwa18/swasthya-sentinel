const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportById, getFacilityReports } = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireRole('doctor', 'lab'), createReport);
router.get('/', requireAuth, getReports);
router.get('/:id', requireAuth, getReportById);
router.get('/facility/:facilityId', requireAuth, getFacilityReports);

module.exports = router;
