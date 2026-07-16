import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Save, Github, Linkedin, Globe } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        website: user.website || "",
      });
      API.get(`/projects/user/${user.id}`).then((res) => setMyProjects(res.data));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>

      <div className="form-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><Github size={16} /> GitHub</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label><Linkedin size={16} /> LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/..."
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label><Globe size={16} /> Website</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="my-projects">
        <h3>My Projects ({myProjects.length})</h3>
        {myProjects.length === 0 ? (
          <p className="empty">No projects yet. Add your first project!</p>
        ) : (
          <div className="projects-list">
            {myProjects.map((p) => (
              <div key={p._id} className="my-project-item">
                <h4>{p.title}</h4>
                <span className="card-category">{p.category}</span>
                <span>{p.likes?.length || 0} likes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
