const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  cancelBooking,
  getCanceledBookings,
} = require("../controllers/canceledBooking.controller");

// Route to cancel a booking
router.delete("/cancel/:id", authMiddleware, cancelBooking);

// Route to get all canceled bookings for a user
router.get("/", authMiddleware, getCanceledBookings);

module.exports = router;
