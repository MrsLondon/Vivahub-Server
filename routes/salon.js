const router = require("express").Router();
const Salon = require("../models/Salon");
const authenticateUser = require("../middlewares/authMiddleware");

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
  const { name, longitude, latitude } = req.body;

  try {
    // Validate required fields
    if (!name || !longitude || !latitude) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Create a new salon with geolocation
    const newSalon = await Salon.create({
      name,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format
      },
      owner: req.user.userId,
    });

    res.status(201).json(newSalon);
  } catch (error) {
    console.log("Error creating salon:", error.message);
    next(error);
  }
});

module.exports = router;
