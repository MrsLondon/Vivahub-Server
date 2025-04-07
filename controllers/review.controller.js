const Review = require("../models/Review");
const Booking = require("../models/Booking");

// Add new review
exports.addReview = async (req, res, next) => {
  try {
    console.log("Review submission received:", req.body);
    console.log("User:", req.user);
    console.log("File:", req.file);
    
    const { bookingId, salonId, serviceId, rating, comment } = req.body;
    // Image URL will be available in req.body.image if an image was uploaded

    let reviewData = {
      customerId: req.user.userId,
      rating,
      comment,
    };

    // If bookingId is provided, verify and use booking details
    if (bookingId) {
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

      // Use booking details
      reviewData.bookingId = bookingId;
      reviewData.salonId = booking.salonId;
      reviewData.serviceId = booking.serviceId;
    } 
    // If direct salonId and serviceId are provided (without bookingId)
    else if (salonId && serviceId) {
      reviewData.salonId = salonId;
      reviewData.serviceId = serviceId;
    } 
    // If neither bookingId nor salonId+serviceId are provided
    else {
      return res.status(400).json({
        message: "Either bookingId or both salonId and serviceId must be provided.",
      });
    }

    // Add image URL if it exists
    if (req.body.image) {
      reviewData.image = req.body.image;
    }

    const review = new Review(reviewData);
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("customerId", "firstName lastName")
      .populate("salonId", "name")
      .populate("serviceId", "name");

    res.status(201).json({
      message: "Review added successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      message: "Error adding review.",
      error: error.message,
    });
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
    // Add image URL if it was uploaded
    if (req.body.image) review.image = req.body.image;

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
