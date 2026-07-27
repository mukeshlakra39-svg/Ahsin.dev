const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/conversations", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name username profileImage")
      .populate("receiver", "name username profileImage");

    const conversations = {};
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
      const key = otherUser._id.toString();
      if (!conversations[key]) {
        conversations[key] = {
          user: otherUser,
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          unread: 0,
        };
      }
      if (msg.receiver._id.toString() === req.user.id && !msg.read) {
        conversations[key].unread++;
      }
    });

    const sorted = Object.values(conversations).sort(
      (a, b) => new Date(b.lastTime) - new Date(a.lastTime)
    );

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/messages/:userId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name username profileImage")
      .populate("receiver", "name username profileImage");

    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
