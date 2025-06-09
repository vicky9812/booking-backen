const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validation = require('../middleware/validation');

// All routes here require authentication
router.use(auth);

// All routes here require client role
router.use(roleCheck('client'));

// @route   GET api/clients/providers
// @desc    Get all available providers
// @access  Private/Client
router.get('/providers', clientController.getAvailableProviders);

// @route   GET api/clients/providers/:id/availability
// @desc    Get availability slots for a specific provider
// @access  Private/Client
router.get(
  '/providers/:id/availability',
  [
    check('startDate', 'Start date is required').optional().isISO8601(),
    check('endDate', 'End date is required').optional().isISO8601(),
  ],
  validation,
  clientController.getProviderAvailability
);

// @route   POST api/clients/bookings
// @desc    Create a new booking
// @access  Private/Client
router.post(
  '/bookings',
  [
    check('providerId', 'Provider ID is required').not().isEmpty(),
    check('service', 'Service is required').not().isEmpty(),
    check('startTime', 'Start time is required').isISO8601(),
    check('endTime', 'End time is required').isISO8601(),
  ],
  validation,
  clientController.createBooking
);

// @route   GET api/clients/bookings
// @desc    Get all bookings for the client
// @access  Private/Client
router.get('/bookings', clientController.getClientBookings);

// @route   GET api/clients/bookings/:id
// @desc    Get a specific booking
// @access  Private/Client
router.get('/bookings/:id', clientController.getBookingById);

// @route   PUT api/clients/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private/Client
router.put(
  '/bookings/:id/cancel',
  [
    check('reason', 'Cancellation reason is required').optional(),
  ],
  validation,
  clientController.cancelBooking
);

// @route   POST api/clients/payments
// @desc    Process a payment for booking
// @access  Private/Client
router.post(
  '/payments',
  [
    check('bookingId', 'Booking ID is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric(),
    check('currency', 'Currency is required').not().isEmpty(),
    check('method', 'Payment method is required').isIn(['stripe', 'razorpay', 'paypal', 'other']),
  ],
  validation,
  clientController.processPayment
);

module.exports = router;