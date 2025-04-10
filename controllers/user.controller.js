const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// Controller to get all users (excluding password)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Controller to update customer user
const updateCustomerUser = async (req, res) => {
  try {
    const userId = req.user.userId; // authenticated user ID
    const { firstName, lastName, email } = req.body;

    // Verify if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify if user = customer
    if (user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customer users can be updated." });
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      message: "Customer user updated successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating customer user:", error.message);
    res.status(500).json({ message: "Failed to update customer user." });
  }
};

//Controller to delete customer user
const deleteCustomerUser = async (req, res) => {
  try {
    const userId = req.user.userId; // authenticated user ID

    // Verify if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify if user = customer
    if (user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customer users can be deleted." });
    }

    // Delete all bookings associated to the user
    await Booking.deleteMany({ customerId: userId });

    // Delete all reviews associated to the user
    await Review.deleteMany({ customerId: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message:
        "Customer user, associated bookings, and reviews deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting customer user:", error.message);
    res.status(500).json({ message: "Failed to delete customer user." });
  }
};

module.exports = {
  getAllUsers,
  updateCustomerUser,
  deleteCustomerUser,
};
