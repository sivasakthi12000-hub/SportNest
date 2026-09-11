import React, { useState } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  Calendar,
  Clock,
  Code,
  CheckCircle2,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AdminProfileView: React.FC = () => {
  const { user, token } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || user?.username || "Admin");
  const [email, setEmail] = useState(user?.email || "admin@sportsnest.org");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const isSuper = user?.role === "superadmin";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sessionJson = JSON.stringify(
    {
      sessionUser: user,
      authToken: token,
      activeSince: "2026-09-11T00:00:00.000Z",
      clientOrigin: window.location.origin,
      scopes: isSuper ? ["ALL_ACCESS", "USER_MANAGEMENT", "AUDIT_LOG", "MUTATIONS"] : ["TOURNAMENTS_READ_WRITE", "APPROVALS", "TEAMS"],
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-view-container">
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>My Profile & Security</h1>
          <p>View your active session credentials, role entitlements, and manage your account details.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Left Card: Profile Overview */}
        <div className="admin-data-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: isSuper ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #059669, #047857)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {user?.name || user?.username || "Admin"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    background: isSuper ? "#fef3c7" : "#ecfdf5",
                    color: isSuper ? "#b45309" : "#059669",
                    border: `1px solid ${isSuper ? "#fde68a" : "#a7f3d0"}`,
                  }}
                >
                  {isSuper ? "👑 Super Admin" : "🛡️ Admin"}
                </span>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>@{user?.username}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Active Email Address
              </label>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
                {user?.email || `${user?.username}@sportsnest.org`}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Role Capabilities
              </label>
              <div style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5, marginTop: "0.2rem" }}>
                {isSuper ? (
                  <span>
                    Full administrative privileges: Can access tournaments, squad approvals, user management, audit logs, and system preferences.
                  </span>
                ) : (
                  <span>
                    Regional administrator: Can manage assigned tournaments, review squad registrations, and manage sports rosters.
                  </span>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Authentication Bearer Token
              </label>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  color: "#475569",
                  wordBreak: "break-all",
                  border: "1px solid #e2e8f0",
                  marginTop: "0.25rem",
                }}
              >
                {token ? `${token.substring(0, 32)}...` : "Active Server In-Memory Token"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                onClick={() => setShowJson(!showJson)}
                className="admin-btn-secondary"
                style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Code size={14} />
                <span>{showJson ? "Hide Token JSON" : "Inspect Token JSON"}</span>
              </button>

              <button
                onClick={handleCopy}
                className="admin-btn-secondary"
                style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy Session"}</span>
              </button>
            </div>

            {showJson && (
              <pre
                style={{
                  background: "#0f172a",
                  color: "#38bdf8",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  overflowX: "auto",
                  marginTop: "0.75rem",
                }}
              >
                {sessionJson}
              </pre>
            )}
          </div>
        </div>

        {/* Right Card: Account Details Form */}
        <div className="admin-data-card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Update Account Information
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
            Changes will update your active session profile across the dashboard.
          </p>

          {saved && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                padding: "0.6rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Change Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              style={{ width: "fit-content", marginTop: "0.5rem" }}
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
