import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { body, validationResult } from 'express-validator';

export default (app) => {
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