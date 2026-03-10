const User = require("../models/User");

// Helper function to ensure profile has all fields
const ensureProfileStructure = (user) => {
  // Convert Mongoose document to plain object if needed
  const plainUser = user.toObject ? user.toObject() : { ...user };

  if (!plainUser.profile) {
    plainUser.profile = {};
  }
  plainUser.profile = {
    linkedin: plainUser.profile.linkedin || "",
    github: plainUser.profile.github || "",
    instagram: plainUser.profile.instagram || "",
    whatsapp: plainUser.profile.whatsapp || "",
    skills: Array.isArray(plainUser.profile.skills) ? plainUser.profile.skills : [],
    jobRole: plainUser.profile.jobRole || "",
    company: plainUser.profile.company || "",
    about: plainUser.profile.about || ""
  };
  return plainUser;
};

// Get logged-in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = ensureProfileStructure(user);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ FIXED: Update profile safely
exports.updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // merge old profile + new fields
    user.profile = {
      ...user.profile,
      ...req.body
    };

    await user.save();

    // Return with ensured profile structure
    const userData = ensureProfileStructure(user);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// Get users by branch
exports.getByBranch = async (req, res) => {
  const users = await User.find({ branch: req.params.branch }).select("-password");
  const usersWithProfile = users.map(user => ensureProfileStructure(user));
  res.json(usersWithProfile);
};

// Get users by branch & batch
exports.getByBranchAndBatch = async (req, res) => {
  const { branch, from, to } = req.params;

  const users = await User.find({
    branch,
    batchFrom: from,
    batchTo: to
  }).select("-password");

  const usersWithProfile = users.map(user => ensureProfileStructure(user));
  res.json(usersWithProfile);
};

// Get admission years by branch
exports.getAdmissionYearsByBranch = async (req, res) => {
  try {
    const { branch } = req.params;

    const users = await User.find({ branch }).select("batchFrom");

    // Get unique batchFrom values and sort them
    const admissionYears = [...new Set(users.map(u => u.batchFrom))].sort((a, b) => b - a);

    res.json(admissionYears);
  } catch (error) {
    console.error("Error getting admission years:", error);
    res.status(500).json({ message: "Error fetching admission years" });
  }
};

// Get users by branch & admission year
exports.getByBranchAndAdmissionYear = async (req, res) => {
  try {
    const { branch, admissionYear } = req.params;

    const users = await User.find({
      branch,
      batchFrom: parseInt(admissionYear)
    }).select("-password");

    const usersWithProfile = users.map(user => ensureProfileStructure(user));
    res.json(usersWithProfile);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get single profile
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const userData = ensureProfileStructure(user);
    res.json(userData);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};