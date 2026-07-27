import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import useSocket from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

const ChatList = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/chat/conversations")
      .then((res) => setConversations(res.data))
      .catch(() => toast.error("Failed to load chats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading chats...</div>;

  return (
    <div className="chat-list-page">
      <h2><MessageCircle size={24} /> Messages</h2>
      {conversations.length === 0 ? (
        <div className="empty">
          <h3>No messages yet</h3>
          <p>Visit a user's profile to start chatting!</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv) => {
            const isOnline = onlineUsers.includes(conv.user._id);
            return (
              <Link
                to={`/chat/${conv.user._id}`}
                key={conv.user._id}
                className="conversation-item"
              >
                <div className="conv-avatar-wrap">
                  {conv.user.profileImage ? (
                    <img src={`https://ahsin-dev-backend.onrender.com/${conv.user.profileImage}`} alt="" className="conv-avatar" />
                  ) : (
                    <div className="conv-avatar">{conv.user.name?.charAt(0).toUpperCase()}</div>
                  )}
                  {isOnline && <span className="online-dot" />}
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <h4>{conv.user.name}</h4>
                    <span className="conv-time">
                      {new Date(conv.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="conv-preview">
                    <p>@{conv.user.username}</p>
                    <span className="conv-last">{conv.lastMessage}</span>
                  </div>
                </div>
                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
