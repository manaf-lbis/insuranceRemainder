const express = require('express');
const router = express.Router();
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');
const {
    getPublicAnnouncements,
    getAnnouncementById,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getTickerAnnouncements,
    getAnnouncementByIdAdmin,
    incrementAnnouncementViews,
    toggleBlockAnnouncement,
    getAnnouncementStats
} = require('../controllers/announcementController');
const { getAnnouncementSharePreview } = require('../controllers/shareController');

// Public Routes
router.get('/', getPublicAnnouncements);
router.get('/ticker', getTickerAnnouncements);

// Admin/Staff Routes - Stats (must come before /admin/:id)
router.get('/admin/stats', protect, staffOrAdmin, getAnnouncementStats);

// Admin/Staff Routes - Manage Announcements
router.route('/admin')
    .get(protect, staffOrAdmin, getAllAnnouncements)
    .post(protect, staffOrAdmin, createAnnouncement);

router.route('/admin/:id')
    .get(protect, staffOrAdmin, getAnnouncementByIdAdmin)
    .put(protect, staffOrAdmin, updateAnnouncement)
    .delete(protect, staffOrAdmin, deleteAnnouncement);

router.patch('/admin/:id/block', protect, staffOrAdmin, toggleBlockAnnouncement);

// Social Media Share Proxy (Server-Side Preview)
router.get('/share/:id', getAnnouncementSharePreview);

// Increment views route - MUST come before /:id to avoid being caught by it
router.post('/:id/view', incrementAnnouncementViews);

// Public route for single announcement - MUST come after /admin routes
router.get('/:id', getAnnouncementById);

module.exports = router;
