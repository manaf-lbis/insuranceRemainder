const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');
const { getActivePosters, uploadPoster, getAllPosters, togglePosterStatus, deletePoster } = require('../controllers/posterController');

// Public Route
router.get('/active', getActivePosters);

// Admin/Staff Routes
router.use(protect);
router.use(staffOrAdmin);

router.route('/')
    .get(getAllPosters)
    .post(upload.single('image'), uploadPoster);

router.patch('/:id/toggle', togglePosterStatus);
router.delete('/:id', deletePoster);

module.exports = router;
