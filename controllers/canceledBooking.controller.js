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

module.exports = { cancelBooking, getCanceledBookings };
