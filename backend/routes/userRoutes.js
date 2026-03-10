const express              = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User                 = require("../models/User");
const Post                 = require("../models/Post");
const {
  getMe,
  updateProfile,
  getByBranch,
  getByBranchAndBatch,
  getUserById,
  getAdmissionYearsByBranch,
  getByBranchAndAdmissionYear
} = require("../controllers/userController");

const router = express.Router();

// ── Existing routes (unchanged) ───────────────────────────────────────────────
router.get("/me",                                       protect, getMe);
router.put("/update",                                   protect, updateProfile);
router.get("/branch/:branch/admission-years",          protect, getAdmissionYearsByBranch);
router.get("/branch/:branch/admission/:admissionYear", protect, getByBranchAndAdmissionYear);
router.get("/branch/:branch",                          protect, getByBranch);
router.get("/branch/:branch/batch/:from-:to",          protect, getByBranchAndBatch);

// ── Admin: get all alumni (non-admin users) ───────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Admin: delete a user + all their posts ─────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)          return res.status(404).json({ message: "User not found" });
    if (user.isAdmin)   return res.status(403).json({ message: "Cannot delete another admin" });

    await Post.deleteMany({ postedBy: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User and their posts deleted successfully" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Must be AFTER /  and /:id admin routes to avoid conflicts ─────────────────
router.get("/:id", protect, getUserById);

module.exports = router;