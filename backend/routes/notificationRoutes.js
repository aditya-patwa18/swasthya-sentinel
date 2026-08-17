const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getNotifications);
router.put('/:id/read', requireAuth, markAsRead);
router.put('/read-all', requireAuth, markAllRead);

module.exports = router;
