const mongoose = require("mongoose");

const mainSchema = new mongoose.Schema({
  // USER FIELDS
  name: String,
  email: { type: String, unique: true },
  password: String,

  // GRIEVANCE FIELDS
  grievances: [
    {
      title: String,
      description: String,
      category: {
        type: String,
        enum: ["Academic", "Hostel", "Transport", "Other"]
      },
      date: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["Pending", "Resolved"],
        default: "Pending"
      }
    }
  ]
});

module.exports = mongoose.model("Main", mainSchema);