import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Search, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const UserSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/users/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await API.put(`/users/follow/${userId}`);
      setResults((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, followers: res.data.followers }
            : u
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="search-page">
      <h2><Users size={24} /> Find Users</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search people by name or code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading && <div className="loading">Searching...</div>}

      <div className="user-results">
        {results.map((u) => {
          const isFollowing = u.followers?.includes(user?.id || user?._id);
          return (
            <div key={u._id} className="user-result-card">
              <Link to={`/user/${u._id}`} className="user-result-info">
                {u.profileImage ? (
                  <img src={`https://ahsin-dev-backend.onrender.com/${u.profileImage}`} alt={u.name} className="user-result-avatar" />
                ) : (
                  <div className="user-result-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <h4>{u.name}</h4>
                  <p className="user-code">{u.uniqueCode}</p>
                  {u.bio && <p className="user-bio-small">{u.bio}</p>}
                </div>
              </Link>
              <button
                className={`btn btn-sm ${isFollowing ? "btn-outline" : "btn-primary"}`}
                onClick={() => handleFollow(u._id)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          );
        })}
        {!loading && results.length === 0 && query && (
          <p className="empty">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
