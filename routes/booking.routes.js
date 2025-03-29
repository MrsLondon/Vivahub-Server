const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * POST /api/bookings
 * Create a new booking for a service
 *
 * This endpoint handles the creation of a new booking with the following features:
 * 1. Validates required fields
 * 2. Checks for time slot conflicts with other bookings
 * 3. Ensures the service exists
 * 4. Validates date and time format
 * 5. Returns populated booking data
 *
 * GET /api/bookings
 * Get all bookings with optional role-based filtering
 * This endpoint returns bookings based on the user's role:
 * - Customers see only their own bookings
 * - Business owners see bookings for their salon
 *
 *  * GET /api/bookings/:id
 * Get a specific booking by ID
 *
 * This endpoint returns a single booking with populated data.
 * Access is restricted to the booking owner or the associated business owner.
 *
 *  * PATCH /api/bookings/:id
 * Update booking status
 *
 * This endpoint allows updating the status of a booking.
 * Access is restricted to the booking owner or the associated business owner.
 *
 *  * PATCH /api/bookings/:id/reschedule
 * Update booking date and time
 *
 * This endpoint allows rescheduling a booking.
 * Access is restricted to the booking owner only.
 * @route POST /api/bookings
 * @access Private (Customer only)
 */

const {
  createBooking,
  getAllBookings,
  rescheduleBooking,
  cancelBooking,
  // Import other controller functions here
} = require("../controllers/booking.controller");

// Create a new booking
router.post("/", authMiddleware, createBooking);

// Get all bookings
router.get("/", authMiddleware, getAllBookings);

// Reschedule a booking
router.patch("/reschedule/:id", authMiddleware, rescheduleBooking);

// Define other routes here (e.g., GET /:id, PATCH /:id, DELETE /:id)

module.exports = router;
