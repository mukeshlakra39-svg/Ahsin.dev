const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

// Create project
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, problemSolved, techStack, category, githubLink, liveLink, images } =
      req.body;

    const project = new Project({
      user: req.user.id,
      title,
      description,
      problemSolved,
      techStack,
      category,
      githubLink,
      liveLink,
      images,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const { search, category, techStack } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (techStack) {
      query.techStack = { $in: techStack.split(",") };
    }

    const projects = await Project.find(query)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "user",
      "name avatar bio github linkedin"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update project
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete project
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Like/Unlike project
router.put("/like/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const index = project.likes.indexOf(req.user.id);

    if (index === -1) {
      project.likes.push(req.user.id);
    } else {
      project.likes.splice(index, 1);
    }

    await project.save();
    res.json(project.likes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Bookmark/Unbookmark project
router.put("/bookmark/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const index = project.bookmarks.indexOf(req.user.id);

    if (index === -1) {
      project.bookmarks.push(req.user.id);
    } else {
      project.bookmarks.splice(index, 1);
    }

    await project.save();
    res.json(project.bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's projects
router.get("/user/:userId", async (req, res) => {
  try {
    const projects = await Project.find({ user: req.params.userId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
