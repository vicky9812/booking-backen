const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  recurrence: {
    // For recurring availability patterns
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  recurrenceEndDate: {
    // If it's a recurring availability, when does it end?
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
AvailabilitySchema.index({ provider: 1, startTime: 1 });
AvailabilitySchema.index({ startTime: 1, status: 1 });

// Create compound index for querying available slots efficiently
AvailabilitySchema.index({ provider: 1, status: 1, startTime: 1 });

module.exports = mongoose.model('Availability', AvailabilitySchema);