const responseHandler = require('../utils/responseHandler');

// Middleware to check user role
const roleCheck = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseHandler.error(res, 'Authentication required', 401);
    }

    // If multiple roles are allowed (array)
    if (Array.isArray(role)) {
      if (!role.includes(req.user.role)) {
        return responseHandler.error(
          res, 
          `User role ${req.user.role} is not authorized to access this resource`,
          403
        );
      }
    } 
    // If only a specific role is allowed (string)
    else if (req.user.role !== role) {
      return responseHandler.error(
        res, 
        `User role ${req.user.role} is not authorized to access this resource`, 
        403
      );
    }

    next();
  };
};

module.exports = roleCheck;