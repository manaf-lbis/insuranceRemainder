const announcementRepository = require('../repositories/announcementRepository');

// Helper to extract first image URL from HTML content
const extractThumbnail = (htmlContent) => {
    if (!htmlContent) return null;
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
};

const createAnnouncement = async (data, userId) => {
    const thumbnail = extractThumbnail(data.content);

    const announcementData = {
        ...data,
        thumbnailUrl: thumbnail,
        author: userId
    };

    return await announcementRepository.create(announcementData);
};

const updateAnnouncement = async (id, data) => {
    // If content is being updated, re-evaluate thumbnail
    let updates = { ...data };
    if (data.content) {
        updates.thumbnailUrl = extractThumbnail(data.content);
    }

    return await announcementRepository.update(id, updates);
};

const getPublicAnnouncements = async () => {
    return await announcementRepository.findPublic(6);
};

const getAllAnnouncements = async (isAdmin) => {
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }
    return await announcementRepository.findAll();
};

const getAnnouncementById = async (id) => {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) {
        throw new Error('Announcement not found');
    }
    return announcement;
};

const deleteAnnouncement = async (id) => {
    return await announcementRepository.remove(id);
};

const getTickerAnnouncements = async () => {
    return await announcementRepository.findTicker();
};

module.exports = {
    createAnnouncement,
    updateAnnouncement,
    getPublicAnnouncements,
    getAllAnnouncements,
    getAnnouncementById,
    deleteAnnouncement,
    getTickerAnnouncements
};
