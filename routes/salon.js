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
  const { name, location, email, openingHours, phone } = req.body; // Add phone

  try {
    // Create a new salon for the authenticated user
    const newSalon = await Salon.create({
      name,
      location,
      email, // Including email
      openingHours, // Icluding openingHours
      phone, // including phone
      owner: req.user.userId, // Associating the salon with the authenticated user
    });

    res.status(201).json(newSalon);
  } catch (error) {
    console.log("Error creating salon:", error.message);
    next(error);
  }
});

// GET /api/salons - Get all salons
router.get("/", async (req, res, next) => {
  try {
    // Fetch all salons from the database and populate the owner field
    const salons = await Salon.find().populate("owner");
    res.json(salons); // return all fields, including email, openingHours and phone
  } catch (error) {
    next(error);
  }
});

// GET /api/salons/:id - Get salon by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search for the salon by ID and populate the owner and services fields
    const salon = await Salon.findById(id)
      .populate("owner", "name email") // Populate the owner field with name and email
      .populate("services"); // Populate the services field

    // Verify if the salon exists
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json(salon); // return all fields, including email, openingHours and phone
  } catch (error) {
    console.log("Error fetching salon by ID:", error.message);
    next(error);
  }
});

// PUT /api/salons/:id - Update salon info (owner only)
router.put("/:id", authenticateUser, isBusiness, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, email, openingHours, phone } = req.body; // Add phone

    // Search for the salon by ID
    const salon = await Salon.findById(id);

    // Verify if the salon exists
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Verify if the authenticated user is the owner of the salon
    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Update the salon info
    if (name) salon.name = name;
    if (location) salon.location = location;
    if (email) salon.email = email; // updating email
    if (openingHours) salon.openingHours = openingHours; // updating openingHours
    if (phone) salon.phone = phone; // updating phone

    // Save the updated salon
    const updatedSalon = await salon.save();

    res.status(200).json(updatedSalon);
  } catch (error) {
    console.log("Error updating salon:", error.message);
    next(error);
  }
});

// DELETE /api/salons/:id - Delete a salon (owner only)
router.delete("/:id", authenticateUser, isBusiness, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search for the salon by ID
    const salon = await Salon.findById(id);

    // Verify if the salon exists
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Verify if the authenticated user is the owner of the salon
    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Exclude the salon
    await Salon.findByIdAndDelete(id);

    res.status(200).json({ message: "Salon deleted successfully" });
  } catch (error) {
    console.log("Error deleting salon:", error.message);
    next(error);
  }
});

module.exports = router;
