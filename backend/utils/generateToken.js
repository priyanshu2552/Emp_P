const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user
 * @param {String} id - User ID
 * @param {String} role - User role ('admin' | 'manager' | 'employee')
 * @returns {String} token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
