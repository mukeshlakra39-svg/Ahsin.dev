import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Save, Code2, Link2, Globe, Camera, Copy, AtSign, Pencil, Check, X } from "lucide-react";

const Profile = () => {
  const { user, updateProfile, updateProfileImage } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    website: "",
  });
  const [usernameVal, setUsernameVal] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [myMedia, setMyMedia] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        website: user.website || "",
      });
      setUsernameVal(user.username || "");
      API.get(`/projects/user/${user.id || user._id}`).then((res) => setMyProjects(res.data));
      API.get(`/media/user/${user.id || user._id}`).then((res) => setMyMedia(res.data));
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profileImage", file);
    try {
      await updateProfileImage(fd);
      toast.success("Profile image updated!");
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

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

  const handleUsernameChange = async () => {
    if (!usernameVal || usernameVal.length < 3) {
      return toast.error("Username must be at least 3 characters");
    }
    setUsernameLoading(true);
    try {
      await API.put("/auth/username", { username: usernameVal });
      toast.success("Username updated!");
      setEditingUsername(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update username");
      setUsernameVal(user?.username || "");
    } finally {
      setUsernameLoading(false);
    }
  };

  const cancelUsernameEdit = () => {
    setUsernameVal(user?.username || "");
    setEditingUsername(false);
  };

  const copyUsername = () => {
    navigator.clipboard.writeText(user?.username);
    toast.success("Username copied!");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current.click()}>
          {user?.profileImage ? (
            <img src={`https://ahsin-dev-backend.onrender.com/${user.profileImage}`} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          )}
          <div className="avatar-overlay">
            <Camera size={20} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        <h2>{user?.name}</h2>
        <p className="profile-username">@{user?.username}</p>
        <p>{user?.email}</p>

        {!editingUsername ? (
          <div className="username-display">
            <div className="unique-code" onClick={copyUsername}>
              <AtSign size={14} /> {user?.username} <Copy size={12} />
            </div>
            <button className="username-edit-btn" onClick={() => setEditingUsername(true)}>
              <Pencil size={13} />
            </button>
          </div>
        ) : (
          <div className="username-edit-inline">
            <input
              type="text"
              value={usernameVal}
              onChange={(e) => setUsernameVal(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="your_username"
              minLength={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUsernameChange();
                if (e.key === "Escape") cancelUsernameEdit();
              }}
            />
            <button className="username-action-btn save" onClick={handleUsernameChange} disabled={usernameLoading}>
              <Check size={16} />
            </button>
            <button className="username-action-btn cancel" onClick={cancelUsernameEdit}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="follow-stats">
          <span><strong>{user?.followers?.length || 0}</strong> Followers</span>
          <span><strong>{user?.following?.length || 0}</strong> Following</span>
        </div>
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
              <label><Code2 size={16} /> GitHub</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label><Link2 size={16} /> LinkedIn</label>
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

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects ({myProjects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
        >
          Media ({myMedia.length})
        </button>
      </div>

      {activeTab === "projects" && (
        <div className="my-projects">
          {myProjects.length === 0 ? (
            <p className="empty">No projects yet. Add your first project!</p>
          ) : (
            <div className="projects-list">
              {myProjects.map((p) => (
                <div key={p._id} className="my-project-item">
                  <Link to={`/project/${p._id}`}><h4>{p.title}</h4></Link>
                  <span className="card-category">{p.category}</span>
                  <span>{p.likes?.length || 0} likes</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "media" && (
        <div className="my-media-grid">
          {myMedia.length === 0 ? (
            <p className="empty">No media yet. Upload your first photo or video!</p>
          ) : (
            myMedia.map((m) => (
              <div key={m._id} className="media-thumb">
                {m.fileType === "video" ? (
                  <video src={`https://ahsin-dev-backend.onrender.com/${m.fileUrl}`} />
                ) : (
                  <img src={`https://ahsin-dev-backend.onrender.com/${m.fileUrl}`} alt={m.caption} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
