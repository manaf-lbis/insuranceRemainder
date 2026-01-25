const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getPublicAnnouncements,
    getAnnouncementById,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getTickerAnnouncements,
    getAnnouncementByIdAdmin
} = require('../controllers/announcementController');
const { getAnnouncementSharePreview } = require('../controllers/shareController');

// Public Routes
router.get('/', getPublicAnnouncements);
router.get('/ticker', getTickerAnnouncements);

// Admin Routes - MUST come before /:id route to avoid 'admin' being treated as an ID
router.route('/admin')
    .get(protect, admin, getAllAnnouncements)
    .post(protect, admin, createAnnouncement);

router.route('/admin/:id')
    .get(protect, admin, getAnnouncementByIdAdmin)
    .put(protect, admin, updateAnnouncement)
    .delete(protect, admin, deleteAnnouncement);

// Social Media Share Proxy (Server-Side Preview)
router.get('/share/:id', getAnnouncementSharePreview);

// Public route for single announcement - MUST come after /admin routes
router.get('/:id', getAnnouncementById);

module.exports = router;
