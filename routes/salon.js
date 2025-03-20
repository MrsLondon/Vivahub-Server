const router = require("express").Router();
const Salon = require("../models/Salon");
const authenticateUser = require("../middlewares/authMiddleware"); // Middleware de autenticação

// Middleware to check if the user is a business owner
const isBusiness = (req, res, next) => {
  if (req.user.role !== "business") {
    return res.status(403).json({
      message: "Access denied. Only business users can perform this action.",
    });
  }
  next();
};

// POST /api/salons - Add a new salon (business only)
router.post("/", authenticateUser, isBusiness, async (req, res, next) => {
  const { name, location } = req.body;

  try {
    // Create a new salon to the authenticated user
    const newSalon = await Salon.create({
      name,
      location,
      owner: req.user.userId, // associate the salon with the authenticated user
    });

    res.status(201).json(newSalon);
  } catch (error) {
    console.log("Error creating salon:", error.message);
    next(error);
  }
});

module.exports = router;
