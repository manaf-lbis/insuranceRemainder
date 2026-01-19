const express = require('express');
const router = express.Router();
const { createInsurance, getInsurances, deleteInsurance } = require('../controllers/insuranceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInsurance)
    .get(protect, getInsurances);

router.route('/:id')
    .delete(protect, deleteInsurance);

module.exports = router;
