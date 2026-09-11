import React from "react";
import { Clock, MapPin, Radio, Shield, ChevronRight } from "lucide-react";
import { LiveMatch } from "../../services/matchesService";
import { TeamCrestBadge } from "./TeamCrestBadge";

interface BroadcastMatchCardProps {
  match: LiveMatch;
  onOpenDetails?: () => void;
}

export const BroadcastMatchCard: React.FC<BroadcastMatchCardProps> = ({
  match,
  onOpenDetails,
}) => {
  const isLive = match.status === "live";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e1b4b 100%)",
        border: isLive ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "16px",
        padding: "1.25rem 1rem",
        color: "#ffffff",
        position: "relative",
        boxShadow: isLive ? "0 8px 25px rgba(220, 38, 38, 0.2)" : "0 8px 20px rgba(0,0,0,0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      id={`broadcast-card-${match.id}`}
    >
      {/* Background stadium floodlight subtle sheen */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "80px",
          background: isLive ? "radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)" : "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Banner: Sport & Round & Live Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.85rem",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1rem" }}>{match.sportIcon}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {match.sportName} &bull; {match.round}
          </span>
        </div>

        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px",
            background: isLive ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
            color: isLive ? "#f87171" : "#cbd5e1",
            border: isLive ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {isLive ? (
            <>
              <Radio size={12} color="#ef4444" className="animate-pulse" />
              <span>{match.statusLabel || "LIVE"}</span>
            </>
          ) : match.status === "completed" ? (
            <span>✔ FINISHED</span>
          ) : (
            <span>⏰ TODAY</span>
          )}
        </span>
      </div>

      {/* CENTER CONFRONTATION: TEAM A vs TEAM B (Matching user uploaded image) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "0.5rem",
          margin: "0.5rem 0 1rem 0",
          zIndex: 2,
        }}
      >
        {/* TEAM A (Left Side) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <TeamCrestBadge team={match.teamA} size={68} />
          <span
            style={{
              marginTop: "0.5rem",
              fontWeight: 900,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              color: "#ffffff",
              textTransform: "uppercase",
              maxWidth: "115px",
              lineHeight: 1.2,
            }}
          >
            {match.teamA.name}
          </span>
          {isLive && (
            <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#38bdf8", marginTop: "2px" }}>
              {match.teamA.score}
            </span>
          )}
        </div>

        {/* CENTER VS WITH DYNAMIC ENERGY SLASH */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              padding: "0 0.5rem",
            }}
          >
            {/* Dynamic slanted background slash */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) skewX(-15deg)",
                width: "48px",
                height: "32px",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            {/* Bold white VS text */}
            <span
              style={{
                position: "relative",
                fontSize: "1.5rem",
                fontWeight: 900,
                fontStyle: "italic",
                color: "#ffffff",
                letterSpacing: "0.08em",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))",
              }}
            >
              VS
            </span>
          </div>

          {/* TIME PILL (e.g. "🕒 17H30" or score badge matching user's image) */}
          <div
            style={{
              marginTop: "0.6rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              borderRadius: "9999px",
              padding: "0.2rem 0.65rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <Clock size={11} color="#fbbf24" />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#fbbf24",
                letterSpacing: "0.05em",
                fontFamily: "monospace",
              }}
            >
              {match.matchTimePill || "17H30"}
            </span>
          </div>
        </div>

        {/* TEAM B (Right Side) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <TeamCrestBadge team={match.teamB} size={68} />
          <span
            style={{
              marginTop: "0.5rem",
              fontWeight: 900,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              color: "#ffffff",
              textTransform: "uppercase",
              maxWidth: "115px",
              lineHeight: 1.2,
            }}
          >
            {match.teamB.name}
          </span>
          {isLive && (
            <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#f87171", marginTop: "2px" }}>
              {match.teamB.score}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer: Arena ground, City, and Match Details Action */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "0.65rem",
          marginTop: "0.4rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.72rem",
          color: "#94a3b8",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <MapPin size={12} color="#38bdf8" />
          <span>{match.groundName}, {match.location}</span>
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            style={{
              background: "none",
              border: "none",
              color: "#38bdf8",
              fontWeight: 700,
              fontSize: "0.72rem",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span>Details</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
