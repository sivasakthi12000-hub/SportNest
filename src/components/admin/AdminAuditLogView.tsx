import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  ipAddress: string;
}

export const AdminAuditLogView: React.FC = () => {
  const [search, setSearch] = useState("");

  const logs: AuditLogEntry[] = [
    {
      id: "LOG-901",
      actor: "admin123",
      action: "Admin Login Authenticated",
      target: "Session Token Issued (Bearer)",
      timestamp: "Today, 10:14 AM",
      status: "success",
      ipAddress: "192.168.1.104",
    },
    {
      id: "LOG-902",
      actor: "admin123",
      action: "Approved Squad Registration",
      target: "Kovai Thunderbolts (Tournament #1)",
      timestamp: "Today, 09:30 AM",
      status: "success",
      ipAddress: "192.168.1.104",
    },
    {
      id: "LOG-903",
      actor: "System Sentinel",
      action: "Score Dispute Raised",
      target: "Match #3 (Madurai Veeran vs Thanjavur Cholas)",
      timestamp: "Today, 08:45 AM",
      status: "warning",
      ipAddress: "10.0.4.12",
    },
    {
      id: "LOG-904",
      actor: "admin123",
      action: "Created Tournament",
      target: "Salem Open Badminton Grand Prix",
      timestamp: "Yesterday, 04:20 PM",
      status: "success",
      ipAddress: "192.168.1.104",
    },
    {
      id: "LOG-905",
      actor: "chennai_coord",
      action: "Updated Team Roster",
      target: "Marina Strikers (Registered 11 players)",
      timestamp: "Yesterday, 02:15 PM",
      status: "success",
      ipAddress: "117.202.44.18",
    },
    {
      id: "LOG-906",
      actor: "admin123",
      action: "Role Assignment Modified",
      target: "madurai_lead assigned role: admin",
      timestamp: "Sep 07, 2026",
      status: "success",
      ipAddress: "192.168.1.104",
    },
  ];

  const filtered = logs.filter(
    (l) =>
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-view-container">
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1>Administrative Audit & Event Log</h1>
            <span
              style={{
                background: "#fef3c7",
                color: "#b45309",
                fontSize: "0.8rem",
                fontWeight: 800,
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
                border: "1px solid #fde68a",
              }}
            >
              👑 Super Admin Only
            </span>
          </div>
          <p>
            Immutable chronological trace of user authorizations, squad approvals, roster mutations, and security events.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search actor, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-data-card" style={{ padding: "0" }}>
        <div className="dash-table-wrap">
          <table className="dash-trans-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Actor</th>
                <th>Action & Target</th>
                <th>Timestamp</th>
                <th>IP / Origin</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                    {log.id}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>@{log.actor}</span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>
                        {log.action}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {log.target}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {log.timestamp}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                    {log.ipAddress}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.55rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: log.status === "success" ? "#ecfdf5" : "#fef2f2",
                        color: log.status === "success" ? "#059669" : "#dc2626",
                      }}
                    >
                      {log.status === "success" ? "Success" : "Warning"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
