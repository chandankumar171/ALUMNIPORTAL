const User = require("../models/User");

// Helper function to ensure profile has all fields
const ensureProfileStructure = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  if (!plainUser.profile) plainUser.profile = {};
  plainUser.profile = {
    linkedin:  plainUser.profile.linkedin  || "",
    github:    plainUser.profile.github    || "",
    instagram: plainUser.profile.instagram || "",
    whatsapp:  plainUser.profile.whatsapp  || "",
    skills:    Array.isArray(plainUser.profile.skills) ? plainUser.profile.skills : [],
    jobRole:   plainUser.profile.jobRole   || "",
    company:   plainUser.profile.company   || "",
    about:     plainUser.profile.about     || ""
  };
  return plainUser;
};

// Get logged-in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(ensureProfileStructure(user));
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Update professional profile (social links, skills, job etc.)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profile = { ...user.profile, ...req.body };
    await user.save();

    res.json(ensureProfileStructure(user));
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ── NEW: Update basic info (name, email, rollNo, regNo, branch, batch) ────────
exports.updateBasicInfo = async (req, res) => {
  try {
    const { name, email, rollNo, regNo, branch, batchFrom, batchTo } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If email is being changed, check it's not taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }

    // Only update fields that were actually sent
    if (name)      user.name      = name.trim();
    if (email)     user.email     = email.trim();
    if (rollNo)    user.rollNo    = rollNo.trim();
    if (regNo !== undefined) user.regNo = regNo.trim();
    if (branch)    user.branch    = branch;
    if (batchFrom) user.batchFrom = Number(batchFrom);
    if (batchTo)   user.batchTo   = Number(batchTo);

    await user.save();

    res.json(ensureProfileStructure(user));
  } catch (error) {
    console.error("updateBasicInfo error:", error);
    res.status(500).json({ message: "Failed to update basic info" });
  }
};

// Get users by branch
exports.getByBranch = async (req, res) => {
  const users = await User.find({ branch: req.params.branch }).select("-password");
  res.json(users.map(u => ensureProfileStructure(u)));
};

// Get users by branch & batch
exports.getByBranchAndBatch = async (req, res) => {
  const { branch, from, to } = req.params;
  const users = await User.find({ branch, batchFrom: from, batchTo: to }).select("-password");
  res.json(users.map(u => ensureProfileStructure(u)));
};

// Get admission years by branch
exports.getAdmissionYearsByBranch = async (req, res) => {
  try {
    const users = await User.find({ branch: req.params.branch }).select("batchFrom");
    const admissionYears = [...new Set(users.map(u => u.batchFrom))].sort((a, b) => b - a);
    res.json(admissionYears);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admission years" });
  }
};

// Get users by branch & admission year
exports.getByBranchAndAdmissionYear = async (req, res) => {
  try {
    const { branch, admissionYear } = req.params;
    const users = await User.find({ branch, batchFrom: parseInt(admissionYear) }).select("-password");
    res.json(users.map(u => ensureProfileStructure(u)));
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get single profile
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(ensureProfileStructure(user));
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};