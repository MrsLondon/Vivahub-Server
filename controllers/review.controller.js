const Review = require("../models/Review");
const Booking = require("../models/Booking");

// Add new review
exports.addReview = async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

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

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this booking.",
      });
    }

    const newReview = await Review.create({
      bookingId,
      customerId: booking.customerId,
      salonId: booking.salonId,
      serviceId: booking.serviceId,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(newReview._id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
    next(error);
  }
};

// Get all reviews
exports.getAllReviews = async (req, res, next) => {
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
};

// Get reviews by salon
exports.getReviewsBySalon = async (req, res, next) => {
  try {
    const { salonId } = req.params;

    const reviews = await Review.find({ salonId })
      .populate("customerId", "firstName lastName")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by salon:", error.message);
    next(error);
  }
};

// Get reviews by service
exports.getReviewsByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Review.find({ serviceId })
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by service:", error.message);
    next(error);
  }
};

// Get review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json(review);
  } catch (error) {
    console.error("Error fetching review by ID:", error.message);
    next(error);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.customerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only update your own reviews.",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

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
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

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
};
