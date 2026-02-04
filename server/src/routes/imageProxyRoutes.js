const express = require('express');
const router = express.Router();
const { proxyImage } = require('../controllers/imageProxyController');

// Public route for proxying images
router.get('/proxy', proxyImage);

module.exports = router;
