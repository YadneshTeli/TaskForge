/**
 * Authentication and Authorization Middleware
 * Handles JWT token verification and role-based access control
 */

import { verifyToken } from "../utils/jwt.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";

/**
 * Decode JWT token from request headers
 * Attaches user to req.user if token is valid
 * Does not block request if token is invalid (use protect() for that)
 */
export const decodeToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            req.user = verifyToken(token);
        } catch (err) {
            req.user = null;
            // Log token errors for debugging
            console.log('Token verification failed:', err.message);
        }
    }
    next();
};

/**
 * Protect route - requires authentication
 * Throws AuthenticationError if user is not authenticated
 */
export const protect = (req, res, next) => {
    if (!req.user) {
        return next(new AuthenticationError('Please log in to access this resource'));
    }
    next();
};

/**
 * Role-based access control middleware
 * Requires authentication and specific role(s)
 * 
 * @param {string|string[]} roles - Required role(s) for access
 * @returns {Function} Express middleware
 * 
 * @example
 * router.delete('/project/:id', protect, authorize('admin'), deleteProject);
 * router.get('/users', protect, authorize(['admin', 'manager']), getUsers);
 */
export const authorize = (roles = []) => {
    // Convert single role string to array
    if (typeof roles === 'string') {
        roles = [roles];
    }
    
    return (req, res, next) => {
        // Check authentication first
        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }
        
        // Check role authorization
        if (roles.length && !roles.includes(req.user.role)) {
            return next(new AuthorizationError(
                `Access denied. Required role(s): ${roles.join(', ')}`
            ));
        }
        
        next();
    };
};