import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";
import UserSearch from "./pages/UserSearch";
import UserPublicProfile from "./pages/UserPublicProfile";
import MediaFeed from "./pages/MediaFeed";
import MediaUpload from "./pages/MediaUpload";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/user/:id" element={<ProtectedRoute><UserPublicProfile /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><MediaFeed /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><MediaUpload /></ProtectedRoute>} />
          <Route path="/search-users" element={<ProtectedRoute><UserSearch /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
