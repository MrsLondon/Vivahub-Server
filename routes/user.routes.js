const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateCustomerUser,
  deleteCustomerUser,
} = require("../controllers/user.controller");
const authenticateUser = require("../middlewares/authMiddleware");

// Update customer user
router.put("/update", authenticateUser, updateCustomerUser);

// Delete customer user
router.delete("/delete", authenticateUser, deleteCustomerUser);

// Get all users (excluding password)
router.get("/", getAllUsers);

module.exports = router;
