const posterRepository = require('../repositories/posterRepository');
const { cloudinary } = require('../config/cloudinary');

const uploadPoster = async (file, userId, title) => {
    if (!file) {
        throw new Error('No file uploaded');
    }

    const posterData = {
        title: title || 'Untitled Poster',
        imageUrl: file.path,
        publicId: file.filename,
        isActive: false, // Default to inactive
        uploadedBy: userId
    };

    return await posterRepository.create(posterData);
};

const getActivePosters = async () => {
    return await posterRepository.findActive();
};

const getAllPosters = async () => {
    return await posterRepository.findAll();
};

const togglePosterStatus = async (id) => {
    return await posterRepository.toggleActive(id);
};

const deletePoster = async (id) => {
    const poster = await posterRepository.findById(id);
    if (!poster) {
        throw new Error('Poster not found');
    }

    // Delete from Cloudinary
    if (poster.publicId) {
        await cloudinary.uploader.destroy(poster.publicId);
    }

    return await posterRepository.deletePoster(id);
};

module.exports = {
    uploadPoster,
    getActivePosters,
    getAllPosters,
    togglePosterStatus,
    deletePoster
};
