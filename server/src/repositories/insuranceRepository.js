const Insurance = require('../models/Insurance');

const create = async (data) => {
    const insurance = new Insurance(data);
    return await insurance.save();
};

const findAll = async (filter = {}, sort = {}) => {
    return await Insurance.find(filter).sort(sort);
};

module.exports = {
    create,
    findAll,
};
