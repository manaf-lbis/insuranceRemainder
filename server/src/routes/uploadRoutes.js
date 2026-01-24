const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinary');

// @desc    Upload an image
// @route   POST /api/upload/image
// @access  Private/Admin
router.post('/image', protect, admin, upload.single('image'), uploadImage);

module.exports = router;
