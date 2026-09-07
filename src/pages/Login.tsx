import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = login(username, password);

    if (result.success) {
      setIsLoading(false);
      navigate("/dashboard");
    } else {
      setIsLoading(false);
      setError(result.error || "Authentication failed. Please verify your credentials.");
    }
  };

  const handleFillDemo = () => {
    setUsername("admin123");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" id="login-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <User size={28} />
          </div>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Sign in to access your ArenaSync Dashboard</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" style={{ marginBottom: "1.25rem" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="login-username">Username</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="admin123"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="admin123"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            id="login-submit-btn"
            disabled={isLoading}
          >
            <LogIn size={18} />
            <span>{isLoading ? "Authenticating..." : "Sign In to Dashboard"}</span>
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-credentials-header">Required Credentials</div>
          <div className="demo-credentials-values">
            <strong>userName:</strong> admin123 &nbsp;|&nbsp; <strong>password:</strong> admin123
          </div>
          <div>
            <button type="button" onClick={handleFillDemo} className="demo-autofill-btn">
              ⚡ Fill Admin Credentials
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
