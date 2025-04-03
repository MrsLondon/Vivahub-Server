const Booking = require("../models/Booking");
const CanceledBooking = require("../models/CanceledBooking");

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create a new document in the CanceledBookings collection
    const canceledBooking = new CanceledBooking({
      customerId: booking.customerId,
      salonId: booking.salonId,
      serviceId: booking.serviceId,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      bookingStatus: "Service Canceled",
      paymentStatus: booking.paymentStatus,
    });
    await canceledBooking.save();

    // Remove the booking from the Bookings collection
    await Booking.findByIdAndDelete(id);

    res.status(200).json({ message: "Booking canceled successfully." });
  } catch (error) {
    console.error("Error canceling booking:", error.message);
    res.status(500).json({ message: "Failed to cancel booking." });
  }
};

const getCanceledBookings = async (req, res) => {
  try {
    const canceledBookings = await CanceledBooking.find({
      customerId: req.user.userId,
    })
      .populate("salonId", "name")
      .populate("serviceId", "name");

    res.status(200).json(canceledBookings);
  } catch (error) {
    console.error("Error fetching canceled bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch canceled bookings." });
  }
};

/**
 * Get all canceled bookings without authentication - FOR TESTING/VIEWING ONLY
 * 
 * Purpose:
 * - Provides a way to view canceled booking data in the view engine (handlebars)
 * - Used for testing and development purposes
 * - NOT meant for production use with sensitive data
 * 
 * Security Measures:
 * 1. Excludes sensitive information:
 *    - No customer IDs
 *    - No internal metadata (__v)
 * 2. Only returns essential booking information:
 *    - Service details (name, price, duration)
 *    - Salon details (name, location)
 *    - Cancellation status and dates
 * 
 * @route GET /api/canceledBookings/public
 * @returns {Array} List of canceled bookings with sensitive data removed
 * @warning This route should be properly secured or disabled in production
 */
const getPublicCanceledBookings = async (req, res) => {
  try {
    const canceledBookings = await CanceledBooking.find()
      .populate("salonId", "name location")        // Only essential salon info
      .populate("serviceId", "name price duration") // Only essential service info
      .select('-__v -customerId');                // Exclude sensitive data

    res.status(200).json(canceledBookings);
  } catch (error) {
    console.error("Error fetching public canceled bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch canceled bookings." });
  }
};

module.exports = { 
  cancelBooking, 
  getCanceledBookings,
  getPublicCanceledBookings 
};
