const router = require("express").Router();
const Review = require("../models/Review");
const authenticateUser = require("../middlewares/authMiddleware");
const Booking = require("../models/Booking");

// Middleware to check if the user is a customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Access denied. Only customers can perform this action.",
    });
  }
  next();
};

// POST /api/review - Add a new review (customer only)
router.post("/", authenticateUser, isCustomer, async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  try {
    // Search for the booking of the authenticated user
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Check if the booking is confirmed
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "You can only review a completed booking.",
      });
    }

    // Check if the booking date and time have passed
    const now = new Date();
    const bookingDateTime = new Date(
      `${booking.appointmentDate}T${booking.appointmentTime}`
    );

    if (now < bookingDateTime) {
      return res.status(400).json({
        message:
          "You can only review a booking after the scheduled date and time.",
      });
    }

    // Check if the booking already has a review
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this booking.",
      });
    }

    // Create a new review
    const newReview = await Review.create({
      bookingId,
      custumerId: booking.customerId, // Extracted from the booking
      salonId: booking.salonId, // Extracted from the booking
      serviceId: booking.serviceId, // Extracted from the booking
      rating,
      comment,
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
    next(error);
  }
});

// GET /api/review - Get all reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    next(error);
  }
});

// GET /api/review/:id - Get a specific review by ID
router.get("/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json(review);
  } catch (error) {
    console.error("Error fetching review:", error.message);
    next(error);
  }
});

// PUT /api/reviews/:id - Update a review (customer only)
router.put("/:id", authenticateUser, isCustomer, async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Verify if the review belongs to the authenticated user
    if (review.custumerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only update your own reviews.",
      });
    }

    // Update the review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.json({ message: "Review updated successfully.", review });
  } catch (error) {
    console.error("Error updating review:", error.message);
    next(error);
  }
});

module.exports = router;
