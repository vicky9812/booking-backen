const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const responseHandler = require('../utils/responseHandler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Support for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get filters from query params
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    responseHandler.success(res, 200, {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllUsers:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return responseHandler.error(res, 'User not found', 404);
    }
    
    responseHandler.success(res, 200, { user });
  } catch (err) {
    console.error('Error in getUserById:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, bio, specialization, address } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (role) profileFields.role = role;
    if (phone) profileFields.phone = phone;
    if (bio) profileFields.bio = bio;
    if (specialization) profileFields.specialization = specialization;
    
    // Handle address fields
    if (address) {
      profileFields.address = {};
      if (address.street) profileFields.address.street = address.street;
      if (address.city) profileFields.address.city = address.city;
      if (address.state) profileFields.address.state = address.state;
      if (address.zipCode) profileFields.address.zipCode = address.zipCode;
      if (address.country) profileFields.address.country = address.country;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return responseHandler.error(res, 'User not found', 404);
    }
    
    responseHandler.success(res, 200, { user: updatedUser });
  } catch (err) {
    console.error('Error in updateUser:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return responseHandler.error(res, 'User not found', 404);
    }
    
    // Delete all associated data (bookings, availability, etc.)
    // This could be enhanced with better cascaded deletion
    await Promise.all([
      Booking.deleteMany({ client: req.params.id }),
      Booking.deleteMany({ provider: req.params.id }),
      Payment.deleteMany({ booking: { $in: await Booking.find({ client: req.params.id }).distinct('_id') } })
    ]);
    
    await user.remove();
    
    responseHandler.success(res, 200, { message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in deleteUser:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    // Support for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get filters from query params
    const { status, providerId, clientId, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (providerId) query.provider = providerId;
    if (clientId) query.client = clientId;
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate('provider', 'name email specialization')
      .populate('paymentId')
      .sort({ startTime: 1 })
      .skip(startIndex)
      .limit(limit);
    
    responseHandler.success(res, 200, {
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllBookings:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get booking by ID
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('provider', 'name email specialization')
      .populate('paymentId');
    
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    responseHandler.success(res, 200, { booking });
  } catch (err) {
    console.error('Error in getBookingById:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Update booking
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Find the booking
    let booking = await Booking.findById(req.params.id);
    
    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    // Update fields
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )
      .populate('client', 'name email phone')
      .populate('provider', 'name email specialization');
    
    responseHandler.success(res, 200, { booking });
  } catch (err) {
    console.error('Error in updateBooking:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    // Delete any associated payments
    await Payment.deleteMany({ booking: req.params.id });
    
    // Delete the booking
    await booking.remove();
    
    responseHandler.success(res, 200, { message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error in deleteBooking:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user counts by role
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Format user stats into a more usable object
    const userStatsByRole = {};
    userStats.forEach(stat => {
      userStatsByRole[stat._id] = stat.count;
    });
    
    // Get booking counts by status
    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format booking stats into a more usable object
    const bookingStatsByStatus = {};
    bookingStats.forEach(stat => {
      bookingStatsByStatus[stat._id] = stat.count;
    });
    
    // Get payment stats
    const paymentStats = await Payment.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        } 
      }
    ]);
    
    // Format payment stats into a more usable object
    const paymentStatsByStatus = {};
    let totalRevenue = 0;
    paymentStats.forEach(stat => {
      paymentStatsByStatus[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      if (stat._id === 'completed') {
        totalRevenue += stat.totalAmount;
      }
    });
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('client', 'name email')
      .populate('provider', 'name email specialization')
      .sort({ createdAt: -1 })
      .limit(5);
    
    responseHandler.success(res, 200, {
      userStats: {
        total: Object.values(userStatsByRole).reduce((a, b) => a + b, 0),
        ...userStatsByRole
      },
      bookingStats: {
        total: Object.values(bookingStatsByStatus).reduce((a, b) => a + b, 0),
        ...bookingStatsByStatus
      },
      paymentStats: {
        totalRevenue,
        ...paymentStatsByStatus
      },
      recentBookings
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    // Support for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get filters from query params
    const { status, method, minAmount, maxAmount, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;
    
    // Add amount filtering if provided
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        populate: [
          { path: 'client', select: 'name email' },
          { path: 'provider', select: 'name email' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    responseHandler.success(res, 200, {
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllPayments:', err.message);
    responseHandler.serverError(res, err.message);
  }
};