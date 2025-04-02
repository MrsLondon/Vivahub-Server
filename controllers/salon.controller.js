const Salon = require("../models/Salon");

// Add a new salon (business only)
exports.addSalon = async (req, res, next) => {
  console.log("Request body:", req.body);
  const { name, location, email, openingHours, phone, closedDays } = req.body;

  try {
    // Validate openingHours
    if (openingHours) {
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      for (const day of daysOfWeek) {
        if (openingHours[day]) {
          const { open, close } = openingHours[day];
          if (
            (open && !/^\d{2}:\d{2}$/.test(open)) || // Verify HH:mm format
            (close && !/^\d{2}:\d{2}$/.test(close))
          ) {
            return res.status(400).json({
              message: `Invalid time format for ${day}. Use HH:mm.`,
            });
          }
        }
      }
    }

    // Validate closedDays
    // closedDays is an array of strings in "YYYY-MM-DD" format
    if (closedDays) {
      for (const date of closedDays) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return res.status(400).json({
            message: `Invalid date format in closedDays. Use YYYY-MM-DD.`,
          });
        }
      }
    }

    const newSalon = await Salon.create({
      name,
      location,
      email,
      openingHours,
      closedDays,
      phone,
      owner: req.user.userId,
    });

    res.status(201).json(newSalon);
  } catch (error) {
    console.error("Error creating salon:", error.message);
    next(error);
  }
};

// Get all salons
exports.getAllSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find().populate("owner");
    res.json(salons);
  } catch (error) {
    console.error("Error fetching salons:", error.message);
    next(error);
  }
};

// Get salon by ID
exports.getSalonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salon = await Salon.findById(id)
      .populate("owner", "name email")
      .populate("services");

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json(salon);
  } catch (error) {
    console.error("Error fetching salon by ID:", error.message);
    next(error);
  }
};

// Get salon by user (owner)
exports.getSalonByUser = async (req, res, next) => {
  try {
    // Search the salon by the authenticated user
    const salon = await Salon.findOne({ owner: req.user.userId });

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json(salon);
  } catch (error) {
    console.error("Error fetching salon by user:", error.message);
    next(error);
  }
};

// Update salon info (owner only)
exports.updateSalon = async (req, res, next) => {
  const { id } = req.params;
  const { name, location, email, openingHours, phone, closedDays } = req.body;

  try {
    const salon = await Salon.findById(id);

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Validate openingHours
    if (openingHours) {
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      for (const day of daysOfWeek) {
        if (openingHours[day]) {
          const { open, close } = openingHours[day];
          if (
            (open && !/^\d{2}:\d{2}$/.test(open)) || // Verify HH:mm format
            (close && !/^\d{2}:\d{2}$/.test(close))
          ) {
            return res.status(400).json({
              message: `Invalid time format for ${day}: ${
                open || close
              }. Use HH:mm.`,
            });
          }
        }
      }
    }

    // Validate closedDays
    if (closedDays) {
      for (const date of closedDays) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return res.status(400).json({
            message: `Invalid date format in closedDays: ${date}. Use YYYY-MM-DD.`,
          });
        }
      }
    }

    if (name) salon.name = name;
    if (location) salon.location = location;
    if (email) salon.email = email;
    if (openingHours) salon.openingHours = openingHours;
    if (phone) salon.phone = phone;

    const updatedSalon = await salon.save();

    res.status(200).json(updatedSalon);
  } catch (error) {
    console.error("Error updating salon:", error.message);
    next(error);
  }
};

// Delete a salon and the services associated with it (owner only)
exports.deleteSalon = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Verify if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid salon ID" });
    }

    const salon = await Salon.findById(id);

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    if (salon.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You are not the owner of this salon.",
      });
    }

    // Delete all services associated with the salon
    await Service.deleteMany({ salonId: id });

    // Delete the salon
    await Salon.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Salon and its services deleted successfully" });
  } catch (error) {
    console.error("Error deleting salon:", error.message);
    next(error);
  }
};
