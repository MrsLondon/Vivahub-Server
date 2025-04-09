const mongoose = require("mongoose");

// Defining schema for Review
const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user model
    required: true,
  },
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon", // Reference to the salon model
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // Reference to the service model
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking", // Reference to the booking model
    required: false, // Not required as reviews can be added without a booking
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
