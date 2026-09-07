import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const Navbar = () => {
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show the navbar on Login and Dashboard (those are separate full-bleed layouts)
  if (location.pathname.startsWith("/login") || location.pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">ArenaSync</span>
        </Link>
      </div>

      {/* Center Navigation */}
      <div className={`nav-menu ${mobileMenuOpen ? "mobile-active" : ""}`}>
        <Link to="/" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>

        {/* Sports Dropdown */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowSportsDropdown(true)}
          onMouseLeave={() => setShowSportsDropdown(false)}
        >
          <button className="nav-item dropdown-btn" onClick={() => setShowSportsDropdown(!showSportsDropdown)}>
            Sports
            <span className="dropdown-icon">▼</span>
          </button>
          {showSportsDropdown && (
            <div className="dropdown-menu">
              <Link to="/sports?sport=4" className="dropdown-item" onClick={() => { setShowSportsDropdown(false); setMobileMenuOpen(false); }}>Cricket</Link>
              <Link to="/sports?sport=1" className="dropdown-item" onClick={() => { setShowSportsDropdown(false); setMobileMenuOpen(false); }}>Football</Link>
              <Link to="/sports?sport=2" className="dropdown-item" onClick={() => { setShowSportsDropdown(false); setMobileMenuOpen(false); }}>Basketball</Link>
              <Link to="/sports?sport=5" className="dropdown-item" onClick={() => { setShowSportsDropdown(false); setMobileMenuOpen(false); }}>Kabaddi</Link>
              <Link to="/sports?sport=3" className="dropdown-item" onClick={() => { setShowSportsDropdown(false); setMobileMenuOpen(false); }}>Tennis</Link>
            </div>
          )}
        </div>

        {/* Tournaments */}
        <Link to="/tournaments" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
          Tournaments
        </Link>

        {/* Manage Dropdown */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowManageDropdown(true)}
          onMouseLeave={() => setShowManageDropdown(false)}
        >
          <button className="nav-item dropdown-btn" onClick={() => setShowManageDropdown(!showManageDropdown)}>
            Manage
            <span className="dropdown-icon">▼</span>
          </button>
          {showManageDropdown && (
            <div className="dropdown-menu">
              <Link to="/add-tournament" className="dropdown-item" onClick={() => { setShowManageDropdown(false); setMobileMenuOpen(false); }}>Register Tournament</Link>
              <Link to="/tournaments" className="dropdown-item" onClick={() => { setShowManageDropdown(false); setMobileMenuOpen(false); }}>View Tournaments</Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - CTA & User Icon */}
      <div className="nav-right">
        <Link to="/add-tournament" className="btn btn-primary">
          Register Tournament
        </Link>

        {/* User Icon Button */}
        {isAuthenticated && user ? (
          <div
            className="nav-user-wrapper"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <Link
              to="/dashboard"
              className="nav-user-btn authenticated"
              id="nav-user-btn"
              title="View Dashboard (admin123)"
            >
              <div className="nav-user-avatar">
                <User size={18} />
              </div>
              <span className="nav-user-name">{user.username}</span>
            </Link>

            {showUserMenu && (
              <div className="nav-user-dropdown">
                <Link
                  to="/dashboard"
                  className="nav-user-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-user-dropdown-item logout-item"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="nav-user-btn"
            id="nav-user-btn"
            aria-label="User Login"
            title="Sign In with userName: admin123"
          >
            <User size={20} />
          </Link>
        )}

        {/* Mobile hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="nav-auth-btn"
          style={{ display: "none", padding: "0.4rem 0.6rem" }}
          id="mobile-nav-toggle"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
