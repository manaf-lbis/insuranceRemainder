/**
 * Public Routes
 * No authentication required
 */

const express = require('express');
const router = express.Router();
const publicInsuranceController = require('../controllers/publicInsuranceController');
// @route   POST /api/public/check-insurance
// @desc    Check insurance status by vehicle number or mobile number
// @access  Public
router.post('/check-insurance', publicInsuranceController.checkInsuranceStatus);

module.exports = router;
