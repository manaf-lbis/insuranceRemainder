const Insurance = require('../models/Insurance');
require('../models/User'); // Ensure User model is registered for population

const create = async (data) => {
    const insurance = new Insurance(data);
    return await insurance.save();
};

const findAll = async (filter = {}, sort = {}, options = { populate: true, skip: 0, limit: 0 }) => {
    const activeFilter = { ...filter, isDeleted: { $ne: true } };
    let query = Insurance.find(activeFilter).sort(sort);

    if (options.skip) {
        query = query.skip(options.skip);
    }

    if (options.limit) {
        query = query.limit(options.limit);
    }

    if (options.populate) {
        query = query.populate('createdBy', 'username');
    }

    return await query;
};

const count = async (filter = {}) => {
    const activeFilter = { ...filter, isDeleted: { $ne: true } };
    return await Insurance.countDocuments(activeFilter);
};

const findOne = async (filter = {}, sort = {}, options = { populate: true }) => {
    const activeFilter = { ...filter, isDeleted: { $ne: true } };
    let query = Insurance.findOne(activeFilter).sort(sort);

    if (options.populate) {
        query = query.populate('createdBy', 'username');
    }

    return await query;
};

const findById = async (id, options = { populate: true }) => {
    return await findOne({ _id: id }, {}, options);
};

const softDelete = async (id, userId) => {
    return await Insurance.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
    }, { new: true });
};

const update = async (id, data) => {
    return await Insurance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

module.exports = {
    create,
    findAll,
    count,
    findOne,
    findById,
    softDelete,
    update
};
