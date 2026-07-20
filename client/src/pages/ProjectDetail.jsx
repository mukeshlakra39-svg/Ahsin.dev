import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Heart, Bookmark, ExternalLink, Code2, ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => toast.error("Project not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return;
    const res = await API.put(`/projects/like/${id}`);
    setProject((prev) => ({ ...prev, likes: res.data }));
  };

  const handleBookmark = async () => {
    if (!user) return;
    const res = await API.put(`/projects/bookmark/${id}`);
    setProject((prev) => ({ ...prev, bookmarks: res.data }));
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success("Project deleted!");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="empty">Project not found</div>;

  const isLiked = user && project.likes?.includes(user.id);
  const isBookmarked = user && project.bookmarks?.includes(user.id);
  const isOwner = user && project.user?._id === user.id;

  return (
    <div className="detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <span className="card-category">{project.category}</span>
            <h1>{project.title}</h1>
            <p className="detail-author">by {project.user?.name}</p>
          </div>
          <div className="detail-actions">
            <button onClick={handleLike} className={`action-btn ${isLiked ? "liked" : ""}`}>
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span>{project.likes?.length || 0}</span>
            </button>
            <button onClick={handleBookmark} className={`action-btn ${isBookmarked ? "bookmarked" : ""}`}>
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            {isOwner && (
              <button onClick={handleDelete} className="action-btn delete">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {project.images?.length > 0 && (
          <div className="detail-images">
            {project.images.map((img, i) => (
              <img key={i} src={`http://localhost:5000/${img}`} alt={`Project ${i + 1}`} />
            ))}
          </div>
        )}

        <div className="detail-section">
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="detail-section">
          <h3>Problem Solved</h3>
          <p>{project.problemSolved}</p>
        </div>

        <div className="detail-section">
          <h3>Tech Stack</h3>
          <div className="card-tech">
            {project.techStack?.map((tech, i) => (
              <span key={i} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        <div className="detail-links">
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-outline">
              <Code2 size={18} /> GitHub
            </a>
          )}
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn btn-primary">
              <ExternalLink size={18} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
