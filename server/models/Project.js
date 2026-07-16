const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    problemSolved: {
      type: String,
      required: true,
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ["web", "mobile", "api", "cli", "ml", "other"],
      default: "web",
    },
    githubLink: {
      type: String,
      default: "",
    },
    liveLink: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text", techStack: "text" });

module.exports = mongoose.model("Project", projectSchema);
