const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:  { type: String },           // not required — admin has no name
  email: { type: String, required: true, unique: true },

  rollNo: { type: String },          // not required — admin has no rollNo
  regNo:  { type: String },          // not required — admin has no regNo

  branch: {
    type: String,
    enum: ["MCA", "CSE", "ECE", "EEE", "ME", "CE"],
  },

  batchFrom: { type: Number },
  batchTo:   { type: Number },

  password: { type: String, required: true },

  isAdmin: { type: Boolean, default: false },  // NEW

  profile: {
    linkedin:  String,
    github:    String,
    instagram: String,
    whatsapp:  String,
    skills:    [String],
    jobRole:   String,
    company:   String,
    about:     String
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);