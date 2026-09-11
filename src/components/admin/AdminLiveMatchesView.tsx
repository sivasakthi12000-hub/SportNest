import React, { useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Trophy,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { LiveMatch } from "../../services/matchesService";

interface AdminLiveMatchesViewProps {
  matches: LiveMatch[];
}

export const AdminLiveMatchesView: React.FC<AdminLiveMatchesViewProps> = ({ matches }) => {
  const [filter, setFilter] = useState<"all" | "live" | "today" | "disputed">("all");

  const filtered = matches.filter((m) => {
    if (filter === "live") return m.status === "live";
    if (filter === "today") return m.status === "today";
    if (filter === "disputed") return m.hasDispute === true;
    return true;
  });

  const liveCount = matches.filter((m) => m.status === "live").length;
  const todayCount = matches.filter((m) => m.status === "today").length;
  const disputeCount = matches.filter((m) => m.hasDispute).length;

  return (
    <div className="admin-view-container">
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1>Live & Today's Matches</h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                fontSize: "0.82rem",
                fontWeight: 700,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }}></span>
              {liveCount} Active In-Play
            </span>
          </div>
          <p>
            Real-time score tracking, field umpire status, schedule timelines, and dispute alerts for today's tournaments.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("all")}
          className={`dash-filter-tab ${filter === "all" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid",
            borderColor: filter === "all" ? "#059669" : "#e2e8f0",
            background: filter === "all" ? "#ecfdf5" : "#ffffff",
            color: filter === "all" ? "#059669" : "#475569",
            cursor: "pointer",
          }}
        >
          All Matches ({matches.length})
        </button>

        <button
          onClick={() => setFilter("live")}
          className={`dash-filter-tab ${filter === "live" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid",
            borderColor: filter === "live" ? "#10b981" : "#e2e8f0",
            background: filter === "live" ? "#ecfdf5" : "#ffffff",
            color: filter === "live" ? "#059669" : "#475569",
            cursor: "pointer",
          }}
        >
          🔴 Live In-Play ({liveCount})
        </button>

        <button
          onClick={() => setFilter("today")}
          className={`dash-filter-tab ${filter === "today" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid",
            borderColor: filter === "today" ? "#0284c7" : "#e2e8f0",
            background: filter === "today" ? "#f0f9ff" : "#ffffff",
            color: filter === "today" ? "#0284c7" : "#475569",
            cursor: "pointer",
          }}
        >
          📅 Scheduled Today ({todayCount})
        </button>

        <button
          onClick={() => setFilter("disputed")}
          className={`dash-filter-tab ${filter === "disputed" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid",
            borderColor: filter === "disputed" ? "#dc2626" : "#e2e8f0",
            background: filter === "disputed" ? "#fef2f2" : "#ffffff",
            color: filter === "disputed" ? "#dc2626" : "#475569",
            cursor: "pointer",
          }}
        >
          ⚠️ Disputed ({disputeCount})
        </button>
      </div>

      {/* Grid of Match Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {filtered.map((m) => {
          const isLive = m.status === "live";
          const isDisputed = m.hasDispute;

          return (
            <div
              key={m.id}
              className="admin-data-card"
              style={{
                border: isDisputed
                  ? "2px solid #f87171"
                  : isLive
                  ? "2px solid #34d399"
                  : "1px solid #e2e8f0",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{m.sportIcon}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      {m.sportName} &bull; {m.round}
                    </span>
                  </div>
                  <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                    {m.tournamentName}
                  </h4>
                </div>

                <span
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    background: isDisputed
                      ? "#fef2f2"
                      : isLive
                      ? "#ecfdf5"
                      : "#f1f5f9",
                    color: isDisputed
                      ? "#dc2626"
                      : isLive
                      ? "#059669"
                      : "#475569",
                  }}
                >
                  {isDisputed ? "⚠️ Disputed" : m.statusLabel}
                </span>
              </div>

              {/* Scoreboard block */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", color: "#334155" }}>
                      {m.teamA.name.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{m.teamA.name}</span>
                      {m.teamA.detail && <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.4rem" }}>{m.teamA.detail}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    {m.teamA.score}
                  </span>
                </div>

                <div style={{ height: "1px", background: "#e2e8f0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", color: "#334155" }}>
                      {m.teamB.name.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{m.teamB.name}</span>
                      {m.teamB.detail && <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.4rem" }}>{m.teamB.detail}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    {m.teamB.score}
                  </span>
                </div>
              </div>

              {/* Dispute Alert Note if present */}
              {isDisputed && m.disputeNotes && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8rem",
                    color: "#b91c1c",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>{m.disputeNotes}</span>
                </div>
              )}

              {/* Footer Meta */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={13} color="#059669" />
                  <span>{m.groundName}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                  <Clock size={13} />
                  <span>{m.timeDisplay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
