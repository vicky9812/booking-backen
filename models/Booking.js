const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
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
  duration: {
    // Duration in minutes
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['not_paid', 'pending', 'paid', 'refunded'],
    default: 'not_paid'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
BookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for common queries
BookingSchema.index({ client: 1, status: 1 });
BookingSchema.index({ provider: 1, status: 1 });
BookingSchema.index({ startTime: 1 });
BookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', BookingSchema);