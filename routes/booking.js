const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Salon = require("../models/Salon");

// Book an appointment (Customer Only)
// router.post("/bookings", authMiddleware, async (req, res) => {
//   try {
//     const { salonId, serviceId, appointmentDate, appointmentTime } = req.body;
//     const customerId = req.user.userId;

//     // Validate required fields
//     if (!salonId || !serviceId || !appointmentDate || !appointmentTime) {
//       return res
//         .status(400)
//         .json({ message: "Please fill in all required fields" });
//     }

//     // Check if the service exists
//     const service = await Service.findById(serviceId);
//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     // Check if the time slot is available
//     const existingBooking = await Booking.findOne({
//       salonId,
//       appointmentDate,
//       appointmentTime,
//       status: { $in: ["pending", "confirmed"] },
//     });

//     if (existingBooking) {
//       return res.status(400).json({ message: "Time slot is already booked" });
//     }

//     // Create new booking
//     const newBooking = new Booking({
//       customerId,
//       salonId,
//       serviceId,
//       appointmentDate,
//       appointmentTime,
//     });

//     await newBooking.save();

//     res.status(201).json({
//       message: "Appointment booked successfully",
//       booking: newBooking,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error booking appointment", error: error.message });
//   }
// });

// Book an appointment (Customer Only) - considering the time schedule of the service and the other bookings from the customer
router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    const { salonId, serviceId, appointmentDate, appointmentTime } = req.body;
    const customerId = req.user.userId;

    // Validating required fields
    if (!salonId || !serviceId || !appointmentDate || !appointmentTime) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Combine appointmentDate and appointmentTime into a single Date object
    const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    // Fetch the service to get its duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    const serviceDuration = service.duration; // Duration in minutes
    const appointmentEnd = new Date(
      appointmentStart.getTime() + serviceDuration * 60000
    );

    // Check for conflicts with other bookings of the same service
    const serviceConflicts = await Booking.find({
      serviceId, // Verify the same service
      appointmentDate, // verify the same date
      status: { $in: ["pending", "confirmed"] }, // only pending and confirmed bookings
    });

    const hasServiceConflict = serviceConflicts.some((booking) => {
      const bookingStart = new Date(
        `${booking.appointmentDate.toISOString().split("T")[0]}T${
          booking.appointmentTime
        }`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );

      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) || // the requested time starts within another booking
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) || // the requested time ends within another booking
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd) // the requested time encompasses another booking
      );
    });

    if (hasServiceConflict) {
      return res.status(400).json({
        message: "This service is already booked for the selected time.",
      });
    }

    // Check for conflicts with other bookings of the same customer
    const customerConflicts = await Booking.find({
      customerId, // Verify the same customer
      appointmentDate, // Verify the
      status: { $in: ["pending", "confirmed"] }, // only pending and confirmed bookings
    });

    const hasCustomerConflict = customerConflicts.some((booking) => {
      const bookingStart = new Date(
        `${booking.appointmentDate.toISOString().split("T")[0]}T${
          booking.appointmentTime
        }`
      );
      const bookingEnd = new Date(
        bookingStart.getTime() + service.duration * 60000
      );

      return (
        (appointmentStart >= bookingStart && appointmentStart < bookingEnd) || // the requested time starts within another booking
        (appointmentEnd > bookingStart && appointmentEnd <= bookingEnd) || // the requested time ends within another booking
        (appointmentStart <= bookingStart && appointmentEnd >= bookingEnd) // the requested time encompasses another booking
      );
    });

    if (hasCustomerConflict) {
      return res.status(400).json({
        message: "You already have a booking that conflicts with this time.",
      });
    }

    // Create new booking
    const newBooking = new Booking({
      customerId,
      salonId,
      serviceId,
      appointmentDate,
      appointmentTime, // Stored as a string
    });

    await newBooking.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      booking: newBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error booking appointment", error: error.message });
  }
});

// Updating booking status (customer or business owner)
router.patch("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // New status
    const userId = req.user.userId; // Authenticated user ID
    const bookingId = req.params.id; // Booking ID

    // Checking if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Checking if the user is authorized to update the booking
    if (
      booking.customerId.toString() !== userId &&
      req.user.role !== "business"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Updating booking status
    booking.status = status;
    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
});

// Updating booking date and time (customer only)
router.patch("/bookings/:id/reschedule", authMiddleware, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const userId = req.user.userId;
    const bookingId = req.params.id;

    // Checking if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Checking if the user is authorized to update the booking
    if (booking.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Checking if the new time slot is available
    const existingBooking = await Booking.findOne({
      salonId: booking.salonId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    // Updating booking date and time
    booking.appointmentDate = appointmentDate;
    booking.appointmentTime = appointmentTime;
    await booking.save();

    res.json({ message: "Booking rescheduled successfully", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rescheduling booking", error: error.message });
  }
});

module.exports = router;
