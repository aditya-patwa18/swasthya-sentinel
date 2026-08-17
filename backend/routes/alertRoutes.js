const express = require('express');
const router = express.Router();
const { getAlerts, getAlertById, updateAlertStatus, addInvestigationNote } = require('../controllers/alertController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getAlerts);
router.get('/:id', requireAuth, getAlertById);
router.put('/:id/status', requireAuth, requireRole('authority', 'admin'), updateAlertStatus);
router.post('/:id/investigation', requireAuth, requireRole('authority', 'admin'), addInvestigationNote);

module.exports = router;
