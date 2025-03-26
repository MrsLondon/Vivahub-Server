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
      customerId: booking.customerId,
      salonId: booking.salonId,
      serviceId: booking.serviceId,
      rating,
      comment,
    });

    // Populate the created review with related data
    const populatedReview = await Review.findById(newReview._id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
    next(error);
  }
});

// GET /api/review - Get all reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    next(error);
  }
});

// GET /api/review/salon/:salonId - Get reviews by salon
router.get("/salon/:salonId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ salonId: req.params.salonId })
      .populate("customerId", "firstName lastName")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this salon." });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching salon reviews:", error.message);
    next(error);
  }
});

// GET /api/review/service/:serviceId - Get reviews by service
router.get("/service/:serviceId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .sort({ createdAt: -1 });

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this service." });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching service reviews:", error.message);
    next(error);
  }
});

// GET /api/review/:id - Get a specific review by ID
router.get("/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json(review);
  } catch (error) {
    console.error("Error fetching review:", error.message);
    next(error);
  }
});

// PUT /api/review/:id - Update a review (customer only)
router.put("/:id", authenticateUser, isCustomer, async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    // Find the review by ID
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Verify if the review belongs to the authenticated user
    if (review.customerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only update your own reviews.",
      });
    }

    // Update the review fields if provided
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    // Save the updated review
    await review.save();

    // Populate the updated review with related data
    const populatedReview = await Review.findById(review._id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    res.json({
      message: "Review updated successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error.message);
    next(error);
  }
});

// DELETE /api/review/:id - Delete a review (customer only)
router.delete("/:id", authenticateUser, isCustomer, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Verify if the review belongs to the authenticated user
    if (review.customerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own reviews.",
      });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error.message);
    next(error);
  }
});

module.exports = router;
