const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Signup
exports.signup = async (req, res) => {
  try {
    const {
      name, email, rollNo, regNo,
      branch, batchFrom, batchTo, password,
      adminKey  // optional — only sent from admin signup form
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ── ADMIN SIGNUP ────────────────────────────────────────────
    if (adminKey) {
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: "Invalid admin key" });
      }

      const admin = await User.create({
        name: "Admin",
        email,
        password: hashedPassword,
        isAdmin: true,
        // placeholder values so existing validators don't break
        rollNo: "ADMIN",
        regNo: "ADMIN",
        branch: "CSE",
        batchFrom: 0,
        batchTo: 0,
        profile: {
          linkedin: "", github: "", instagram: "", whatsapp: "",
          skills: [], jobRole: "", company: "", about: ""
        }
      });

      return res.status(201).json({
        token: generateToken(admin._id),
        user: admin
      });
    }

    // ── REGULAR ALUMNI SIGNUP ───────────────────────────────────
    const user = await User.create({
      name,
      email,
      rollNo,
      regNo,
      branch,
      batchFrom,
      batchTo,
      password: hashedPassword,
      isAdmin: false,
      profile: {
        linkedin: "",
        github: "",
        instagram: "",
        whatsapp: "",
        skills: [],
        jobRole: "",
        company: "",
        about: ""
      }
    });

    res.status(201).json({
      token: generateToken(user._id),
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};