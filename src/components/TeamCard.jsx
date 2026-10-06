import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Users, ArrowRight } from "lucide-react";
import "../styles/teams.css";

const TeamCard = ({ team }) => (
  <div className="card team-card">
    <div className="card-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>{team.name}</h3>
        {team.group && (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "0.2rem 0.5rem",
              borderRadius: "6px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
            }}
          >
            Group {team.group}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        <Users size={14} />
        <span><strong>{team.members || 11}</strong> Registered Squad Players</span>
      </div>
    </div>

    <div className="card-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
      <Link
        to={`/team/${team.id}`}
        className="btn-details"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "#ffffff",
          fontWeight: 700,
          textDecoration: "none",
          padding: "0.55rem 0.85rem",
          borderRadius: "8px",
          flex: 1,
          fontSize: "0.82rem",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
        }}
      >
        <Sparkles size={14} />
        <span>3D Locker Room</span>
      </Link>
    </div>
  </div>
);

export default TeamCard;
