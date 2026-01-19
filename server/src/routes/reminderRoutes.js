const express = require('express');
const router = express.Router();
const { sendManualReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:id/send', protect, sendManualReminder);

module.exports = router;
