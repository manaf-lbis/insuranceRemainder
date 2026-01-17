const express = require('express');
const router = express.Router();
const { createInsurance, getInsurances } = require('../controllers/insuranceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInsurance)
    .get(protect, getInsurances);

module.exports = router;
