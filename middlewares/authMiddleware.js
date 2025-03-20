const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Export token from the Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded; // Add information to the request object
    console.log("Decoded token:", req.user); // verify the decoded token
    next(); // Go to the next middleware
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authenticateUser;
