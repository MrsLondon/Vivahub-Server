const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware");
const {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getSupportedLanguages,
  getServicesByUser,
} = require("../controllers/service.controller");

// Middleware to check if the user is a business owner
const isBusiness = (req, res, next) => {
  if (req.user.role !== "business") {
    return res.status(403).json({
      message: "Access denied. Only business users can perform this action.",
    });
  }
  next();
};

// Service routes
// Create new service - Protected route, business only
router.post("/", authenticateUser, isBusiness, addService);

// Get all services - Public route
router.get("/", getAllServices);

// Get supported languages - Public route
router.get("/languages", getSupportedLanguages);

// Get user's services - Protected route, business only
router.get("/user", authenticateUser, isBusiness, getServicesByUser);

// Get specific service - Public route
router.get("/:id", getServiceById);

// Update service - Protected route, business only
router.put("/update/:id", authenticateUser, isBusiness, updateService);

// Delete service - Protected route, business only
router.delete("/delete/:id", authenticateUser, isBusiness, deleteService);

module.exports = router;
