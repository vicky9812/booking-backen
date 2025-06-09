const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validation = require('../middleware/validation');
const { check } = require('express-validator');

// All routes here require authentication
router.use(auth);

// All routes here require admin role
router.use(roleCheck('admin'));

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', adminController.getAllUsers);

// @route   GET api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', adminController.getUserById);

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put(
  '/users/:id',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('role', 'Role must be a valid role').optional().isIn(['client', 'provider', 'admin']),
  ],
  validation,
  adminController.updateUser
);

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', adminController.deleteUser);

// @route   GET api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', adminController.getAllBookings);

// @route   GET api/admin/bookings/:id
// @desc    Get booking by ID
// @access  Private/Admin
router.get('/bookings/:id', adminController.getBookingById);

// @route   PUT api/admin/bookings/:id
// @desc    Update booking
// @access  Private/Admin
router.put(
  '/bookings/:id',
  [
    check('status', 'Status is required').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']),
  ],
  validation,
  adminController.updateBooking
);

// @route   DELETE api/admin/bookings/:id
// @desc    Delete booking
// @access  Private/Admin
router.delete('/bookings/:id', adminController.deleteBooking);

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboardStats);

// @route   GET api/admin/payments
// @desc    Get all payments
// @access  Private/Admin
router.get('/payments', adminController.getAllPayments);

module.exports = router;