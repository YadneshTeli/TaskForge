import helmet from 'helmet';
import xss from 'xss-clean';

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
};
