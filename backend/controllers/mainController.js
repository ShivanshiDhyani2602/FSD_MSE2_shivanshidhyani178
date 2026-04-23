const Main = require("../models/MainModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await Main.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await Main.create({ name, email, password: hashed });

  res.json({ token: generateToken(user._id) });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Main.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// ADD GRIEVANCE
exports.addGrievance = async (req, res) => {
  const user = await Main.findById(req.user);

  user.grievances.push(req.body);
  await user.save();

  res.json(user.grievances);
};

// GET ALL GRIEVANCES
exports.getGrievances = async (req, res) => {
  const user = await Main.findById(req.user);
  res.json(user.grievances);
};

// GET BY ID
exports.getGrievanceById = async (req, res) => {
  const user = await Main.findById(req.user);

  const grievance = user.grievances.id(req.params.id);
  res.json(grievance);
};

// UPDATE
exports.updateGrievance = async (req, res) => {
  const user = await Main.findById(req.user);

  const g = user.grievances.id(req.params.id);
  Object.assign(g, req.body);

  await user.save();
  res.json(g);
};

// DELETE
exports.deleteGrievance = async (req, res) => {
  const user = await Main.findById(req.user);

  user.grievances.id(req.params.id).remove();
  await user.save();

  res.json({ message: "Deleted" });
};

// SEARCH
exports.searchGrievance = async (req, res) => {
  const { title } = req.query;
  const user = await Main.findById(req.user);

  const result = user.grievances.filter(g =>
    g.title.toLowerCase().includes(title.toLowerCase())
  );

  res.json(result);
};