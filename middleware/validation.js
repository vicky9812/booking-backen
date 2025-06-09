const { validationResult } = require('express-validator');
const responseHandler = require('../utils/responseHandler');

// Middleware to validate request body based on express-validator rules
const validation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return responseHandler.validationError(
      res, 
      errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    );
  }
  
  next();
};

module.exports = validation;