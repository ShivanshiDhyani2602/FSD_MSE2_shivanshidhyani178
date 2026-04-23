const express = require("express");
const {
  register,
  login,
  addGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievance,
  deleteGrievance,
  searchGrievance
} = require("../controllers/mainController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// AUTH
router.post("/register", register);
router.post("/login", login);

// GRIEVANCES
router.post("/grievances", protect, addGrievance);
router.get("/grievances", protect, getGrievances);
router.get("/grievances/:id", protect, getGrievanceById);
router.put("/grievances/:id", protect, updateGrievance);
router.delete("/grievances/:id", protect, deleteGrievance);
router.get("/search", protect, searchGrievance);

module.exports = router;