const express = require('express');
const router = express.Router();
const { getFacilities, getFacilityById, createFacility } = require('../controllers/facilityController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', getFacilities);
router.get('/:id', requireAuth, getFacilityById);
router.post('/', requireAuth, requireRole('admin'), createFacility);

module.exports = router;
