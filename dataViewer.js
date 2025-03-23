require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const exphbs = require("express-handlebars");

// Import your MongoDB models
const Salon = require("./models/Salon");
const Booking = require("./models/Booking");
const User = require("./models/User");
const Review = require("./models/Review");
const Service = require("./models/Service");

const app = express();
const PORT = process.env.PORT || 5001;

// Handlebars setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Home route
app.get("/", async (req, res) => {
  try {
    const [salons, services, bookings, users, reviews] = await Promise.all([
      Salon.find(),
      Service.find(),
      Booking.find(),
      User.find(),
      Review.find()
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
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.get("/api/salons", async (req, res) => {
  try {
    const salons = await Salon.find().populate('services');
    res.json(salons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services/salon/:salonId", async (req, res) => {
  try {
    const services = await Service.find({ salon: req.params.salonId });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('salon')
      .populate('service')
      .populate('user', '-password');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', '-password')
      .populate('salon');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Data Viewer is running at port ${PORT}`);
});
