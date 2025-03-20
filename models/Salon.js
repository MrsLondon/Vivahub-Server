const mongoose = require("mongoose");
// Defining schema for Salon
const salonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Automatically removes whitespace from the beginning and end of the string
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user model (business owner)
    required: true,
  },
  phone: {
    type: String,
    required: true, // Make it required if every salon must have a phone number
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], // Regex for phone number validation
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user model (business owner)
    },
  ],
  createdAt: {
    // Date when the salon was created
    type: Date,
    default: Date.now,
  },
});

const Salon = mongoose.model("Salon", salonSchema);
module.exports = Salon;
