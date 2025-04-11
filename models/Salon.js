const mongoose = require("mongoose");

// Defining schema for Salon
const salonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true, // Automatically removes whitespace from the beginning and end of the string
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      "Please enter a valid phone number. It should start with a '+' followed by the country code and contain up to 15 digits (e.g., +1234567890).",
    ],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  businessType: {
    type: String,
    trim: true,
  },
  openingHours: {
    monday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    tuesday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    wednesday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    thursday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    friday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    saturday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
    sunday: {
      open: { type: String, default: null },
      close: { type: String, default: null },
    },
  },
  // When to Use closedDays: Holidays: Closure on holidays such as Christmas, New Year, etc, Special Events: Closure for renovations, training, or other events, Specific Dates: Any date when the salon will not be operating, even if it would normally be open on that day of the week.
  closedDays: {
    type: [String], // Dates array with "YYYY-MM-DD" format
    default: [],
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  languageSpoken: {
    type: [String], // Array of strings to store languages
    default: [], // Default to an empty array
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Salon = mongoose.model("Salon", salonSchema);
module.exports = Salon;
