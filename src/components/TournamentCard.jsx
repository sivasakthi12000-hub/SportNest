import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Trophy, Users, Calendar, ArrowRight, Shield, DollarSign } from "lucide-react";
import { getTournamentVisual } from "../data/sportGroundImages";
import "../styles/tournament.css";

const sportIcons = {
  Soccer: "⚽",
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Cricket: "🏏",
  Kabaddi: "🤼",
  Volleyball: "🏐",
  Hockey: "🏑",
  Badminton: "🏸",
  "Table Tennis": "🏓",
  Swimming: "🏊",
};

const TournamentCard = ({ tournament, sportName }) => {
  const t = tournament || {};
  const sName = sportName || t.sport_name || (t.sportId === 1 ? "Soccer" : t.sportId === 2 ? "Basketball" : t.sportId === 3 ? "Tennis" : t.sportId === 4 ? "Cricket" : t.sportId === 5 ? "Kabaddi" : t.sportId === 6 ? "Volleyball" : "Sports");
  
  const visual = getTournamentVisual(t, sName);

  // Status computation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tournamentDate = new Date(t.date || Date.now());
  tournamentDate.setHours(0, 0, 0, 0);

  let statusBadge = "Upcoming";
  let statusClass = "status-upcoming";
  let statusDot = "🟢";

  if (t.status === "full" || t.registeredTeams >= t.maxTeams) {
    statusBadge = "Full";
    statusClass = "status-full";
    statusDot = "🔴";
  } else if (tournamentDate < today || t.status === "post") {
    statusBadge = "Completed";
    statusClass = "status-completed";
    statusDot = "⚪";
  } else if (tournamentDate.getTime() === today.getTime() || t.status === "ongoing") {
    statusBadge = "Live Now";
    statusClass = "status-live";
    statusDot = "🟢";
  } else {
    statusBadge = "Registration Open";
    statusClass = "status-upcoming";
    statusDot = "🔵";
  }

  const maxTeams = Number(t.maxTeams ?? t.max_teams ?? 16);
  const registeredTeams = Number(t.registeredTeams ?? t.registered_teams ?? 0);
  const fillPercent = Math.min(100, Math.round((registeredTeams / Math.max(1, maxTeams)) * 100));
  const prizeAmount = Number(t.prizeAmount ?? t.prize_amount ?? 0);
  const entryFee = Number(t.entryFee ?? t.entry_fee ?? 0);
  const locationText = [t.groundName || t.ground_name, t.location, t.state].filter(Boolean).join(" • ");

  return (
    <div className={`tournament-image-card ${statusClass}`}>
      {/* Background Image: Admin Custom Banner/Logo OR Default Real Playing Ground */}
      <div className="card-bg-visual">
        <img
          src={visual.imageUrl}
          alt={t.name || "Tournament Ground"}
          className="card-bg-photo"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop";
          }}
        />
        <div className="card-bg-scrim" />
        <div className="card-bg-vignette" />
      </div>

      {/* Top Badges Header */}
      <div className="card-top-badges">
        <div className="badge-group-left">
          <span className="sport-pill-badge">
            <span className="sport-emoji">{sportIcons[sName] || "🏆"}</span>
            {sName}
          </span>
          <span className={`status-pill-badge ${statusClass}`}>
            <span className="status-indicator-dot"></span>
            {statusBadge}
          </span>
        </div>

        {/* Visual source indicator: Admin custom banner vs Default playing ground */}
        <div className="badge-group-right">
          {visual.isCustom ? (
            <span className="banner-type-badge banner-custom" title="Custom Admin Banner / Logo">
              <Shield size={12} style={{ marginRight: "3px" }} />
              Official Banner
            </span>
          ) : (
            <span className="banner-type-badge banner-ground" title={`Default Ground: ${visual.groundName}`}>
              🏟️ Venue Ground
            </span>
          )}
        </div>
      </div>

      {/* Card Body Information */}
      <div className="card-body-info">
        <div className="card-title-row">
          <h3 className="tournament-title" title={t.name}>
            {t.name}
          </h3>
        </div>

        {locationText && (
          <div className="card-location-row" title={locationText}>
            <MapPin size={14} className="location-icon" />
            <span className="location-text">{locationText}</span>
          </div>
        )}

        {/* Detailed Street Address & Pincode Badge */}
        {(t.address || t.pincode) && (
          <div
            className="card-address-badge-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.78rem",
              color: "#cbd5e1",
              marginBottom: "8px",
            }}
          >
            {t.address && (
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                }}
                title={t.address}
              >
                📍 {t.address}
              </span>
            )}
            {t.pincode && (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                }}
              >
                📮 PIN: {t.pincode}
              </span>
            )}
          </div>
        )}

        {/* Prize Breakdown Highlights */}
        {t.prizeBreakdown && t.prizeBreakdown.length > 0 && (
          <div
            className="card-prizes-preview"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            {t.prizeBreakdown.slice(0, 2).map((p, pIdx) => (
              <span
                key={pIdx}
                style={{
                  background: "rgba(251, 191, 36, 0.15)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {p.position}: ₹{Number(p.amount).toLocaleString("en-IN")}
              </span>
            ))}
            {t.prizeBreakdown.length > 2 && (
              <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                +{t.prizeBreakdown.length - 2} more prizes
              </span>
            )}
          </div>
        )}

        {/* Tournament Stats Ribbon */}
        <div className="card-stats-grid">
          <div className="stat-pill">
            <Trophy size={13} className="stat-icon-gold" />
            <div className="stat-text-col">
              <span className="stat-label">Prize Pool</span>
              <span className="stat-value">
                {prizeAmount > 0 ? `₹${prizeAmount.toLocaleString()}` : "Trophy & Medals"}
              </span>
            </div>
          </div>

          <div className="stat-pill">
            <DollarSign size={13} className="stat-icon-blue" />
            <div className="stat-text-col">
              <span className="stat-label">Entry Fee</span>
              <span className="stat-value">{entryFee > 0 ? `₹${entryFee.toLocaleString()}` : "Free"}</span>
            </div>
          </div>

          <div className="stat-pill">
            <Calendar size={13} className="stat-icon-violet" />
            <div className="stat-text-col">
              <span className="stat-label">Match Date</span>
              <span className="stat-value">{t.date ? t.date : "TBA"}</span>
            </div>
          </div>

          <div className="stat-pill">
            <Users size={13} className="stat-icon-emerald" />
            <div className="stat-text-col">
              <span className="stat-label">Teams</span>
              <span className="stat-value">
                {registeredTeams} / {maxTeams}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="teams-capacity-container">
          <div className="capacity-bar-header">
            <span>Registration Capacity</span>
            <span>{fillPercent}% Filled</span>
          </div>
          <div className="capacity-bar-track">
            <div
              className={`capacity-bar-fill ${fillPercent >= 90 ? "fill-critical" : fillPercent >= 50 ? "fill-medium" : "fill-normal"}`}
              style={{ width: `${Math.max(6, fillPercent)}%` }}
            />
          </div>
        </div>

        {/* Action Link */}
        <div className="card-action-row">
          <Link to={`/tournament/${t.id}`} className="btn-tournament-action">
            <span>View Tournament & Register</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
