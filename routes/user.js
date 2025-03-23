const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Get all users (excluding password)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;
