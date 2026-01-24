const Announcement = require('../models/Announcement');

const create = async (data) => {
    const announcement = new Announcement(data);
    return await announcement.save();
};

const findPublic = async (limit = 6) => {
    // Priority order: hot (3), warm (2), cold (1)
    return await Announcement.find({ status: 'published' })
        .sort({
            priority: -1,  // This won't work directly with enum, need custom sort
            createdAt: -1
        })
        .limit(limit)
        .populate('author', 'username')
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
        showInTicker: true
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
    return await Announcement.findById(id).populate('author', 'username');
};

const update = async (id, data) => {
    return await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id) => {
    return await Announcement.findByIdAndDelete(id);
};

module.exports = {
    create,
    findPublic,
    findTicker,
    findAll,
    findById,
    update,
    remove
};
