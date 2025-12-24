// src/utils/validate.js
export default {
    isEmail: (email) => /\S+@\S+\.\S+/.test(email),
    isRequired: (value) => value !== undefined && value !== null && value !== '',
    minLength: (value, length) => typeof value === 'string' && value.length >= length
};
