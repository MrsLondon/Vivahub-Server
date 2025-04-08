const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/user.controller");
const { authenticateUser } = require("../middlewares/authMiddleware");

// Get all users (excluding password)
router.get("/", getAllUsers);

module.exports = router;
