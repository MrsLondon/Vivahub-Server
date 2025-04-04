const User = require("../models/User");
const Salon = require("../models/Salon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  console.log("Register endpoint hit...");
  console.log("Request body:", req.body);
  try {
    const { email, password, firstName, lastName, role, businessDetails } =
      req.body;

    // Verify if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create a new user
    const newUser = new User({
      email,
      password, // The password will be hashed in the User model pre-save hook
      firstName,
      lastName,
      role,
      ...(role === "business" && { businessDetails }),
    });

    await newUser.save();

    console.log("Role:", role, "Business Details:", businessDetails);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // If the user is a business, create a new salon
    if (role === "business" && businessDetails) {
      const defaultOpeningHours = {
        monday: { open: null, close: null },
        tuesday: { open: null, close: null },
        wednesday: { open: null, close: null },
        thursday: { open: null, close: null },
        friday: { open: null, close: null },
        saturday: { open: null, close: null },
        sunday: { open: null, close: null },
      };

      // Merge the provided opening hours with default values.
      // If a day is missing or undefined in the provided opening hours,
      // it will default to { open: null, close: null }.
      const processedOpeningHours = Object.keys(defaultOpeningHours).reduce(
        (acc, day) => {
          acc[day] =
            businessDetails.openingHours?.[day] || defaultOpeningHours[day];
          return acc;
        },
        {}
      );

      const newSalon = new Salon({
        name: businessDetails.businessName,
        location: businessDetails.address,
        owner: newUser._id,
        email: email,
        phone: businessDetails.phone || "",
        openingHours: processedOpeningHours,
        closedDays: [],
      });

      console.log("Creating salon with data:", {
        name: businessDetails.businessName,
        location: businessDetails.address,
        description: businessDetails.description,
        phone: businessDetails.phone,
        owner: newUser._id,
        email: email,
        openingHours: processedOpeningHours,
      });

      try {
        await newSalon.save();
      } catch (error) {
        console.error("Error saving salon:", error.message);
      }
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "An error occurred during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "An error occurred during login" });
  }
};
