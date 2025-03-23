require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const exphbs = require("express-handlebars");
const authRoutes = require("./routes/auth");
const salonRoutes = require("./routes/salon");
const serviceRoutes = require("./routes/service");
const bookingRoutes = require("./routes/booking");
const reviewRoutes = require("./routes/review");
const viewDataRoutes = require("./routes/viewData");

const app = express();

// Handlebars setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Log MONGO_URI to verify it's being loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/data", viewDataRoutes);

// Root route - Data Viewer
app.get("/", async (req, res) => {
  try {
    const [salons, services, bookings, users, reviews] = await Promise.all([
      require("./models/Salon").find(),
      require("./models/Service").find(),
      require("./models/Booking").find(),
      require("./models/User").find(),
      require("./models/Review").find()
    ]);

    const endpoints = [
      { name: 'Salons', path: '/api/salons', description: 'View all salons and their services', count: salons.length },
      { name: 'Services', path: '/api/services', description: 'View all available services', count: services.length },
      { name: 'Bookings', path: '/api/bookings', description: 'View all bookings with related data', count: bookings.length },
      { name: 'Users', path: '/api/users', description: 'View all users (passwords excluded)', count: users.length },
      { name: 'Reviews', path: '/api/reviews', description: 'View all reviews with user and salon details', count: reviews.length }
    ];

    res.render('index', { endpoints });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Basic route
app.get("/api", (req, res) => {
  res.json({ message: "VivaHub Backend is Running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
