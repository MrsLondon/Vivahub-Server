const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * Canceled Booking Routes Documentation
 * 
 * This file contains two types of routes:
 * 1. Protected Routes (Require Authentication):
 *    - These routes handle actual business operations
 *    - They require valid JWT tokens
 *    - They protect user-specific data and operations
 *    - Used for actual cancellation operations and viewing user-specific canceled bookings
 * 
 * 2. Public Route (No Authentication):
 *    - Specifically for viewing/testing purposes
 *    - Used by the view engine (handlebars) to display data
 *    - Excludes sensitive information
 *    - NOT meant for production use with sensitive data
 * 
 * Route Structure:
 * Protected Routes:
 * - DELETE /api/canceledBookings/cancel/:id - Requires authentication (booking owner/business)
 * - GET /api/canceledBookings - Requires authentication (shows user-specific cancellations)
 * 
 * Public Route (View/Testing Only):
 * - GET /api/canceledBookings/public - No auth required, shows limited data
 */

const {
  cancelBooking,
  getCanceledBookings,
  getPublicCanceledBookings,
} = require("../controllers/canceledBooking.controller");

// ============ PUBLIC ROUTES (For View/Testing Only) ============
/**
 * Public route to view canceled bookings - NO AUTHENTICATION
 * Purpose: Used by view engine to display canceled booking data for testing
 * Security: Excludes sensitive information like customer IDs
 * Warning: This route should be disabled or properly secured in production
 */
router.get("/public", getPublicCanceledBookings);

// ============ PROTECTED ROUTES (Require Authentication) ============
/**
 * Protected routes - require valid JWT token
 * These routes handle actual business logic and maintain security
 */

// Cancel a booking - Requires booking owner or business owner authentication
router.delete("/cancel/:id", authMiddleware, cancelBooking);

// Get user's canceled bookings - Requires authentication
router.get("/", authMiddleware, getCanceledBookings);

module.exports = router;
