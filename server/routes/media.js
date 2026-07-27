const express = require("express");
const Media = require("../models/Media");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileType = imageExts.includes(ext) ? "image" : "video";

    const media = new Media({
      user: req.user.id,
      fileUrl: `uploads/${req.file.filename}`,
      fileType,
      caption: req.body.caption || "",
    });

    await media.save();
    await media.populate("user", "name username profileImage");

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/feed", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const media = await Media.find()
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments();

    res.json({ media, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", auth, async (req, res) => {
  try {
    const media = await Media.find({ user: req.params.userId })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/saved", auth, async (req, res) => {
  try {
    const media = await Media.find({ saves: req.user.id })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }
    if (media.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: "Media deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/like/:id", auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const likeIndex = media.likes.indexOf(req.user.id);
    const dislikeIndex = media.dislikes.indexOf(req.user.id);

    if (dislikeIndex !== -1) {
      media.dislikes.splice(dislikeIndex, 1);
    }

    if (likeIndex === -1) {
      media.likes.push(req.user.id);
    } else {
      media.likes.splice(likeIndex, 1);
    }

    await media.save();
    res.json({ likes: media.likes, dislikes: media.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/dislike/:id", auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const dislikeIndex = media.dislikes.indexOf(req.user.id);
    const likeIndex = media.likes.indexOf(req.user.id);

    if (likeIndex !== -1) {
      media.likes.splice(likeIndex, 1);
    }

    if (dislikeIndex === -1) {
      media.dislikes.push(req.user.id);
    } else {
      media.dislikes.splice(dislikeIndex, 1);
    }

    await media.save();
    res.json({ likes: media.likes, dislikes: media.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/save/:id", auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const saveIndex = media.saves.indexOf(req.user.id);

    if (saveIndex === -1) {
      media.saves.push(req.user.id);
    } else {
      media.saves.splice(saveIndex, 1);
    }

    await media.save();
    res.json({ saves: media.saves });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/comment/:id", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    media.comments.push({ user: req.user.id, text });
    await media.save();
    await media.populate("comments.user", "name username profileImage");

    res.json(media.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/comment/:id/:commentId", auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const comment = media.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    media.comments.pull(req.params.commentId);
    await media.save();

    res.json(media.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
