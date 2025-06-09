const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const responseHandler = require('../utils/responseHandler');
const dateUtils = require('../utils/dateUtils');

// @desc    Create new availability slot
// @route   POST /api/providers/availability
// @access  Private/Provider
exports.createAvailability = async (req, res) => {
  try {
    const { startTime, endTime, recurrence, recurrenceEndDate } = req.body;
    const providerId = req.user.id;

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return responseHandler.error(res, 'End time must be after start time', 400);
    }

    // Create availability slot
    const availability = new Availability({
      provider: providerId,
      startTime,
      endTime,
      recurrence: recurrence || 'none',
      recurrenceEndDate: recurrenceEndDate || null,
      status: 'available'
    });

    // If it's a recurring availability, create additional slots
    if (recurrence !== 'none' && recurrenceEndDate) {
      // Future enhancement: Create recurring slots based on the recurrence pattern
      // This logic would be implemented here
    }

    await availability.save();

    responseHandler.success(res, 201, { availability });
  } catch (err) {
    console.error('Error in createAvailability:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get all availability slots for the provider
// @route   GET /api/providers/availability
// @access  Private/Provider
exports.getMyAvailability = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Optional date range filtering
    const { startDate, endDate } = req.query;
    const query = { provider: providerId };
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const availability = await Availability.find(query).sort({ startTime: 1 });

    responseHandler.success(res, 200, { availability });
  } catch (err) {
    console.error('Error in getMyAvailability:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Update availability slot
// @route   PUT /api/providers/availability/:id
// @access  Private/Provider
exports.updateAvailability = async (req, res) => {
  try {
    const availabilityId = req.params.id;
    const providerId = req.user.id;
    const { startTime, endTime, status } = req.body;

    // Find the availability slot
    let availability = await Availability.findById(availabilityId);

    // Check if availability exists
    if (!availability) {
      return responseHandler.error(res, 'Availability not found', 404);
    }

    // Make sure the provider owns this availability slot
    if (availability.provider.toString() !== providerId) {
      return responseHandler.error(res, 'Not authorized to update this availability', 401);
    }

    // Make sure we're not updating a booked slot
    if (availability.status === 'booked' && status === 'blocked') {
      return responseHandler.error(res, 'Cannot block an already booked slot', 400);
    }

    // Update the availability
    const updateData = {};
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;

    availability = await Availability.findByIdAndUpdate(
      availabilityId,
      { $set: updateData },
      { new: true }
    );

    responseHandler.success(res, 200, { availability });
  } catch (err) {
    console.error('Error in updateAvailability:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Delete availability slot
// @route   DELETE /api/providers/availability/:id
// @access  Private/Provider
exports.deleteAvailability = async (req, res) => {
  try {
    const availabilityId = req.params.id;
    const providerId = req.user.id;

    // Find the availability slot
    const availability = await Availability.findById(availabilityId);

    // Check if availability exists
    if (!availability) {
      return responseHandler.error(res, 'Availability not found', 404);
    }

    // Make sure the provider owns this availability slot
    if (availability.provider.toString() !== providerId) {
      return responseHandler.error(res, 'Not authorized to delete this availability', 401);
    }

    // Make sure we're not deleting a booked slot
    if (availability.status === 'booked') {
      return responseHandler.error(res, 'Cannot delete an already booked slot', 400);
    }

    await Availability.findByIdAndRemove(availabilityId);

    responseHandler.success(res, 200, { message: 'Availability slot removed' });
  } catch (err) {
    console.error('Error in deleteAvailability:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get all bookings for the provider
// @route   GET /api/providers/bookings
// @access  Private/Provider
exports.getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Optional filters
    const { status, startDate, endDate } = req.query;
    const query = { provider: providerId };
    
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
      .populate('client', 'name email phone')
      .sort({ startTime: 1 });

    responseHandler.success(res, 200, { bookings });
  } catch (err) {
    console.error('Error in getProviderBookings:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Update booking status (confirm, cancel, complete)
// @route   PUT /api/providers/bookings/:id/status
// @access  Private/Provider
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const providerId = req.user.id;
    const { status } = req.body;

    // Find the booking
    let booking = await Booking.findById(bookingId);

    // Check if booking exists
    if (!booking) {
      return responseHandler.error(res, 'Booking not found', 404);
    }

    // Make sure the provider owns this booking
    if (booking.provider.toString() !== providerId) {
      return responseHandler.error(res, 'Not authorized to update this booking', 401);
    }

    // Update the booking status
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      { new: true }
    );

    // If booking is cancelled, update the availability slot back to available
    if (status === 'cancelled') {
      await Availability.findOneAndUpdate(
        {
          provider: providerId,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: 'booked'
        },
        { $set: { status: 'available' } }
      );
    }

    responseHandler.success(res, 200, { booking });
  } catch (err) {
    console.error('Error in updateBookingStatus:', err.message);
    responseHandler.serverError(res, err.message);
  }
};

// @desc    Get provider dashboard stats
// @route   GET /api/providers/dashboard
// @access  Private/Provider
exports.getDashboardStats = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Get counts of bookings by status
    const bookingStats = await Booking.aggregate([
      { $match: { provider: providerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format booking stats into a more usable object
    const bookingStatsByStatus = {};
    bookingStats.forEach(stat => {
      bookingStatsByStatus[stat._id] = stat.count;
    });
    
    // Get upcoming bookings (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingBookings = await Booking.find({
      provider: providerId,
      startTime: { $gte: today, $lte: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('client', 'name email phone')
    .sort({ startTime: 1 })
    .limit(10);
    
    // Get total availability hours for the current week
    const startOfWeek = dateUtils.getStartOfWeek(today);
    const endOfWeek = dateUtils.getEndOfWeek(today);
    
    const availabilitySlots = await Availability.find({
      provider: providerId,
      startTime: { $gte: startOfWeek, $lte: endOfWeek }
    });
    
    // Calculate total hours available
    const totalHoursAvailable = availabilitySlots.reduce((total, slot) => {
      const hours = (new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
    
    responseHandler.success(res, 200, {
      bookingStatsByStatus,
      upcomingBookings,
      totalHoursAvailable: parseFloat(totalHoursAvailable.toFixed(1)),
      totalBookings: upcomingBookings.length
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err.message);
    responseHandler.serverError(res, err.message);
  }
};