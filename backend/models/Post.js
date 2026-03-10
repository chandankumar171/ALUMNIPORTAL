const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  comments: [{
    _id: mongoose.Schema.Types.ObjectId,
    text: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);