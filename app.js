require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const exphbs = require("express-handlebars");
const cron = require("node-cron"); // Import cron for scheduling tasks
const { updateCompletedBookings } = require("./controllers/booking.controller"); // Import the function to update completed bookings

// Import routes
const authRoutes = require("./routes/auth.routes");
const salonRoutes = require("./routes/salon.routes");
const serviceRoutes = require("./routes/service.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");

const canceledBookingRoutes = require("./routes/canceledBooking.routes");

const searchRoutes = require("./routes/search.routes");

const app = express();

// Handlebars setup
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Log MONGO_URI to verify it's being loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

// MongoDB connection with retries
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });
      console.log("Connected to MongoDB");
      return true;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${retries + 1} failed:`,
        err.message
      );
      retries++;
      if (retries === maxRetries) {
        console.error("Max retries reached. Could not connect to MongoDB");
        return false;
      }
      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

app.use("/api/canceledBookings", canceledBookingRoutes);

app.use("/api/search", searchRoutes);

// Root route - Data Viewer
app.get("/", async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connection is not ready");
    }

    // Import models only where needed
    const Salon = require("./models/Salon");
    const Service = require("./models/Service");
    const Booking = require("./models/Booking");
    const User = require("./models/User");
    const Review = require("./models/Review");

    const [salons, services, bookings, users, reviews] = await Promise.all([
      Salon.find().exec(),
      Service.find().exec(),
      Booking.find().exec(),
      User.find().exec(),
      Review.find().exec(),
    ]);

    const endpoints = [
      {
        name: "Search",
        path: "/api/search",
        description: "Advanced search with filters for services",
        example: "/api/search?query=haircut&minPrice=20&maxPrice=100&language=english"
      },
      {
        name: "Salons",
        path: "/api/salons",
        description: "View all salons and their services",
        count: salons.length,
      },
      {
        name: "Services",
        path: "/api/services",
        description: "View all available services",
        count: services.length,
      },
      {
        name: "Bookings",
        path: "/api/bookings",
        description: "View all bookings with related data",
        count: bookings.length,
      },
      {
        name: "Users",
        path: "/api/users",
        description: "View all users (passwords excluded)",
        count: users.length,
      },
      {
        name: "Reviews",
        path: "/api/reviews",
        description: "View all reviews with user and salon details",
        count: reviews.length,
      },
    ];

    res.render("index", { endpoints });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      mongoState: mongoose.connection.readyState,
    });
  }
});

// API info route
app.get("/api", (req, res) => {
  res.json({ message: "VivaHub Backend is Running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!", message: err.message });
});

const PORT = process.env.PORT || 5001;  // Changed default port to 5001

// Start server only after MongoDB connects
const startServer = async () => {
  const connected = await connectWithRetry();
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

      // Configure node-cron to run every minute
      cron.schedule("* * * * *", () => {
        console.log("Running scheduled task to update completed bookings...");
        updateCompletedBookings();
      });
    });
  } else {
    console.error("Could not start server due to MongoDB connection failure");
    process.exit(1);
  }
};

startServer();
