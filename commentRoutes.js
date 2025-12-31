const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// ✅ Add a comment
router.post("/:postId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    // Verify user is set from token
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User authentication failed" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
      text,
      user: req.user.id,
      post: post._id
    });

    await comment.save();
    await comment.populate("user", "username");
    res.status(201).json(comment);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ message: "Server error while adding comment", error: err.message });
  }
});

// ✅ Fetch comments
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
});

module.exports = router;
