import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemSolved: "",
    techStack: "",
    category: "web",
    githubLink: "",
    liveLink: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const projectData = {
        ...formData,
        techStack: formData.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      };
      await API.post("/projects", projectData);
      toast.success("Project added successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="form-card">
        <h2>Add New Project</h2>
        <p className="form-subtitle">Showcase your problem-solving skills</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              placeholder="e.g., E-commerce Platform"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows={3}
              placeholder="Brief description of your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Problem Solved *</label>
            <textarea
              rows={3}
              placeholder="What problem does this project solve?"
              value={formData.problemSolved}
              onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tech Stack * (comma separated)</label>
            <input
              type="text"
              placeholder="e.g., React, Node.js, MongoDB"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="api">API</option>
              <option value="cli">CLI</option>
              <option value="ml">ML</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GitHub Link</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Live Demo Link</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.liveLink}
                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Adding Project..." : "Add Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
