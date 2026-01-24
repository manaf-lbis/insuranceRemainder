const posterService = require('../services/posterService');

/**
 * @desc    Get active posters for public home page
 * @route   GET /api/posters/active
 * @access  Public
 */
const getActivePosters = async (req, res) => {
    try {
        const posters = await posterService.getActivePosters();
        res.status(200).json(posters);
    } catch (error) {
        console.error('Error fetching active posters:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Upload new poster
 * @route   POST /api/posters
 * @access  Admin
 */
const uploadPoster = async (req, res) => {
    try {
        const poster = await posterService.uploadPoster({
            file: req.file,
            userId: req.user._id,
            metadata: req.body
        });
        res.status(201).json(poster);
    } catch (error) {
        console.error('Error uploading poster:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

/**
 * @desc    Get all posters (manage list)
 * @route   GET /api/posters
 * @access  Admin
 */
const getAllPosters = async (req, res) => {
    try {
        const posters = await posterService.getAllPosters();
        res.status(200).json(posters);
    } catch (error) {
        console.error('Error fetching posters:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Toggle poster active status
 * @route   PATCH /api/posters/:id/toggle
 * @access  Admin
 */
const togglePosterStatus = async (req, res) => {
    try {
        const poster = await posterService.togglePosterStatus(req.params.id);
        res.status(200).json(poster);
    } catch (error) {
        console.error('Error toggling poster status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Delete a poster
 * @route   DELETE /api/posters/:id
 * @access  Admin
 */
const deletePoster = async (req, res) => {
    try {
        await posterService.deletePoster(req.params.id);
        res.status(200).json({ message: 'Poster deleted successfully' });
    } catch (error) {
        console.error('Error deleting poster:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getActivePosters,
    uploadPoster,
    getAllPosters,
    togglePosterStatus,
    deletePoster
};
