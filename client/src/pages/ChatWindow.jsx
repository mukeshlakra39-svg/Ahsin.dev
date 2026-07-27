import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import useSocket from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Send } from "lucide-react";

const ChatWindow = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { emit, on, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatUser, setChatUser] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    API.get(`/users/${userId}`)
      .then((res) => setChatUser(res.data))
      .catch(() => {});
    API.get(`/chat/messages/${userId}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    const cleanup1 = on("receive-message", (msg) => {
      if (msg.sender._id === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    const cleanup2 = on("message-sent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const cleanup3 = on("user-typing", (data) => {
      if (data.userId === userId) {
        setIsPeerTyping(data.isTyping);
      }
    });

    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
    };
  }, [userId, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPeerTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    emit("send-message", { receiverId: userId, text: text.trim() });
    setText("");
    emit("typing", { receiverId: userId, isTyping: false });
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!typing) {
      setTyping(true);
      emit("typing", { receiverId: userId, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      emit("typing", { receiverId: userId, isTyping: false });
    }, 1000);
  };

  const isOnline = onlineUsers.includes(userId);

  return (
    <div className="chat-window-page">
      <div className="chat-header">
        <button onClick={() => navigate("/chat")} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        {chatUser && (
          <div className="chat-user-info" onClick={() => navigate(`/user/${chatUser._id}`)}>
            {chatUser.profileImage ? (
              <img src={`https://ahsin-dev-backend.onrender.com/${chatUser.profileImage}`} alt="" className="chat-user-img" />
            ) : (
              <div className="chat-user-avatar">{chatUser.name?.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h4>{chatUser.name}</h4>
              <p className="chat-user-status">{isOnline ? "Online" : `@${chatUser.username}`}</p>
            </div>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Say hello to {chatUser?.name}!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = (msg.sender._id || msg.sender) === (user?.id || user?._id);
          return (
            <div key={msg._id || i} className={`chat-bubble ${isMe ? "sent" : "received"}`}>
              <p>{msg.text}</p>
              <span className="chat-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        {isPeerTyping && (
          <div className="chat-bubble received typing-bubble">
            <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
          autoComplete="off"
        />
        <button type="submit" className="send-btn" disabled={!text.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
