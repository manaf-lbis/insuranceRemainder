const express = require('express');
const router = express.Router();
const { createInsurance, getInsurances, deleteInsurance, updateInsurance, getInsuranceById } = require('../controllers/insuranceController');
const { sendReminder, getReminderLogs } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInsurance)
    .get(protect, getInsurances);

router.route('/:id')
    .get(protect, getInsuranceById)
    .put(protect, updateInsurance)
    .delete(protect, deleteInsurance);

// Reminder routes
router.post('/:id/remind', protect, sendReminder);
router.get('/:id/reminder-logs', protect, getReminderLogs);

module.exports = router;
