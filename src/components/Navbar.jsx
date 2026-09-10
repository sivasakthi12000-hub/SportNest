import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Trophy, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSports, getTournaments } from "../services/dataService";
import { SportsNestLogo } from "./SportsNestLogo";
import "../styles/navbar.css";

const Navbar = () => {
  const [sports, setSports] = useState([]);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load sports and tournament count from Supabase
  useEffect(() => {
    let isMounted = true;
    getSports().then((data) => {
      if (isMounted) setSports(data || []);
    });
    getTournaments().then((data) => {
      if (isMounted) {
        const active = (data || []).filter((t) => t.status !== "completed");
        setTournamentCount(active.length || data?.length || 0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
    <nav className="navbar" id="app-primary-navbar">
      {/* Brand Logo with Energetic Field Badge */}
      <div className="navbar-logo">
        <Link to="/" className="logo-link" style={{ textDecoration: "none" }}>
          <SportsNestLogo size="md" theme="light" />
        </Link>
      </div>

      {/* Center Navigation */}
      <div className={`nav-menu ${mobileMenuOpen ? "mobile-active" : ""}`}>
        <Link
          to="/"
          className={`nav-item ${location.pathname === "/" ? "nav-item-active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>

        {/* Dynamic Sports Dropdown from Supabase */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowSportsDropdown(true)}
          onMouseLeave={() => setShowSportsDropdown(false)}
        >
          <button
            className={`nav-item dropdown-btn ${location.pathname.startsWith("/sports") ? "nav-item-active" : ""}`}
            onClick={() => setShowSportsDropdown(!showSportsDropdown)}
          >
            Sports
            <ChevronDown size={14} className={`dropdown-chevron ${showSportsDropdown ? "open" : ""}`} />
          </button>
          {showSportsDropdown && (
            <div className="dropdown-menu">
              <Link
                to="/sports"
                className="dropdown-item dropdown-item-header"
                onClick={() => {
                  setShowSportsDropdown(false);
                  setMobileMenuOpen(false);
                }}
              >
                All Grounds & Fields
              </Link>
              <div className="dropdown-divider" />
              {sports.length > 0 ? (
                sports.map((s) => (
                  <Link
                    key={s.id}
                    to={`/tournaments?sport=${s.id}`}
                    className="dropdown-item"
                    onClick={() => {
                      setShowSportsDropdown(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="dropdown-item-name">{s.name}</span>
                    <span className="dropdown-item-badge">Field</span>
                  </Link>
                ))
              ) : (
                <span className="dropdown-item-muted">Loading sports...</span>
              )}
            </div>
          )}
        </div>

        {/* Tournaments with Live Count Pill */}
        <Link
          to="/tournaments"
          className={`nav-item nav-tournaments-item ${location.pathname.startsWith("/tournaments") || location.pathname.startsWith("/tournament/") ? "nav-item-active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>Tournaments</span>
          {tournamentCount > 0 && (
            <span className="nav-live-pill" title={`${tournamentCount} live events in database`}>
              <span className="nav-live-pulse"></span>
              {tournamentCount}
            </span>
          )}
        </Link>

        {/* Manage Dropdown */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowManageDropdown(true)}
          onMouseLeave={() => setShowManageDropdown(false)}
        >
          <button
            className={`nav-item dropdown-btn ${location.pathname === "/add-tournament" ? "nav-item-active" : ""}`}
            onClick={() => setShowManageDropdown(!showManageDropdown)}
          >
            Manage
            <ChevronDown size={14} className={`dropdown-chevron ${showManageDropdown ? "open" : ""}`} />
          </button>
          {showManageDropdown && (
            <div className="dropdown-menu">
              <Link
                to="/add-tournament"
                className="dropdown-item"
                onClick={() => {
                  setShowManageDropdown(false);
                  setMobileMenuOpen(false);
                }}
              >
                <Plus size={14} style={{ marginRight: 6 }} />
                Register Tournament
              </Link>
              <Link
                to="/tournaments"
                className="dropdown-item"
                onClick={() => {
                  setShowManageDropdown(false);
                  setMobileMenuOpen(false);
                }}
              >
                <Trophy size={14} style={{ marginRight: 6 }} />
                Browse Tournaments
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={() => {
                    setShowManageDropdown(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard size={14} style={{ marginRight: 6 }} />
                  Organizer Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Energetic Pitch CTA & Auth */}
      <div className="nav-right">
        <Link to="/add-tournament" className="nav-pitch-cta">
          <Plus size={16} />
          <span>Host Tournament</span>
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
              title={`Signed in as ${user.username} (Go to Dashboard)`}
            >
              <div className="nav-user-avatar">
                <User size={16} />
              </div>
              <span className="nav-user-name">{user.username}</span>
            </Link>

            {showUserMenu && (
              <div className="nav-user-dropdown">
                <div className="nav-user-header">
                  <strong>{user.username}</strong>
                  <span className="user-role-tag">Organizer</span>
                </div>
                <div className="dropdown-divider" />
                <Link
                  to="/dashboard"
                  className="nav-user-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <LayoutDashboard size={15} />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  to="/add-tournament"
                  className="nav-user-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Plus size={15} />
                  <span>Create Tournament</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-user-dropdown-item logout-item"
                >
                  <LogOut size={15} />
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
            title="Organizer Login (admin123)"
          >
            <User size={18} />
            <span className="nav-login-label">Login</span>
          </Link>
        )}

        {/* Mobile hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="nav-hamburger-btn"
          id="mobile-nav-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
