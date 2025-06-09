/**
 * Standard response handler for API responses
 */

// Success response
exports.success = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

// Error response
exports.error = (res, message = 'Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Server error response (500)
exports.serverError = (res, message = 'Server Error') => {
  console.error(`Server Error: ${message}`);
  return res.status(500).json({
    success: false,
    error: 'Server Error'
  });
};

// Not found response (404)
exports.notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    error: message
  });
};

// Validation error response (400)
exports.validationError = (res, errors = []) => {
  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    errors
  });
};

// Unauthorized response (401)
exports.unauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    error: message
  });
};

// Forbidden response (403)
exports.forbidden = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    error: message
  });
};