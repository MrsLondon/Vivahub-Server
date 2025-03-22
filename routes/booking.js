const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Salon = require("../models/Salon");

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
 * @route POST /api/bookings
 * @access Private (Customer only)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Extract booking details from request body
    const { salonId, serviceId, appointmentDate, appointmentTime } = req.body;
    const customerId = req.user.userId; // Get customer ID from authenticated user

    // Validate that all required fields are provided
    if (!salonId || !serviceId || !appointmentDate || !appointmentTime) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Convert appointment date and time to a single Date object for validation
    const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    // Fetch the service to get its duration and verify it exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Calculate the end time of the appointment based on service duration
    const serviceDuration = service.duration; // Duration in minutes
    const appointmentEnd = new Date(
      appointmentStart.getTime() + serviceDuration * 60000
    );

    // Check for conflicts with other bookings of the same service
    // This ensures no double booking of the same service at the same time
    const serviceConflicts = await Booking.find({
      serviceId,
      appointmentDate,
      status: { $in: ["pending", "confirmed"] }, // Only check active bookings
    });

    // Check if the new booking time overlaps with any existing bookings
    const hasServiceConflict = serviceConflicts.some((booking) => {
      // Convert booking time to Date object for comparison
      const bookingStart = new Date(
        `${booking.appointmentDate.toISOString().split("T")[0]}T${
          booking.appointmentTime
        }`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );

      // Check for any overlap between the new booking and existing bookings
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) || // New booking starts during an existing booking
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) || // New booking ends during an existing booking
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd) // New booking completely encompasses an existing booking
      );
    });

    // If there's a conflict, return an error
    if (hasServiceConflict) {
      return res.status(400).json({
        message: "This service is already booked for the selected time.",
      });
    }

    // Check for conflicts with other bookings of the same customer
    // This prevents customers from booking multiple services at the same time
    const customerConflicts = await Booking.find({
      customerId,
      appointmentDate,
      status: { $in: ["pending", "confirmed"] }, // Only check active bookings
    });

    // Check if the new booking time overlaps with any of the customer's existing bookings
    const hasCustomerConflict = customerConflicts.some((booking) => {
      const bookingStart = new Date(
        `${booking.appointmentDate.toISOString().split("T")[0]}T${
          booking.appointmentTime
        }`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );

      // Check for any overlap between the new booking and customer's existing bookings
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) || // New booking starts during an existing booking
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) || // New booking ends during an existing booking
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd) // New booking completely encompasses an existing booking
      );
    });

    // If there's a conflict, return an error
    if (hasCustomerConflict) {
      return res.status(400).json({
        message: "You already have a booking that conflicts with this time.",
      });
    }

    // Create new booking with validated data
    const newBooking = new Booking({
      customerId,
      salonId,
      serviceId,
      appointmentDate,
      appointmentTime,
    });

    // Save the booking to the database
    await newBooking.save();

    // Populate the booking with related data (customer, salon, service details)
    // This ensures the frontend receives complete information without additional API calls
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('customerId', 'firstName lastName') // Get customer's name
      .populate('salonId', 'name') // Get salon name
      .populate('serviceId', 'name price duration'); // Get service details

    // Return success response with populated booking data
    res.status(201).json({
      message: "Appointment booked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    // Handle any errors that occur during the booking process
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
});

/**
 * GET /api/bookings
 * Get all bookings with optional role-based filtering
 * 
 * This endpoint returns bookings based on the user's role:
 * - Customers see only their own bookings
 * - Business owners see bookings for their salon
 * 
 * @route GET /api/bookings
 * @access Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Initialize query object for filtering bookings
    const query = {};
    
    // Filter bookings based on user role
    if (req.user.role === "customer") {
      // Customers can only see their own bookings
      query.customerId = req.user.userId;
    } else if (req.user.role === "business") {
      // Business owners can see bookings for their salon
      const salon = await Salon.findOne({ owner: req.user.userId });
      if (salon) {
        query.salonId = salon._id;
      }
    }

    // Find bookings matching the query and populate related data
    const bookings = await Booking.find(query)
      .populate('customerId', 'firstName lastName') // Get customer details
      .populate('salonId', 'name') // Get salon details
      .populate('serviceId', 'name price duration') // Get service details
      .sort({ appointmentDate: 1, appointmentTime: 1 }); // Sort by date and time

    // Return the filtered and populated bookings
    res.json(bookings);
  } catch (error) {
    // Handle any errors that occur during the fetch process
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 * 
 * This endpoint returns a single booking with populated data.
 * Access is restricted to the booking owner or the associated business owner.
 * 
 * @route GET /api/bookings/:id
 * @access Private
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // Find the booking and populate related data
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'firstName lastName') // Get customer details
      .populate('salonId', 'name') // Get salon details
      .populate('serviceId', 'name price duration'); // Get service details

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user authorization
    // Only the booking owner or business owner can view the booking
    if (
      booking.customerId._id.toString() !== req.user.userId &&
      req.user.role !== "business"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Return the populated booking data
    res.json(booking);
  } catch (error) {
    // Handle any errors that occur during the fetch process
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
});

/**
 * PATCH /api/bookings/:id
 * Update booking status
 * 
 * This endpoint allows updating the status of a booking.
 * Access is restricted to the booking owner or the associated business owner.
 * 
 * @route PATCH /api/bookings/:id
 * @access Private
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    // Extract status from request body and get user info
    const { status } = req.body;
    const userId = req.user.userId;
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user authorization
    // Only the booking owner or business owner can update the status
    if (
      booking.customerId.toString() !== userId &&
      req.user.role !== "business"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    // Populate the updated booking with related data
    const updatedBooking = await Booking.findById(bookingId)
      .populate('customerId', 'firstName lastName') // Get customer details
      .populate('salonId', 'name') // Get salon details
      .populate('serviceId', 'name price duration'); // Get service details

    // Return success response with populated booking data
    res.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    // Handle any errors that occur during the update process
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
});

/**
 * PATCH /api/bookings/:id/reschedule
 * Update booking date and time
 * 
 * This endpoint allows rescheduling a booking.
 * Access is restricted to the booking owner only.
 * 
 * @route PATCH /api/bookings/:id/reschedule
 * @access Private (Customer only)
 */
router.patch("/:id/reschedule", authMiddleware, async (req, res) => {
  try {
    // Extract new date and time from request body
    const { appointmentDate, appointmentTime } = req.body;
    const userId = req.user.userId;
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user authorization
    // Only the booking owner can reschedule
    if (booking.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if the new time slot is available
    const existingBooking = await Booking.findOne({
      salonId: booking.salonId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] }, // Only check active bookings
    });

    // If the time slot is already booked, return an error
    if (existingBooking) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    // Update the booking date and time
    booking.appointmentDate = appointmentDate;
    booking.appointmentTime = appointmentTime;
    await booking.save();

    // Populate the updated booking with related data
    const updatedBooking = await Booking.findById(bookingId)
      .populate('customerId', 'firstName lastName') // Get customer details
      .populate('salonId', 'name') // Get salon details
      .populate('serviceId', 'name price duration'); // Get service details

    // Return success response with populated booking data
    res.json({ message: "Booking rescheduled successfully", booking: updatedBooking });
  } catch (error) {
    // Handle any errors that occur during the rescheduling process
    res.status(500).json({ message: "Error rescheduling booking", error: error.message });
  }
});

module.exports = router;
