const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Book an appointment (Customer Only)
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const { salonId, serviceId, appointmentDate, appointmentTime } = req.body;
    const customerId = req.user.userId;

    // Validate required fields
    if (!salonId || !serviceId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      salonId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create new booking
    const newBooking = new Booking({
      customerId,
      salonId,
      serviceId,
      appointmentDate,
      appointmentTime,
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

module.exports = router;