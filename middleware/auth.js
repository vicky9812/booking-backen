const jwt = require('jsonwebtoken');
const config = require('../config/config');
const responseHandler = require('../utils/responseHandler');

// Middleware to authenticate and authorize requests
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return responseHandler.error(res, 'No token, authorization denied', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user from payload to request object
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return responseHandler.error(res, 'Token is not valid', 401);
  }
};

module.exports = auth;