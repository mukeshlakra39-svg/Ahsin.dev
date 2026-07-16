import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Plus, User, Home } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          DevFolio
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Home size={18} /> Home
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <Plus size={18} /> Add Project
              </Link>
              <Link to="/profile" className="nav-link">
                <User size={18} /> {user.name}
              </Link>
              <button onClick={handleLogout} className="nav-btn logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-btn register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
