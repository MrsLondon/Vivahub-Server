const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Service Canceled", "Service Completed"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
