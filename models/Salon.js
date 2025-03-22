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
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
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
    type: Object, // store opening hours as an object
    required: true,
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Salon = mongoose.model("Salon", salonSchema);
module.exports = Salon;
