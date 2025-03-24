const router = require("express").Router();
const Service = require("../models/Service");
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

// POST /api/services - Add a new service (business only)
router.post("/", authenticateUser, isBusiness, async (req, res, next) => {
  const { name, description, price, duration, languageSpoken } = req.body;

  try {
    // Search for the salon of the authenticated user
    const salon = await Salon.findOne({ owner: req.user.userId });
    if (!salon) {
      return res.status(404).json({ message: "No salon found for this user." });
    }

    // Garanty that languagesSpoken is an array
    if (!Array.isArray(salon.languageSpoken)) {
      salon.languageSpoken = [];
    }

    // Create a new service for the salon
    const newService = await Service.create({
      name,
      description,
      price,
      duration,
      languageSpoken,
      salon: salon._id, // Associate the service with the salon
    });

    // Add the service to the salon's services array and update languagesSpoken
    salon.services.push(newService._id);
    const allLanguages = new Set([
      ...(salon.languageSpoken || []), // Guarantee that languagesSpoken is an array
      ...languageSpoken,
    ]);
    salon.languageSpoken = Array.from(allLanguages); // Remove duplicates

    // Save the updated salon (only once)
    await salon.save();

    // Send the response
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error.message);
    next(error);
  }
});

// GET /api/services/languages - Get all supported languages
const languages = require("../utils/languages");

router.get("/languages", (req, res) => {
  res.status(200).json(languages);
});

// GET /api/services - Get all services
router.get("/", async (req, res, next) => {
  try {
    const services = await Service.find().populate("salon");
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:id - Get service by ID
router.get("/:id", async (req, res, next) => {
  try {
    // Validate if the ID is a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid service ID format" });
    }

    const service = await Service.findById(req.params.id).populate("salon");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// PUT /api/service/:id - Update service (business only)
router.put("/:id", authenticateUser, isBusiness, async (req, res, next) => {
  const { name, description, price, duration, languageSpoken } = req.body;

  try {
    // Verify if the service exists and belongs to the authenticated user
    const service = await Service.findById(req.params.id).populate("salon");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify if the service is associated with a salon
    if (!service.salon) {
      return res
        .status(400)
        .json({ message: "Service is not associated with any salon." });
    }

    // Verify if the salon belongs to the authenticated user
    if (service.salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, languageSpoken },
      { new: true, runValidators: true } // runValidators guarantees that the new data will be validated
    );

    res.json(updatedService);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id - Delete service (business only)
router.delete("/:id", authenticateUser, isBusiness, async (req, res, next) => {
  try {
    // Verify if the service exists
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify if the salon associated with the service exists
    const salon = await Salon.findById(service.salon);
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Verify if the salon belongs to the authenticated user
    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Remove the service from the database
    await Service.findByIdAndDelete(req.params.id);

    // Remove the service from the salon's services
    await Salon.findByIdAndUpdate(service.salon, {
      $pull: { services: service._id },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
