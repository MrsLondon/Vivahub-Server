const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * Booking Routes Documentation
 * 
 * This file contains two types of routes:
 * 1. Protected Routes (Require Authentication):
 *    - These routes are used for actual business logic and data manipulation
 *    - They require valid JWT tokens
 *    - They maintain security for user-specific operations
 * 
 * 2. Public Routes (No Authentication):
 *    - These routes are specifically for viewing/testing purposes
 *    - They don't require authentication
 *    - They exclude sensitive information
 *    - They are primarily used for the view engine (handlebars) to display data
 *    - NOT meant for production use with sensitive data
 * 
 * Route Structure:
 * Protected Routes:
 * - POST /api/bookings (Create booking) - Requires customer authentication
 * - GET /api/bookings (Get user's bookings) - Shows bookings based on user role
 * - PATCH /api/bookings/:id (Update status) - Requires booking owner/business owner
 * - PATCH /api/bookings/:id/reschedule - Requires booking owner
 * 
 * Public Route (View/Testing Only):
 * - GET /api/bookings/public - No auth required, shows limited booking data
 */

const {
  createBooking,
  getAllBookings,
  rescheduleBooking,
  cancelBooking,
  getPublicBookings,
} = require("../controllers/booking.controller");

// ============ PUBLIC ROUTES (For View/Testing Only) ============
/**
 * Public route to view all bookings - NO AUTHENTICATION
 * Purpose: Used by view engine to display booking data for testing
 * Security: Excludes sensitive information like customer IDs
 * Warning: This route should be disabled or properly secured in production
 */
router.get("/public", getPublicBookings);

// ============ PROTECTED ROUTES (Require Authentication) ============
/**
 * Protected routes - require valid JWT token
 * These routes handle actual business logic and maintain security
 */

// Create new booking - Customer only
router.post("/", authMiddleware, createBooking);

// Get all bookings - Role-based access
router.get("/", authMiddleware, getAllBookings);

// Reschedule booking - Booking owner only
router.patch("/:id/reschedule", authMiddleware, rescheduleBooking);

// Cancel booking - Booking owner or business owner
router.delete("/:id", authMiddleware, cancelBooking);

module.exports = router;
