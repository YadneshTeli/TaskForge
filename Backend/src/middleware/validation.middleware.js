// src/middleware/validation.middleware.js
import validate from '../utils/validate.js';

export default (rules) => (req, res, next) => {
    for (const field in rules) {
        const validators = rules[field];
        for (const validator of validators) {
            if (!validator.fn(req.body[field], ...(validator.args || []))) {
                return res.status(400).json({ message: validator.message });
            }
        }
    }
    next();
};
