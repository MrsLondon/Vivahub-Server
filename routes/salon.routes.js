const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware");
const {
  addSalon,
  getAllSalons,
  getSalonById,
  getSalonByUser,
  updateSalon,
  deleteSalon,
} = require("../controllers/salon.controller");

// Middleware to check if the user is a business owner
const isBusiness = (req, res, next) => {
  if (req.user.role !== "business") {
    return res.status(403).json({
      message: "Access denied. Only business users can perform this action.",
    });
  }
  next();
};

// Salon routes
router.post("/", authenticateUser, isBusiness, addSalon); // Create a new salon
router.get("/user", authenticateUser, isBusiness, getSalonByUser); // Get salon by user
router.put("/update/:id", authenticateUser, isBusiness, updateSalon); // Update salon by ID
router.delete("/delete/:id", authenticateUser, isBusiness, deleteSalon); // Delete salon by ID
router.get("/", getAllSalons); // Get all salons
router.get("/:id", getSalonById); // Get salon by ID

module.exports = router;
