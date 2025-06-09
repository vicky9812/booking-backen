const responseHandler = require('../utils/responseHandler');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Determine the error status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors).map(error => error.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose invalid object ID
    statusCode = 400;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    // Mongoose duplicate key
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Token expired';
  }
  
  responseHandler.error(res, message, statusCode);
};

module.exports = errorHandler;