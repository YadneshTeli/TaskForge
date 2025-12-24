/**
 * Custom Error Classes for TaskForge Backend
 * Provides specific error types for better error handling and user feedback
 */

/**
 * Base Application Error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Authentication Error (401)
 * Used when authentication fails or token is invalid
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed. Please log in.') {
        super(message, 401);
    }
}

/**
 * Authorization Error (403)
 * Used when user doesn't have permission to access a resource
 */
export class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action.') {
        super(message, 403);
    }
}

/**
 * Not Found Error (404)
 * Used when a requested resource is not found
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Resource', identifier = '') {
        const message = identifier 
            ? `${resource} with identifier '${identifier}' not found.`
            : `${resource} not found.`;
        super(message, 404);
    }
}

/**
 * Validation Error (400)
 * Used when request data fails validation
 */
export class ValidationError extends AppError {
    constructor(message = 'Validation failed.', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Conflict Error (409)
 * Used when there's a conflict with existing data (e.g., duplicate email)
 */
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists.') {
        super(message, 409);
    }
}

/**
 * Bad Request Error (400)
 * Used for general bad request errors
 */
export class BadRequestError extends AppError {
    constructor(message = 'Invalid request.') {
        super(message, 400);
    }
}

/**
 * Database Error (500)
 * Used when database operations fail
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed.', originalError = null) {
        super(message, 500);
        this.originalError = originalError;
    }
}

/**
 * External Service Error (502)
 * Used when external service calls fail
 */
export class ExternalServiceError extends AppError {
    constructor(service = 'External service', message = null) {
        const errorMessage = message || `${service} is currently unavailable.`;
        super(errorMessage, 502);
    }
}

/**
 * Rate Limit Error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message, 429);
    }
}

/**
 * File Upload Error (400)
 * Used when file upload fails or is invalid
 */
export class FileUploadError extends AppError {
    constructor(message = 'File upload failed.') {
        super(message, 400);
    }
}

/**
 * Token Error (401)
 * Used for JWT token specific errors
 */
export class TokenError extends AppError {
    constructor(message = 'Invalid or expired token.') {
        super(message, 401);
    }
}

/**
 * Helper function to check if error is operational
 * Operational errors are expected and handled gracefully
 */
export const isOperationalError = (error) => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};

/**
 * Error response formatter
 * Formats error for consistent API responses
 */
export const formatErrorResponse = (error, includeStack = false) => {
    const response = {
        status: error.status || 'error',
        message: error.message || 'An error occurred',
        ...(error.statusCode && { statusCode: error.statusCode }),
        ...(error.errors && { errors: error.errors })
    };

    if (includeStack && error.stack) {
        response.stack = error.stack;
    }

    return response;
};
