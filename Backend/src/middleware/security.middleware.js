import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { body, validationResult } from 'express-validator';

export default (app) => {
    // Configure helmet with relaxed CSP for development/GraphQL
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apollo-server-landing-page.cdn.apollographql.com"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
                connectSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
                manifestSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
                frameSrc: ["'self'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    
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