const User = require("../models/User");
const Salon = require("../models/Salon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
exports.register = async (req, res) => {
  console.log("Register endpoint hit...");
  console.log("Request body:", req.body);
  try {
    const { email, password, firstName, lastName, role, businessDetails } = req.body;

    // Check if the email is already registered
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        businessDetails: newUser.businessDetails,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "An error occurred during registration" });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Verify if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.email, user.role);

    // Verify the password
    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        businessDetails: user.businessDetails,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "An error occurred during login" });
  }
};