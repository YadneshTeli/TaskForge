/**
 * Enhanced Error Handler Middleware
 * Handles all errors across the application with proper formatting and logging
 * Includes detailed error responses, request context, and comprehensive logging
 */

import { formatErrorResponse, isOperationalError } from '../utils/errors.js';
import { NotFoundError } from '../utils/errors.js';
import crypto from 'crypto';

/**
 * Generate correlation ID for request tracking
 */
const generateCorrelationId = () => {
    return crypto.randomUUID();
};

/**
 * Extract relevant request information for logging
 */
const getRequestContext = (req) => {
    return {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous',
        correlationId: req.correlationId || generateCorrelationId(),
        timestamp: new Date().toISOString()
    };
};

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
        message: e.message,
        value: e.value,
        kind: e.kind
    }));
    
    return {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
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
        errorCode: 'DUPLICATE_ENTRY',
        message: `${field} '${value}' already exists.`,
        field,
        value
    };
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleMongooseCastError = (err) => {
    return {
        statusCode: 400,
        errorCode: 'INVALID_FORMAT',
        message: `Invalid ${err.path}: ${err.value}`,
        field: err.path,
        value: err.value,
        expectedType: err.kind
    };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
    return {
        statusCode: 401,
        errorCode: 'INVALID_TOKEN',
        message: 'Invalid token. Please log in again.'
    };
};

const handleJWTExpiredError = () => {
    return {
        statusCode: 401,
        errorCode: 'TOKEN_EXPIRED',
        message: 'Your token has expired. Please log in again.'
    };
};

/**
 * Handle Prisma errors with detailed error codes and messages
 */
const handlePrismaError = (err) => {
    const prismaErrorMap = {
        'P2000': { status: 400, code: 'VALUE_TOO_LONG', message: 'Value is too long for the field' },
        'P2001': { status: 404, code: 'RECORD_NOT_FOUND', message: 'Record does not exist' },
        'P2002': { status: 409, code: 'UNIQUE_CONSTRAINT', message: 'Unique constraint violation' },
        'P2003': { status: 400, code: 'FOREIGN_KEY_CONSTRAINT', message: 'Foreign key constraint failed' },
        'P2004': { status: 400, code: 'CONSTRAINT_FAILED', message: 'Database constraint failed' },
        'P2005': { status: 400, code: 'INVALID_VALUE', message: 'Invalid value stored in database' },
        'P2006': { status: 400, code: 'INVALID_VALUE', message: 'Provided value is invalid' },
        'P2007': { status: 400, code: 'VALIDATION_ERROR', message: 'Data validation error' },
        'P2008': { status: 500, code: 'QUERY_PARSE_ERROR', message: 'Failed to parse query' },
        'P2009': { status: 500, code: 'QUERY_VALIDATION_ERROR', message: 'Failed to validate query' },
        'P2010': { status: 500, code: 'RAW_QUERY_ERROR', message: 'Raw query failed' },
        'P2011': { status: 400, code: 'NULL_CONSTRAINT', message: 'Null constraint violation' },
        'P2012': { status: 400, code: 'MISSING_REQUIRED', message: 'Missing required value' },
        'P2013': { status: 400, code: 'MISSING_REQUIRED', message: 'Missing required argument' },
        'P2014': { status: 400, code: 'RELATION_VIOLATION', message: 'Required relation violation' },
        'P2015': { status: 404, code: 'RELATED_RECORD_NOT_FOUND', message: 'Related record not found' },
        'P2016': { status: 500, code: 'QUERY_INTERPRETATION_ERROR', message: 'Query interpretation error' },
        'P2017': { status: 400, code: 'RELATION_NOT_CONNECTED', message: 'Records are not connected' },
        'P2018': { status: 400, code: 'REQUIRED_CONNECTED_RECORDS', message: 'Required connected records not found' },
        'P2019': { status: 400, code: 'INPUT_ERROR', message: 'Input error' },
        'P2020': { status: 400, code: 'VALUE_OUT_OF_RANGE', message: 'Value out of range' },
        'P2021': { status: 404, code: 'TABLE_NOT_FOUND', message: 'Table does not exist' },
        'P2022': { status: 404, code: 'COLUMN_NOT_FOUND', message: 'Column does not exist' },
        'P2023': { status: 400, code: 'INCONSISTENT_COLUMN', message: 'Inconsistent column data' },
        'P2024': { status: 408, code: 'CONNECTION_TIMEOUT', message: 'Connection pool timeout' },
        'P2025': { status: 404, code: 'RECORD_NOT_FOUND', message: 'Record not found for operation' },
        'P2026': { status: 500, code: 'UNSUPPORTED_FEATURE', message: 'Database feature not supported' },
        'P2027': { status: 500, code: 'DATABASE_ERROR', message: 'Multiple database errors occurred' },
        'P2028': { status: 500, code: 'TRANSACTION_API_ERROR', message: 'Transaction API error' },
        'P2030': { status: 500, code: 'FULLTEXT_INDEX_NOT_FOUND', message: 'Fulltext index not found' },
        'P2033': { status: 400, code: 'NUMBER_OUT_OF_RANGE', message: 'Number value out of range' },
        'P2034': { status: 409, code: 'TRANSACTION_CONFLICT', message: 'Transaction conflict or deadlock' }
    };

    const errorInfo = prismaErrorMap[err.code] || { 
        status: 500, 
        code: 'DATABASE_ERROR', 
        message: 'Database operation failed' 
    };

    const result = {
        statusCode: errorInfo.status,
        errorCode: errorInfo.code,
        message: errorInfo.message,
        prismaCode: err.code
    };

    // Add additional details for specific errors
    if (err.code === 'P2002' && err.meta?.target) {
        result.fields = err.meta.target;
        result.message = `Unique constraint failed on fields: ${err.meta.target.join(', ')}`;
    }

    if (err.code === 'P2025' && err.meta?.cause) {
        result.details = err.meta.cause;
    }

    return result;
};

/**
 * Handle GraphQL errors
 */
const handleGraphQLError = (err) => {
    return {
        statusCode: err.extensions?.code === 'UNAUTHENTICATED' ? 401 : 400,
        errorCode: err.extensions?.code || 'GRAPHQL_ERROR',
        message: err.message,
        path: err.path,
        locations: err.locations
    };
};

/**
 * Handle rate limit errors
 */
const handleRateLimitError = (err) => {
    return {
        statusCode: 429,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: err.retryAfter || 60
    };
};

/**
 * Sanitize error for production (remove sensitive data)
 */
const sanitizeError = (error, includeStack = false) => {
    const sanitized = {
        status: error.status,
        errorCode: error.errorCode,
        message: error.message
    };

    if (error.errors) sanitized.errors = error.errors;
    if (error.field) sanitized.field = error.field;
    if (error.fields) sanitized.fields = error.fields;
    if (error.retryAfter) sanitized.retryAfter = error.retryAfter;
    if (includeStack && error.stack) sanitized.stack = error.stack;

    return sanitized;
};

/**
 * Main error handler middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Get request context for logging
    const requestContext = getRequestContext(req);
    req.correlationId = requestContext.correlationId;

    // Comprehensive error logging with request context
    const errorLog = {
        timestamp: requestContext.timestamp,
        correlationId: requestContext.correlationId,
        error: {
            name: err.name,
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
            errorCode: err.errorCode
        },
        request: {
            method: requestContext.method,
            url: requestContext.url,
            ip: requestContext.ip,
            userAgent: requestContext.userAgent,
            userId: requestContext.userId
        }
    };

    if (process.env.NODE_ENV === 'development') {
        errorLog.stack = err.stack;
        errorLog.fullError = err;
        console.error('\n🔴 ERROR DETAILS:', JSON.stringify(errorLog, null, 2));
    } else {
        // In production, log operational errors differently from programming errors
        if (isOperationalError(err)) {
            console.log('⚠️  Operational Error:', JSON.stringify(errorLog, null, 2));
        } else {
            errorLog.stack = err.stack;
            console.error('💥 CRITICAL ERROR:', JSON.stringify(errorLog, null, 2));
        }
    }

    // Handle specific error types with priority order
    if (err.name === 'ValidationError') {
        const validationError = handleMongooseValidationError(err);
        error = { ...error, ...validationError };
    }
    else if (err.code === 11000) {
        const duplicateError = handleMongooseDuplicateKeyError(err);
        error = { ...error, ...duplicateError };
    }
    else if (err.name === 'CastError') {
        const castError = handleMongooseCastError(err);
        error = { ...error, ...castError };
    }
    else if (err.name === 'JsonWebTokenError') {
        const jwtError = handleJWTError();
        error = { ...error, ...jwtError };
    }
    else if (err.name === 'TokenExpiredError') {
        const jwtExpiredError = handleJWTExpiredError();
        error = { ...error, ...jwtExpiredError };
    }
    // Handle Prisma errors
    else if (err.code && err.code.startsWith('P')) {
        const prismaError = handlePrismaError(err);
        error = { ...error, ...prismaError };
    }
    // Handle GraphQL errors
    else if (err.extensions) {
        const graphqlError = handleGraphQLError(err);
        error = { ...error, ...graphqlError };
    }
    // Handle rate limit errors
    else if (err.name === 'RateLimitError' || err.statusCode === 429) {
        const rateLimitError = handleRateLimitError(err);
        error = { ...error, ...rateLimitError };
    }
    // Handle express-validator errors
    else if (err.array && typeof err.array === 'function') {
        const validationErrors = err.array();
        error.statusCode = 400;
        error.errorCode = 'VALIDATION_ERROR';
        error.message = 'Validation failed';
        error.errors = validationErrors.map(e => ({
            field: e.param,
            message: e.msg,
            value: e.value,
            location: e.location
        }));
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const errorCode = error.errorCode || 'INTERNAL_ERROR';

    // Build comprehensive response
    const response = {
        status: error.status || (statusCode >= 500 ? 'error' : 'fail'),
        errorCode,
        message,
        timestamp: requestContext.timestamp,
        correlationId: requestContext.correlationId,
        path: req.originalUrl
    };

    // Include errors array if present (validation errors)
    if (error.errors) {
        response.errors = error.errors;
    }

    // Include additional error details
    if (error.field) response.field = error.field;
    if (error.fields) response.fields = error.fields;
    if (error.value) response.value = error.value;
    if (error.retryAfter) response.retryAfter = error.retryAfter;
    if (error.prismaCode) response.prismaCode = error.prismaCode;

    // Include detailed info in development, sanitized in production
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.requestDetails = requestContext;
        response.originalError = {
            name: err.name,
            code: err.code,
            ...err
        };
    } else {
        // Sanitize response in production
        const sanitizedResponse = sanitizeError(response, false);
        Object.assign(response, sanitizedResponse);
    }

    // Set additional headers
    res.setHeader('X-Correlation-ID', requestContext.correlationId);
    if (error.retryAfter) {
        res.setHeader('Retry-After', error.retryAfter);
    }

    // Send response
    res.status(statusCode).json(response);

    // For critical/non-operational errors in production, you might want to:
    // - Send alerts to monitoring service
    // - Log to external logging service
    // - Restart the process if necessary
    if (!isOperationalError(error) && process.env.NODE_ENV === 'production') {
        // TODO: Add monitoring/alerting service integration here
        console.error('🚨 CRITICAL ERROR - Requires immediate attention:', {
            correlationId: requestContext.correlationId,
            error: error.message,
            statusCode,
            errorCode,
            timestamp: requestContext.timestamp,
            request: {
                method: requestContext.method,
                url: requestContext.url,
                userId: requestContext.userId
            }
        });
        
        // TODO: Integrate with monitoring services:
        // - Sentry.captureException(err)
        // - Datadog.logger.error()
        // - CloudWatch.putLogEvents()
        // - PagerDuty.trigger()
    }
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and forwards to error handler
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Middleware to add correlation ID to all requests
 */
export const correlationMiddleware = (req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
    res.setHeader('X-Correlation-ID', req.correlationId);
    next();
};

export default errorHandler;
