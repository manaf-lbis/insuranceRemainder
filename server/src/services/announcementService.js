const announcementRepository = require('../repositories/announcementRepository');

const createAnnouncement = async (data, userId) => {
    const announcementData = {
        ...data,
        author: userId
    };

    return await announcementRepository.create(announcementData);
};

const updateAnnouncement = async (id, data) => {
    return await announcementRepository.update(id, data);
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
