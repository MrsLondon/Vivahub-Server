const Service = require("../models/Service");
const Salon = require("../models/Salon");
const languages = require("../utils/languages");

// Add a new service
exports.addService = async (req, res, next) => {
  const { name, description, price, duration, languageSpoken } = req.body;

  try {
    // Search for the salon of the authenticated user
    const salon = await Salon.findOne({ owner: req.user.userId });
    if (!salon) {
      return res.status(404).json({ message: "No salon found for this user." });
    }

    // Guarantee that languagesSpoken is an array
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
      ...(salon.languageSpoken || []),
      ...languageSpoken,
    ]);
    salon.languageSpoken = Array.from(allLanguages); // Remove duplicates

    // Save the updated salon
    await salon.save();

    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error.message);
    next(error);
  }
};

// Get all supported languages
exports.getSupportedLanguages = (req, res) => {
  try {
    res.status(200).json(languages);
  } catch (error) {
    console.error("Error fetching supported languages:", error.message);
    res.status(500).json({ message: "Error fetching supported languages" });
  }
};

// Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate("salon");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error.message);
    next(error);
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate("salon");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service by ID:", error.message);
    next(error);
  }
};

// Update a service
exports.updateService = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, duration, languageSpoken } = req.body;

  try {
    const service = await Service.findById(id).populate("salon");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.salon) {
      return res
        .status(400)
        .json({ message: "Service is not associated with any salon." });
    }

    if (service.salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, price, duration, languageSpoken },
      { new: true, runValidators: true }
    );

    res.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error.message);
    next(error);
  }
};

// Delete a service
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const salon = await Salon.findById(service.salon);
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Remove the service from the database
    await Service.findByIdAndDelete(id);

    // Remove the service from the salon's services array
    await Salon.findByIdAndUpdate(service.salon, {
      $pull: { services: service._id },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error.message);
    next(error);
  }
};
