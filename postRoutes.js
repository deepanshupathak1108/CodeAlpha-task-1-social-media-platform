// backend/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// Create Post
router.post("/", auth, async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      content: req.body.content,
    });
    const saved = await newPost.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ message: "Server error while creating post" });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Like / Unlike Post
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(req.user.id);
    if (liked) {
      post.likes = post.likes.filter((uid) => uid.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    console.error("Like error:", err.message);
    res.status(500).json({ message: "Error liking post" });
  }
});

module.exports = router;
