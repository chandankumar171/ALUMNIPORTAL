const Post = require("../models/Post");
const mongoose = require("mongoose");

// ── Helper: fetch fully populated post ───────────────────────────────────────
const getPopulatedPost = (postId) =>
  Post.findById(postId)
    .populate("postedBy", "_id name branch batchFrom profile")
    .populate("likes", "_id name")
    .populate("comments.user", "_id name profile");

// ── Create post ───────────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      postedBy: req.user._id,       // FIX: was req.user (full object)
      likes: [],
      comments: []
    });

    const populatedPost = await getPopulatedPost(post._id);
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
};

// ── Get all posts ─────────────────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "_id name branch batchFrom profile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name profile")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

// ── Like a post ───────────────────────────────────────────────────────────────
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;      // FIX: was req.user

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // FIX: use .some() with .toString() instead of .includes() for ObjectId comparison
    if (post.likes.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "Already liked" });
    }

    post.likes.push(userId);
    await post.save();

    // FIX: use getPopulatedPost() — chained .populate() after save() is unreliable
    const updatedPost = await getPopulatedPost(postId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error liking post" });
  }
};

// ── Unlike a post ─────────────────────────────────────────────────────────────
exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;      // FIX: was req.user

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // FIX: .toString() comparison for ObjectId
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    await post.save();

    const updatedPost = await getPopulatedPost(postId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error unliking post" });
  }
};

// ── Add comment ───────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;      // FIX: was req.user

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      _id: new mongoose.Types.ObjectId(),
      text,
      user: userId,
      createdAt: new Date()
    });
    await post.save();

    const updatedPost = await getPopulatedPost(postId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

// ── Delete comment ────────────────────────────────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;      // FIX: was req.user

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // FIX: .toString() comparison for ObjectId
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    const updatedPost = await getPopulatedPost(postId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// ── Delete post ───────────────────────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;      // FIX: was req.user

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // FIX: .toString() comparison for ObjectId
    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
};