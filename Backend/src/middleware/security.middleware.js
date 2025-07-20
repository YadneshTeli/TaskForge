const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { body, validationResult } = require('express-validator');

module.exports = (app) => {
    app.use(helmet());
    app.use(xss());
    app.use(rateLimit);

    // Error handling middleware
    app.use((err, req, res, next) => {
        if (err) {
            res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
        } else {
            next();
        }
    });
};