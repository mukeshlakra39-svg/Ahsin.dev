import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [forgotStep, setForgotStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Email is required");
    setForgotLoading(true);
    try {
      await API.post("/auth/forgot-password", { email: forgotEmail });
      toast.success("OTP sent! Check your email (or server logs)");
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("OTP is required");
    setForgotLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: forgotEmail, otp });
      toast.success("OTP verified! Set your new password.");
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("New password is required");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setForgotLoading(true);
    try {
      await API.post("/auth/reset-password", { email: forgotEmail, newPassword });
      toast.success("Password reset successful! Now login.");
      setForgotStep(0);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotStep(0);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {forgotStep === 0 && (
          <>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Login to your Ahsin.dev account</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="forgot-link">
              <button type="button" className="forgot-btn" onClick={() => setForgotStep(1)}>
                Forgot Password?
              </button>
            </p>
            <p className="auth-link">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </>
        )}

        {forgotStep === 1 && (
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive OTP</p>
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                {forgotLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
            <p className="auth-link">
              <button type="button" className="forgot-btn" onClick={resetForgotFlow}>
                Back to Login
              </button>
            </p>
          </>
        )}

        {forgotStep === 2 && (
          <>
            <h2>Enter OTP</h2>
            <p className="auth-subtitle">OTP sent to <strong>{forgotEmail}</strong></p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>6-Digit OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                {forgotLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <p className="forgot-link">
              <button type="button" className="forgot-btn" onClick={handleSendOtp} disabled={forgotLoading}>
                Resend OTP
              </button>
            </p>
            <p className="auth-link">
              <button type="button" className="forgot-btn" onClick={() => setForgotStep(1)}>
                Change Email
              </button>
            </p>
          </>
        )}

        {forgotStep === 3 && (
          <>
            <h2>New Password</h2>
            <p className="auth-subtitle">OTP verified! Set your new password.</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <p className="auth-link">
              <button type="button" className="forgot-btn" onClick={() => setForgotStep(2)}>
                Back
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
