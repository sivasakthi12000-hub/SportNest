import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  Plus,
  LogOut,
  Trophy,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTournaments, Tournament } from "../services/dataService";
import "../styles/admin-dashboard.css";

export const Profile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    getTournaments().then((data) => {
      setTournaments(data || []);
      setLoading(false);
    });
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const isSuper = user.role === "superadmin" || user.username === "admin123";
  const myTournaments = tournaments.filter(
    (t) => !t.createdBy || t.createdBy.toLowerCase() === user.username.toLowerCase()
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.25rem" }}>
      {/* Top Banner Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            height: "120px",
            background: isSuper
              ? "linear-gradient(135deg, #1e293b, #0f172a, #d97706)"
              : "linear-gradient(135deg, #065f46, #047857, #10b981)",
            position: "relative",
          }}
        />

        <div style={{ padding: "0 2rem 2rem", position: "relative" }}>
          {/* Avatar & Title Row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginTop: "-45px",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "20px",
                  background: isSuper ? "#d97706" : "#059669",
                  border: "4px solid #ffffff",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {user.name || user.username}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.35rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      background: isSuper ? "#fef3c7" : "#ecfdf5",
                      color: isSuper ? "#b45309" : "#047857",
                      border: `1px solid ${isSuper ? "#fde68a" : "#a7f3d0"}`,
                    }}
                  >
                    {isSuper ? "👑 Super Administrator" : "🛡️ Tournament Organizer"}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>@{user.username}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                to="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.2rem",
                  borderRadius: "10px",
                  background: "#059669",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
                }}
              >
                <LayoutDashboard size={16} />
                <span>Go to Admin Dashboard</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1rem",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              background: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                Email Address
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
                {user.email || `${user.username}@sportsnest.app`}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                Session Security
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem", fontWeight: 600, color: "#059669", marginTop: "4px" }}>
                <CheckCircle2 size={16} />
                <span>Active & Authenticated</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                Role Permissions
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
                {isSuper ? "Full System & DB Control" : "Tournaments & Brackets"}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                My Events
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
                {myTournaments.length} Tournaments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Tournaments & Account Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Left: Tournaments Hosted */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Trophy size={18} style={{ color: "#059669" }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                My Tournaments
              </h2>
            </div>
            <Link
              to="/add-tournament"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#059669",
                textDecoration: "none",
              }}
            >
              <Plus size={14} /> Host New
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading tournaments...</p>
          ) : myTournaments.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8fafc", borderRadius: "10px" }}>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>No tournaments created yet.</p>
              <Link
                to="/add-tournament"
                style={{
                  display: "inline-block",
                  marginTop: "0.75rem",
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                + Create your first tournament
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myTournaments.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  to={`/tournament/${t.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>{t.name}</strong>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      📍 {t.location} • {t.date}
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </Link>
              ))}

              {myTournaments.length > 5 && (
                <Link
                  to="/dashboard"
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#059669",
                    textDecoration: "none",
                  }}
                >
                  View all {myTournaments.length} in Admin Dashboard →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: Organizer Management & Links */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
            <Shield size={18} style={{ color: "#059669" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Organizer Portals
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              to="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LayoutDashboard size={20} color="#059669" />
                <div>
                  <strong style={{ fontSize: "0.92rem", color: "#065f46", display: "block" }}>Admin Dashboard</strong>
                  <span style={{ fontSize: "0.78rem", color: "#16a34a" }}>Manage brackets, teams, and tournament live operations</span>
                </div>
              </div>
              <ChevronRight size={16} color="#059669" />
            </Link>

            <Link
              to="/add-tournament"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Plus size={20} color="#475569" />
                <div>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>Create Tournament</strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Publish a new sport tournament with prizes & ground address</span>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </Link>

            <Link
              to="/tournaments"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Trophy size={20} color="#475569" />
                <div>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>Public Tournaments</strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Explore all live and upcoming tournaments</span>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
