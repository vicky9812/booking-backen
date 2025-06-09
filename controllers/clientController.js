const User = require('../models/User');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const responseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');

// @desc    Get all available providers
// @route   GET /api/clients/providers
// @access  Private/Client
exports.getAvailableProviders = async (req, res) => {
  try {
    // Get all users with role 'provider'
    const providers = await User.find({ role: 'provider' })
      .select('name email specialization bio address');

    responseHandler.success(res, 200, { providers });
  } catch (err) {
    console.error('Error in getAvailableProviders:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get availability slots for a specific provider
// @route   GET /api/clients/providers/:id/availability
// @access  Private/Client
exports.getProviderAvailability = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Validate that the provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return responseHandler.error(res, 'Provider not found', 404);
    }
    
    // Optional date range filtering
    const { startDate, endDate } = req.query;
    let query = { provider: providerId, status: 'available' };
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to show availability for the next 30 days
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      query.startTime = {
        $gte: today,
        $lte: thirtyDaysLater
      };
    }

    const availability = await Availability.find(query).sort({ startTime: 1 });

    responseHandler.success(res, 200, {
      provider: {
        id: provider._id,
        name: provider.name,
        specialization: provider.specialization,
        bio: provider.bio
      },
      availability
    });
  } catch (err) {
    console.error('Error in getProviderAvailability:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Create a new booking
// @route   POST /api/clients/bookings
// @access  Private/Client
exports.createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { providerId, service, startTime, endTime, notes } = req.body;
    
    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = (end - start) / (1000 * 60);
    
    // Validate that end time is after start time
    if (end <= start) {
      return responseHandler.error(res, 'End time must be after start time', 400);
    }
    
    // Check if provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return responseHandler.error(res, 'Provider not found', 404);
    }
    
    // Check if the time slot is available
    const availabilitySlot = await Availability.findOne({
      provider: providerId,
      startTime: start,
      endTime: end,
      status: 'available'
    });
    
    if (!availabilitySlot) {
      return responseHandler.error(res, 'Selected time slot is not available', 400);
    }
    
    // Create booking
    const booking = new Booking({
      client: clientId,
      provider: providerId,
      service,
      startTime,
      endTime,
      duration: durationMinutes,
      notes,
      status: 'pending'
    });
    
    await booking.save();
    
    // Update availability status to booked
    availabilitySlot.status = 'booked';
    await availabilitySlot.save();
    
    responseHandler.success(res, 201, { booking });
  } catch (err) {
    console.error('Error in createBooking:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get all bookings for the client
// @route   GET /api/clients/bookings
// @access  Private/Client
exports.getClientBookings = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    // Optional filters
    const { status, startDate, endDate } = req.query;
    const query = { client: clientId };
    
    // Add status filtering if provided
    if (status) {
      query.status = status;
    }
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('provider', 'name email specialization')
      .sort({ startTime: 1 });

    responseHandler.success(res, 200, { bookings });
  } catch (err) {
    console.error('Error in getClientBookings:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get a specific booking
// @route   GET /api/clients/bookings/:id
// @access  Private/Client
exports.getBookingById = async (req, res) => {
  try {
    const clientId = req.user.id;
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId)
      .populate('provider', 'name email specialization bio')
      .populate('paymentId');
    
    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    // Make sure the client owns this booking
    if (booking.client.toString() !== clientId) {
      return responseHandler.error(res, 'Not authorized to access this booking', 401);
    }
    
    responseHandler.success(res, 200, { booking });
  } catch (err) {
    console.error('Error in getBookingById:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/clients/bookings/:id/cancel
// @access  Private/Client
exports.cancelBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const bookingId = req.params.id;
    const { reason } = req.body;
    
    // Find the booking
    let booking = await Booking.findById(bookingId);
    
    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    // Make sure the client owns this booking
    if (booking.client.toString() !== clientId) {
      return responseHandler.error(res, 'Not authorized to cancel this booking', 401);
    }
    
    // Check if booking is already cancelled or completed
    if (['cancelled', 'completed', 'no-show'].includes(booking.status)) {
      return responseHandler.error(res, `Cannot cancel a booking with status: ${booking.status}`, 400);
    }
    
    // Update the booking status
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status: 'cancelled', cancellationReason: reason || 'Client cancelled' } },
      { new: true }
    );
    
    // Update the availability slot back to available
    await Availability.findOneAndUpdate(
      {
        provider: booking.provider,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: 'booked'
      },
      { $set: { status: 'available' } }
    );
    
    responseHandler.success(res, 200, { booking });
  } catch (err) {
    console.error('Error in cancelBooking:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Process a payment for booking
// @route   POST /api/clients/payments
// @access  Private/Client
exports.processPayment = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { bookingId, amount, currency, method } = req.body;
    
    // Find the booking
    let booking = await Booking.findById(bookingId);
    
    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }
    
    // Make sure the client owns this booking
    if (booking.client.toString() !== clientId) {
      return responseHandler.error(res, 'Not authorized to pay for this booking', 401);
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return responseHandler.error(res, 'Booking has already been paid for', 400);
    }
    
    // Create payment record
    // Note: In a real production app, you'd integrate with actual payment gateways
    const payment = new Payment({
      booking: bookingId,
      amount,
      currency,
      method,
      status: 'completed',
      transactionId: `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Dummy transaction ID
      metadata: {}
    });
    
    await payment.save();
    
    // Update booking with payment information
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        $set: { 
          paymentStatus: 'paid',
          paymentId: payment._id,
          status: booking.status === 'pending' ? 'confirmed' : booking.status
        }
      },
      { new: true }
    );
    
    responseHandler.success(res, 201, { 
      payment,
      booking
    });
  } catch (err) {
    console.error('Error in processPayment:', err.message);
    responseHandler.serverError(res, err.message);
  }
};