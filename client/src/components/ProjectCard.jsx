import { Link } from "react-router-dom";
import { Heart, Bookmark, ExternalLink, Github } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProjectCard = ({ project, onLike, onBookmark }) => {
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await API.put(`/projects/like/${project._id}`);
      onLike(project._id, res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      const res = await API.put(`/projects/bookmark/${project._id}`);
      onBookmark(project._id, res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isLiked = user && project.likes?.includes(user.id);
  const isBookmarked = user && project.bookmarks?.includes(user.id);

  return (
    <div className="project-card">
      {project.images?.[0] && (
        <div className="card-image">
          <img src={`http://localhost:5000/${project.images[0]}`} alt={project.title} />
        </div>
      )}
      <div className="card-body">
        <div className="card-header">
          <span className="card-category">{project.category}</span>
          <div className="card-actions">
            <button onClick={handleLike} className={`action-btn ${isLiked ? "liked" : ""}`}>
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{project.likes?.length || 0}</span>
            </button>
            <button onClick={handleBookmark} className={`action-btn ${isBookmarked ? "bookmarked" : ""}`}>
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <Link to={`/project/${project._id}`}>
          <h3 className="card-title">{project.title}</h3>
        </Link>
        <p className="card-description">{project.description.substring(0, 100)}...</p>
        <div className="card-tech">
          {project.techStack?.map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>
        <div className="card-footer">
          <span className="card-author">by {project.user?.name}</span>
          <div className="card-links">
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noreferrer" className="card-link">
                <Github size={16} />
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noreferrer" className="card-link">
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
