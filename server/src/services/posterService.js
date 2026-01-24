const posterRepository = require('../repositories/posterRepository');
const { cloudinary } = require('../config/cloudinary');

const uploadPoster = async ({ file, userId, metadata }) => {
    if (!file) {
        throw new Error('Image file is required');
    }

    const posterData = {
        title: metadata.title || 'Untitled Poster',
        imageUrl: file.path,
        publicId: file.filename,
        dominantColor: metadata.dominantColor || '#1e3a8a',
        headline: metadata.headline,
        description: metadata.description,
        showButton: metadata.showButton === 'true' || metadata.showButton === true,
        buttonText: metadata.buttonText || 'Quick Apply',
        whatsappNumber: metadata.whatsappNumber,
        messageTemplate: metadata.messageTemplate,
        isActive: metadata.isActive === 'true' || metadata.isActive === true,
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
