import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Heart, Bookmark, MessageCircle, Code2, Link2, Globe } from "lucide-react";

const UserPublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/users/${id}`),
      API.get(`/media/user/${id}`),
      API.get(`/projects/user/${id}`),
    ])
      .then(([userRes, mediaRes, projRes]) => {
        setProfile(userRes.data);
        setUserMedia(mediaRes.data);
        setUserProjects(projRes.data);
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      const res = await API.put(`/users/follow/${id}`);
      setProfile((prev) => ({
        ...prev,
        followers: res.data.followers,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="empty">User not found</div>;

  const isFollowing = profile.followers?.includes(currentUser?.id || currentUser?._id);
  const isMe = (currentUser?.id || currentUser?._id) === profile._id;

  return (
    <div className="profile-page">
      <div className="profile-header">
        {profile.profileImage ? (
          <img src={`https://ahsin-dev-backend.onrender.com/${profile.profileImage}`} alt={profile.name} className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar">{profile.name?.charAt(0).toUpperCase()}</div>
        )}
        <h2>{profile.name}</h2>
        <p>{profile.username}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div className="profile-social">
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer"><Code2 size={18} /> GitHub</a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer"><Link2 size={18} /> LinkedIn</a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer"><Globe size={18} /> Website</a>
          )}
        </div>

        <div className="follow-stats">
          <span><strong>{profile.followers?.length || 0}</strong> Followers</span>
          <span><strong>{profile.following?.length || 0}</strong> Following</span>
        </div>

        {!isMe && currentUser && (
          <button
            className={`btn ${isFollowing ? "btn-outline" : "btn-primary"}`}
            onClick={handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <h3 className="section-title">Projects ({userProjects.length})</h3>
      <div className="projects-list">
        {userProjects.map((p) => (
          <div key={p._id} className="my-project-item">
            <Link to={`/project/${p._id}`}><h4>{p.title}</h4></Link>
            <span className="card-category">{p.category}</span>
          </div>
        ))}
      </div>

      <h3 className="section-title">Media ({userMedia.length})</h3>
      <div className="my-media-grid">
        {userMedia.map((m) => (
          <div key={m._id} className="media-thumb">
            {m.fileType === "video" ? (
              <video src={`https://ahsin-dev-backend.onrender.com/${m.fileUrl}`} />
            ) : (
              <img src={`https://ahsin-dev-backend.onrender.com/${m.fileUrl}`} alt={m.caption} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPublicProfile;
