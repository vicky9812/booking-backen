const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const providerController = require('../controllers/providerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validation = require('../middleware/validation');

// All routes here require authentication
router.use(auth);

// All routes here require provider role
router.use(roleCheck('provider'));

// @route   POST api/providers/availability
// @desc    Create new availability slot
// @access  Private/Provider
router.post(
  '/availability',
  [
    check('startTime', 'Start time is required').not().isEmpty().isISO8601(),
    check('endTime', 'End time is required').not().isEmpty().isISO8601(),
    check('recurrence', 'Recurrence must be a valid option').optional().isIn(['none', 'daily', 'weekly', 'monthly']),
    check('recurrenceEndDate', 'Recurrence end date must be a valid date').optional().isISO8601(),
  ],
  validation,
  providerController.createAvailability
);

// @route   GET api/providers/availability
// @desc    Get all availability slots for the provider
// @access  Private/Provider
router.get('/availability', providerController.getMyAvailability);

// @route   PUT api/providers/availability/:id
// @desc    Update availability slot
// @access  Private/Provider
router.put(
  '/availability/:id',
  [
    check('startTime', 'Start time is required').optional().isISO8601(),
    check('endTime', 'End time is required').optional().isISO8601(),
    check('status', 'Status must be a valid option').optional().isIn(['available', 'blocked']),
  ],
  validation,
  providerController.updateAvailability
);

// @route   DELETE api/providers/availability/:id
// @desc    Delete availability slot
// @access  Private/Provider
router.delete('/availability/:id', providerController.deleteAvailability);

// @route   GET api/providers/bookings
// @desc    Get all bookings for the provider
// @access  Private/Provider
router.get('/bookings', providerController.getProviderBookings);

// @route   PUT api/providers/bookings/:id/status
// @desc    Update booking status (confirm, cancel, complete)
// @access  Private/Provider
router.put(
  '/bookings/:id/status',
  [
    check('status', 'Status is required').isIn(['confirmed', 'cancelled', 'completed']),
  ],
  validation,
  providerController.updateBookingStatus
);

// @route   GET api/providers/dashboard
// @desc    Get provider dashboard stats
// @access  Private/Provider
router.get('/dashboard', providerController.getDashboardStats);

module.exports = router;