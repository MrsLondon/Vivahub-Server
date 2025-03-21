const mongoose = require("mongoose");

// Defining schema for Review
const reviewSchema = new mongoose.Schema({
  custumerId: {
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
    match: [
      /^https?:\/\/res\.cloudinary\.com\/[^\s]+$/,
      "Please enter a valid Cloudinary URL",
    ], // Regex to validate Cloudinary URLs
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
