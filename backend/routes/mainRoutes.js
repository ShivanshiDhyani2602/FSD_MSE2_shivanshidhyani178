const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  register, login,
  addGrievance, getGrievances, getGrievanceById,
  updateGrievance, deleteGrievance, searchGrievance
} = require("../controllers/mainController");

// Auth
router.post("/register", register);
router.post("/login", login);

// ✅ Search MUST be before /:id — otherwise Express reads "search" as an id
router.get("/grievances/search", protect, searchGrievance);

// Grievances
router.post("/grievances", protect, addGrievance);
router.get("/grievances", protect, getGrievances);
router.get("/grievances/:id", protect, getGrievanceById);
router.put("/grievances/:id", protect, updateGrievance);
router.delete("/grievances/:id", protect, deleteGrievance);

module.exports = router;