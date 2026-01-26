const announcementService = require('../services/announcementService');

/**
 * @desc    Get public announcements
 * @route   GET /api/announcements
 * @access  Public
 */
const getPublicAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getPublicAnnouncements();
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error fetching public announcements:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single announcement
 * @route   GET /api/announcements/:id
 * @access  Public
 */
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await announcementService.getAnnouncementById(req.params.id);

        // Check if blocked - return 410 Gone
        if (announcement.isBlocked) {
            return res.status(410).json({
                message: 'This content has been removed',
                isBlocked: true
            });
        }

        // Basic check: if not published and user is not admin, deny (simple logic for now)
        // For strictness, we could pass req.user to service, but keeping it simple:
        // Public API usually returns only published. If we want preview for admins, we need logic.
        // Assuming this public endpoint allows viewing any if you have ID, OR strictly published.
        // Let's enforce published for public route unless we add admin logic here.
        if (announcement.status !== 'published') {
            // If user is admin (req.user exists), allow. Else 404.
            if (!req.user || req.user.role !== 'admin') {
                return res.status(404).json({ message: 'Announcement not found' });
            }
        }

        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        if (error.message === 'Announcement not found') {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all announcements (Admin)
 * @route   GET /api/admin/announcements
 * @access  Admin
 */
const getAllAnnouncements = async (req, res) => {
    console.log('>>> getAllAnnouncements route hit');
    try {
        console.log('=== GET ALL ANNOUNCEMENTS CALLED ===');
        console.log('User:', req.user);
        console.log('Calling service...');
        const announcements = await announcementService.getAllAnnouncements(true);
        console.log('Service returned:', announcements?.length, 'announcements');
        res.status(200).json(announcements);
    } catch (error) {
        console.error('!!! ERROR in getAllAnnouncements !!!');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create announcement
 * @route   POST /api/admin/announcements
 * @access  Admin
 */
const createAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.createAnnouncement(req.body, req.user._id);
        res.status(201).json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update announcement
 * @route   PUT /api/admin/announcements/:id
 * @access  Admin
 */
const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/admin/announcements/:id
 * @access  Admin
 */
const deleteAnnouncement = async (req, res) => {
    try {
        await announcementService.deleteAnnouncement(req.params.id);
        res.status(200).json({ message: 'Announcement deleted' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get ticker announcements
 * @route   GET /api/announcements/ticker
 * @access  Public
 */
const getTickerAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getTickerAnnouncements();
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error fetching ticker announcements:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single announcement (Admin)
 * @route   GET /api/announcements/admin/:id
 * @access  Admin
 */
const getAnnouncementByIdAdmin = async (req, res) => {
    try {
        const announcement = await announcementService.getAnnouncementById(req.params.id);
        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        if (error.message === 'Announcement not found') {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Increment announcement views
 * @route   POST /api/announcements/:id/view
 * @access  Public
 */
const incrementAnnouncementViews = async (req, res) => {
    try {
        const announcement = await announcementService.incrementViews(req.params.id);
        res.status(200).json({ views: announcement.views });
    } catch (error) {
        console.error('Error incrementing views:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Toggle block status of announcement
 * @route   PATCH /api/admin/announcements/:id/block
 * @access  Admin
 */
const toggleBlockAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.toggleBlock(req.params.id);
        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error toggling block status:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPublicAnnouncements,
    getAnnouncementById,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getTickerAnnouncements,
    getAnnouncementByIdAdmin,
    incrementAnnouncementViews,
    toggleBlockAnnouncement
};
