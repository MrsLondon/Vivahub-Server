const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Salon = require("../models/Salon");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { serviceId, appointmentDate, appointmentTime } = req.body;
    const customerId = req.user.userId;

    if (!serviceId || !appointmentDate || !appointmentTime) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const salon = await Salon.findById(service.salon);
    if (!salon) {
      return res
        .status(404)
        .json({ message: "Salon associated with this service not found" });
    }

    const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    const serviceDuration = service.duration;
    const appointmentEnd = new Date(
      appointmentStart.getTime() + serviceDuration * 60000
    );

    const serviceConflicts = await Booking.find({ serviceId, appointmentDate });
    const hasServiceConflict = serviceConflicts.some((booking) => {
      const bookingStart = new Date(
        `${booking.appointmentDate}T${booking.appointmentTime}`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) ||
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) ||
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd)
      );
    });

    if (hasServiceConflict) {
      return res.status(400).json({
        message: "This service is already booked for the selected time.",
      });
    }

    const customerConflicts = await Booking.find({
      customerId,
      appointmentDate,
      status: { $in: ["pending", "confirmed"] },
    });
    const hasCustomerConflict = customerConflicts.some((booking) => {
      const bookingStart = new Date(
        `${booking.appointmentDate}T${booking.appointmentTime}`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) ||
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) ||
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd)
      );
    });

    if (hasCustomerConflict) {
      return res.status(400).json({
        message: "You already have a booking that conflicts with this time.",
      });
    }

    const newBooking = new Booking({
      customerId,
      salonId: salon._id,
      serviceId,
      appointmentDate,
      appointmentTime,
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name price duration");

    res.status(201).json({
      message: "Appointment booked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error booking appointment", error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === "customer") {
      query.customerId = req.user.userId;
    } else if (req.user.role === "business") {
      const salon = await Salon.findOne({ owner: req.user.userId });
      if (salon) {
        query.salonId = salon._id;
      }
    }

    const bookings = await Booking.find(query)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name price duration")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Reschedule a booking
const rescheduleBooking = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const bookingId = req.params.id;
    const userId = req.user.userId;

    // Verify if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify if the user is the customer of the booking
    if (booking.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verify if the new date and time are valid
    const existingBooking = await Booking.findOne({
      salonId: booking.salonId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Time slot is already booked in the salon" });
    }

    // Verify if the client has any conflicting bookings
    const customerConflicts = await Booking.find({
      customerId: userId,
      appointmentDate,
    });

    const hasConflict = customerConflicts.some((conflictBooking) => {
      const conflictStart = new Date(
        `${conflictBooking.appointmentDate}T${conflictBooking.appointmentTime}`
      );
      const conflictEnd = new Date(
        conflictStart.getTime() + conflictBooking.serviceId.duration * 60000
      );

      const newStart = new Date(`${appointmentDate}T${appointmentTime}`);
      const newEnd = new Date(
        newStart.getTime() + booking.serviceId.duration * 60000
      );

      return (
        (newStart >= conflictStart && newStart < conflictEnd) || // New booking starts during another booking
        (newEnd > conflictStart && newEnd <= conflictEnd) || // New booking ends during another booking
        (newStart <= conflictStart && newEnd >= conflictEnd) // New booking completely overlaps another booking
      );
    });

    if (hasConflict) {
      return res
        .status(400)
        .json({
          message: "You already have a booking that conflicts with this time.",
        });
    }

    // Update the booking with the new date and time
    booking.appointmentDate = appointmentDate;
    booking.appointmentTime = appointmentTime;
    await booking.save();

    // Return the updated booking details
    const updatedBooking = await Booking.findById(bookingId)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name price duration");

    res.json({
      message: "Booking rescheduled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error.message);
    res.status(500).json({ message: "Error rescheduling booking" });
  }
};

// Other controller functions (getBookingById, updateBookingStatus, rescheduleBooking, deleteBooking) would follow a similar pattern.

module.exports = {
  createBooking,
  getAllBookings,
  rescheduleBooking,
  // Add other controller functions here
};
