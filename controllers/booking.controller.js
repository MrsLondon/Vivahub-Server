const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Salon = require("../models/Salon");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { serviceId, appointmentDate, appointmentTime } = req.body;
    const customerId = req.user.userId;

    if (!serviceId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const salon = await Salon.findById(service.salon);
    if (!salon) {
      return res.status(404).json({ message: "Salon associated with this service not found" });
    }

    const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    const serviceDuration = service.duration;
    const appointmentEnd = new Date(appointmentStart.getTime() + serviceDuration * 60000);

    const serviceConflicts = await Booking.find({ serviceId, appointmentDate });
    const hasServiceConflict = serviceConflicts.some((booking) => {
      const bookingStart = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
      const bookingEnd = new Date(bookingStart.getTime() + service.duration * 60000);
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) ||
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) ||
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd)
      );
    });

    if (hasServiceConflict) {
      return res.status(400).json({ message: "This service is already booked for the selected time." });
    }

    const customerConflicts = await Booking.find({ customerId, appointmentDate, status: { $in: ["pending", "confirmed"] } });
    const hasCustomerConflict = customerConflicts.some((booking) => {
      const bookingStart = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
      const bookingEnd = new Date(bookingStart.getTime() + service.duration * 60000);
      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) ||
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) ||
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd)
      );
    });

    if (hasCustomerConflict) {
      return res.status(400).json({ message: "You already have a booking that conflicts with this time." });
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

    res.status(201).json({ message: "Appointment booked successfully", booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error: error.message });
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
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Other controller functions (getBookingById, updateBookingStatus, rescheduleBooking, deleteBooking) would follow a similar pattern.

module.exports = {
  createBooking,
  getAllBookings,
  // Add other controller functions here
};