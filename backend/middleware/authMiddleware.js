const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Attaches full user object to req.user (so req.user.isAdmin works)
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Must be used AFTER protect
const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };