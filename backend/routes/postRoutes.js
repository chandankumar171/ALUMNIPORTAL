const express              = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Post                 = require("../models/Post");
const {
  createPost,
  getPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  deletePost
} = require("../controllers/postController");

const router = express.Router();

// ── Existing routes (unchanged) ───────────────────────────────────────────────
router.post("/",                             protect, createPost);
router.get("/",                              protect, getPosts);
router.post("/:postId/like",                protect, likePost);
router.post("/:postId/unlike",              protect, unlikePost);
router.post("/:postId/comment",             protect, addComment);
router.delete("/:postId/comment/:commentId", protect, deleteComment);
router.delete("/:postId",                   protect, deletePost);

// ── Admin: get ALL posts ───────────────────────────────────────────────────────
// NOTE: must be before /:postId to avoid route conflict
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "name email branch batchFrom")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Admin: force delete any post ──────────────────────────────────────────────
router.delete("/admin/:postId", protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted by admin" });
  } catch (err) {
    console.error("Admin delete post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;