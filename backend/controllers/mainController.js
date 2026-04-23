const Main = require("../models/mainModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ================= AUTH =================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Main.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await Main.create({ name, email, password: hashed });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Main.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GRIEVANCES =================

exports.addGrievance = async (req, res) => {
  try {
    const user = await Main.findById(req.user);
    user.grievances.push(req.body);
    await user.save();
    res.status(201).json(user.grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGrievances = async (req, res) => {
  try {
    const user = await Main.findById(req.user);
    res.json(user.grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGrievanceById = async (req, res) => {
  try {
    const user = await Main.findById(req.user);
    const grievance = user.grievances.id(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });
    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Fixed update — sets all fields properly
exports.updateGrievance = async (req, res) => {
  try {
    const user = await Main.findById(req.user);
    const grievance = user.grievances.id(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });

    if (req.body.title) grievance.title = req.body.title;
    if (req.body.description) grievance.description = req.body.description;
    if (req.body.category) grievance.category = req.body.category;
    if (req.body.status) grievance.status = req.body.status;

    await user.save();
    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Fixed delete — Mongoose 7+ uses deleteOne()
exports.deleteGrievance = async (req, res) => {
  try {
    const user = await Main.findById(req.user);
    const grievance = user.grievances.id(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });

    grievance.deleteOne();
    await user.save();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Search by title
exports.searchGrievance = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) return res.status(400).json({ message: "Title query is required" });

    const user = await Main.findById(req.user);
    const result = user.grievances.filter((g) =>
      g.title.toLowerCase().includes(title.toLowerCase())
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};