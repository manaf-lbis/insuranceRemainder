const User = require('../models/User');

const find = async (filter = {}, sort = {}, select = '', options = { skip: 0, limit: 0 }) => {
    let query = User.find(filter).sort(sort).select(select);

    if (options.skip) {
        query = query.skip(options.skip);
    }

    if (options.limit) {
        query = query.limit(options.limit);
    }

    return await query;
};

const count = async (filter = {}) => {
    return await User.countDocuments(filter);
};

module.exports = {
    find,
    count,
};
