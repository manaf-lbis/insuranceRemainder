const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/stats', protect, getStats);

module.exports = router;
