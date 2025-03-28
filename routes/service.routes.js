const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware");
const {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getSupportedLanguages,
  getServicesByUser,
} = require("../controllers/service.controller");

// Middleware to check if the user is a business owner
const isBusiness = (req, res, next) => {
  if (req.user.role !== "business") {
    return res.status(403).json({
      message: "Access denied. Only business users can perform this action.",
    });
  }
  next();
};

// Service routes
router.post("/", authenticateUser, isBusiness, addService);
router.get("/", getAllServices);
router.get("/languages", getSupportedLanguages);
router.get("/user", authenticateUser, isBusiness, getServicesByUser);
router.get("/:id", getServiceById);
router.put("/:id", authenticateUser, isBusiness, updateService);
router.delete("/:id", authenticateUser, isBusiness, deleteService);

module.exports = router;
