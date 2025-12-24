/**
 * Validation Result Handler Middleware
 * Standardizes validation error responses across the application
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 * Use after express-validator validation chains
 * 
 * Example:
 * router.post('/login',
 *   body('email').isEmail(),
 *   body('password').isLength({ min: 8 }),
 *   validate,
 *   async (req, res) => { ... }
 * );
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    
    next();
};

module.exports = validate;
