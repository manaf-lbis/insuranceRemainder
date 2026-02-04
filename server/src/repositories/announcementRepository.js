const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

const create = async (data) => {
    const announcement = new Announcement(data);
    return await announcement.save();
};

const findPublic = async (limit = 50) => {
    // Priority order: hot (3), warm (2), cold (1)
    return await Announcement.find({
        status: 'published',
        isBlocked: { $ne: true }  // Strictly exclude blocked announcements (handles null/undefined safe)
    })
        .sort({
            priority: -1,  // This won't work directly with enum, need custom sort
            createdAt: -1
        })
        .limit(limit)
        .populate('author', 'username')
        .populate('lastUpdatedBy', 'username')
        .populate('category')
        .then(announcements => {
            // Custom sort: hot first, then warm, then cold, then by date
            const priorityOrder = { hot: 3, warm: 2, cold: 1 };
            return announcements.sort((a, b) => {
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt) - new Date(a.createdAt);
            }).slice(0, limit);
        });
};

const findTicker = async () => {
    return await Announcement.find({
        status: 'published',
        showInTicker: true,
        isBlocked: { $ne: true }  // Strictly exclude blocked announcements
    })
        .sort({ createdAt: -1 })
        .select('title')
        .limit(10);
};

const findAll = async (filter = {}, sort = { createdAt: -1 }) => {
    return await Announcement.find(filter)
        .sort(sort)
        .populate('author', 'username');
};

const findById = async (id) => {
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
        // If it's a valid ID, try to find by ID
        // Note: A valid objectId could technically be a slug, so we might need a fallback?
        // But practically, user slugs won't match 24 hex chars exactly.
        const byId = await Announcement.findById(id)
            .populate('author', 'username')
            .populate('lastUpdatedBy', 'username')
            .populate('category');
        if (byId) return byId;
    }

    // Fallback: Try to find by Slug
    return await Announcement.findOne({ slug: id })
        .populate('author', 'username')
        .populate('lastUpdatedBy', 'username')
        .populate('category');
};

const update = async (id, data) => {
    return await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id) => {
    return await Announcement.findByIdAndDelete(id);
};

const incrementViews = async (id) => {
    return await Announcement.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
    );
};

const getStats = async () => {
    const totalAnnouncements = await Announcement.countDocuments();
    const publishedCount = await Announcement.countDocuments({ status: 'published' });

    const viewsAggregation = await Announcement.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    const topPerforming = await Announcement.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .select('title views createdAt author')
        .populate('author', 'username');

    return {
        totalAnnouncements,
        publishedCount,
        totalViews,
        topPerforming
    };
};

module.exports = {
    create,
    findPublic,
    findTicker,
    findAll,
    findById,
    update,
    remove,
    incrementViews,
    getStats
};
