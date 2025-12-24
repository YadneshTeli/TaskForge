/**
 * Enhanced Error Handler Middleware
 * Handles all errors across the application with proper formatting and logging
 */

import { formatErrorResponse, isOperationalError } from '../utils/errors.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * 404 Not Found Handler
 * Catches all unmatched routes and returns a 404 error
 * Should be placed before the main error handler in middleware chain
 */
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError('Route', req.originalUrl);
    next(error);
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (err) => {
    const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
    }));
    
    return {
        statusCode: 400,
        message: 'Validation failed',
        errors
    };
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleMongooseDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return {
        statusCode: 409,
        message: `${field} '${value}' already exists.`
    };
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleMongooseCastError = (err) => {
    return {
        statusCode: 400,
        message: `Invalid ${err.path}: ${err.value}`
    };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
    return {
        statusCode: 401,
        message: 'Invalid token. Please log in again.'
    };
};

const handleJWTExpiredError = () => {
    return {
        statusCode: 401,
        message: 'Your token has expired. Please log in again.'
    };
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (err) => {
    if (err.code === 'P2002') {
        return {
            statusCode: 409,
            message: 'A record with this unique field already exists.'
        };
    }
    
    if (err.code === 'P2025') {
        return {
            statusCode: 404,
            message: 'Record not found.'
        };
    }
    
    return {
        statusCode: 500,
        message: 'Database operation failed.'
    };
};

/**
 * Main error handler middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error 💥:', {
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            stack: err.stack
        });
    } else {
        // In production, log operational errors differently from programming errors
        if (isOperationalError(err)) {
            console.log('Operational Error:', err.message);
        } else {
            console.error('Programming Error 💥:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
        }
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        const validationError = handleMongooseValidationError(err);
        error = { ...error, ...validationError };
    }
    
    if (err.code === 11000) {
        const duplicateError = handleMongooseDuplicateKeyError(err);
        error = { ...error, ...duplicateError };
    }
    
    if (err.name === 'CastError') {
        const castError = handleMongooseCastError(err);
        error = { ...error, ...castError };
    }
    
    if (err.name === 'JsonWebTokenError') {
        const jwtError = handleJWTError();
        error = { ...error, ...jwtError };
    }
    
    if (err.name === 'TokenExpiredError') {
        const jwtExpiredError = handleJWTExpiredError();
        error = { ...error, ...jwtExpiredError };
    }

    // Handle Prisma errors
    if (err.code && err.code.startsWith('P')) {
        const prismaError = handlePrismaError(err);
        error = { ...error, ...prismaError };
    }

    // Handle express-validator errors
    if (err.array && typeof err.array === 'function') {
        const validationErrors = err.array();
        error.statusCode = 400;
        error.message = 'Validation failed';
        error.errors = validationErrors.map(e => ({
            field: e.param,
            message: e.msg,
            value: e.value
        }));
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Build response
    const response = {
        status: error.status || (statusCode >= 500 ? 'error' : 'fail'),
        message
    };

    // Include errors array if present (validation errors)
    if (error.errors) {
        response.errors = error.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.error = err;
    }

    // Send response
    res.status(statusCode).json(response);

    // For critical/non-operational errors in production, you might want to:
    // - Send alerts to monitoring service
    // - Log to external logging service
    // - Restart the process if necessary
    if (!isOperationalError(error) && process.env.NODE_ENV === 'production') {
        // TODO: Add monitoring/alerting service integration here
        console.error('CRITICAL ERROR - Requires attention:', error);
    }
};

export default errorHandler;
