const express = require('express');
const router = express.Router();
const { sendReminder, getReminderLogs } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

// Note: These routes are deprecated. Use /api/insurances/:id/remind instead
router.post('/:id/send', protect, sendReminder);
router.get('/:id/logs', protect, getReminderLogs);

module.exports = router;
