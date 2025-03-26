const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware");
const {
  addReview,
  getAllReviews,
  getReviewsBySalon,
  getReviewsByService,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

// Middleware to verify if the user is a customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Access denied. Only customers can perform this action.",
    });
  }
  next();
};

// Review routes
router.post("/", authenticateUser, isCustomer, addReview);
router.get("/", getAllReviews);
router.get("/salon/:salonId", getReviewsBySalon);
router.get("/service/:serviceId", getReviewsByService);
router.get("/:id", getReviewById);
router.put("/:id", authenticateUser, isCustomer, updateReview);
router.delete("/:id", authenticateUser, isCustomer, deleteReview);

module.exports = router;
