import { useState, useEffect } from "react";
import API from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Search } from "lucide-react";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await API.get("/projects", { params });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleLike = (projectId, updatedLikes) => {
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId ? { ...p, likes: updatedLikes } : p
      )
    );
  };

  const handleBookmark = (projectId, updatedBookmarks) => {
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId ? { ...p, bookmarks: updatedBookmarks } : p
      )
    );
  };

  const categories = [
    { value: "", label: "All" },
    { value: "web", label: "Web" },
    { value: "mobile", label: "Mobile" },
    { value: "api", label: "API" },
    { value: "cli", label: "CLI" },
    { value: "ml", label: "ML" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="home-page">
      <div className="hero">
        <h1><span className="logo-accent">A</span>hsin.dev</h1>
        <p>Showcase your projects. Solve problems. Get inspired.</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn ${category === cat.value ? "active" : ""}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="projects-grid">
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty">
            <h3>No projects found</h3>
            <p>Be the first to add a project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
