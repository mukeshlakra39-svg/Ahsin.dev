import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Heart, ThumbsDown, Bookmark, MessageCircle, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const MediaFeed = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    API.get("/media/feed")
      .then((res) => setMedia(res.data.media))
      .catch(() => toast.error("Failed to load feed"))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id) => {
    if (!user) return;
    try {
      const res = await API.put(`/media/like/${id}`);
      setMedia((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, likes: res.data.likes, dislikes: res.data.dislikes } : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (id) => {
    if (!user) return;
    try {
      const res = await API.put(`/media/dislike/${id}`);
      setMedia((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, likes: res.data.likes, dislikes: res.data.dislikes } : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (id) => {
    if (!user) return;
    try {
      const res = await API.put(`/media/save/${id}`);
      setMedia((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, saves: res.data.saves } : m
        )
      );
      toast.success("Saved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (id) => {
    if (!user || !commentText[id]) return;
    try {
      const res = await API.post(`/media/comment/${id}`, { text: commentText[id] });
      setMedia((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, comments: res.data } : m
        )
      );
      setCommentText((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      await API.delete(`/media/${id}`);
      setMedia((prev) => prev.filter((m) => m._id !== id));
      toast.success("Deleted!");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="loading">Loading feed...</div>;

  return (
    <div className="media-feed-page">
      <h2>Feed</h2>
      {media.length === 0 ? (
        <div className="empty">
          <h3>No media yet</h3>
          <p>Be the first to upload!</p>
          <Link to="/upload" className="btn btn-primary">Upload Now</Link>
        </div>
      ) : (
        media.map((item) => {
          const isLiked = item.likes?.includes(user?.id || user?._id);
          const isDisliked = item.dislikes?.includes(user?.id || user?._id);
          const isSaved = item.saves?.includes(user?.id || user?._id);
          const isOwner = (item.user?._id || item.user?.id) === (user?.id || user?._id);

          return (
            <div key={item._id} className="media-card">
              <div className="media-card-header">
                <Link to={`/user/${item.user?._id}`} className="media-author">
                  {item.user?.profileImage ? (
                    <img src={`https://ahsin-dev-backend.onrender.com/${item.user.profileImage}`} alt="" className="media-author-img" />
                  ) : (
                    <div className="media-author-avatar">{item.user?.name?.charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <h4>{item.user?.name}</h4>
                    <p className="user-code">{item.user?.username}</p>
                  </div>
                </Link>
                {isOwner && (
                  <button onClick={() => handleDelete(item._id)} className="action-btn delete">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="media-file">
                {item.fileType === "video" ? (
                  <video src={`https://ahsin-dev-backend.onrender.com/${item.fileUrl}`} controls />
                ) : (
                  <img src={`https://ahsin-dev-backend.onrender.com/${item.fileUrl}`} alt={item.caption} />
                )}
              </div>

              {item.caption && <p className="media-caption">{item.caption}</p>}

              <div className="media-actions">
                <button onClick={() => handleLike(item._id)} className={`action-btn ${isLiked ? "active" : ""}`}>
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} /> {item.likes?.length || 0}
                </button>
                <button onClick={() => handleDislike(item._id)} className={`action-btn ${isDisliked ? "active-dislike" : ""}`}>
                  <ThumbsDown size={20} fill={isDisliked ? "currentColor" : "none"} /> {item.dislikes?.length || 0}
                </button>
                <button onClick={() => handleSave(item._id)} className={`action-btn ${isSaved ? "active-save" : ""}`}>
                  <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button className="action-btn">
                  <MessageCircle size={20} /> {item.comments?.length || 0}
                </button>
              </div>

              <div className="media-comments">
                {item.comments?.slice(-3).map((c) => (
                  <div key={c._id} className="comment-item">
                    <Link to={`/user/${c.user?._id || c.user}`}>
                      <strong>{c.user?.name || "User"}</strong>
                    </Link> {c.text}
                  </div>
                ))}
              </div>

              {user && (
                <form className="comment-form" onSubmit={(e) => { e.preventDefault(); handleComment(item._id); }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[item._id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                  />
                  <button type="submit" className="action-btn"><Send size={18} /></button>
                </form>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MediaFeed;
