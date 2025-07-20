// src/utils/pagination.js
module.exports = (query, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};
