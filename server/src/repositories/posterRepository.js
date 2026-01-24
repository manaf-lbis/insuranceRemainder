const Poster = require('../models/Poster');

const create = async (data) => {
    const poster = new Poster(data);
    return await poster.save();
};

const findAll = async (filter = {}, sort = { createdAt: -1 }) => {
    return await Poster.find(filter).sort(sort).populate('uploadedBy', 'username');
};

const findActive = async () => {
    return await Poster.find({ isActive: true }).sort({ createdAt: -1 }).populate('uploadedBy', 'username');
};

const findOne = async (filter = {}) => {
    return await Poster.findOne(filter).populate('uploadedBy', 'username');
};

const findById = async (id) => {
    return await Poster.findById(id).populate('uploadedBy', 'username');
};

const update = async (id, data) => {
    return await Poster.findByIdAndUpdate(id, data, { new: true });
};

const toggleActive = async (id) => {
    const poster = await Poster.findById(id);
    if (!poster) return null;
    poster.isActive = !poster.isActive;
    return await poster.save();
};

const deletePoster = async (id) => {
    return await Poster.findByIdAndDelete(id);
};

module.exports = {
    create,
    findAll,
    findActive,
    findOne,
    findById,
    update,
    toggleActive,
    deletePoster
};
