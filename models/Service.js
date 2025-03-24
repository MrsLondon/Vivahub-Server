const mongoose = require("mongoose");

// Defining schema for Service
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Automatically removes whitespace from the beginning and end of the string
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number, // duration in minutes
    required: true,
  },
  languageSpoken: {
    type: [String], // Array of strings to store languages
    default: [], // Default to an empty array
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon", // Reference to Salon model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
