const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware");
const {
  addSalon,
  getAllSalons,
  getSalonById,
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
router.post("/", authenticateUser, isBusiness, addSalon);
router.get("/", getAllSalons);
router.get("/:id", getSalonById);
router.put("/:id", authenticateUser, isBusiness, updateSalon);
router.delete("/:id", authenticateUser, isBusiness, deleteSalon);

module.exports = router;
