import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Trophy, Users, Calendar, ArrowRight, Shield, DollarSign, Clock, AlertCircle } from "lucide-react";
import { getTournamentVisual } from "../utils/visualTheme";
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
  const isFull = t.status === "full" || registeredTeams >= maxTeams;
  const slotsRemaining = Math.max(0, maxTeams - registeredTeams);
  const isLowSlots = !isFull && slotsRemaining > 0 && (slotsRemaining <= 4 || slotsRemaining <= Math.ceil(maxTeams * 0.25));
  const fillPercent = Math.min(100, Math.round((registeredTeams / Math.max(1, maxTeams)) * 100));
  const prizeAmount = Number(t.prizeAmount ?? t.prize_amount ?? 0);
  const entryFee = Number(t.entryFee ?? t.entry_fee ?? 0);
  const locationText = [t.groundName || t.ground_name, t.location, t.state].filter(Boolean).join(" • ");

  const lastRegDateStr = t.lastRegistrationDate || t.last_registration_date || "";

  // Live timer calculation
  const calculateTimeLeft = (dateStr) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (!dateStr.includes("T")) {
      target.setHours(23, 59, 59, 999);
    }
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      expired: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(lastRegDateStr));

  useEffect(() => {
    // If Maximum Teams Allowed is full, do not run or show timer
    if (isFull || !lastRegDateStr) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(lastRegDateStr));
    }, 1000);

    return () => clearInterval(interval);
  }, [isFull, lastRegDateStr]);

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

        {/* Registration Timer / Full Capacity Status */}
        {isFull ? (
          /* When Maximum Teams Allowed is full: strictly DO NOT show timer */
          <div
            className="reg-timer-banner reg-timer-full"
            style={{
              marginTop: "0.75rem",
              padding: "0.55rem 0.8rem",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.95rem" }}>🚫</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#dc2626" }}>
                Tournament Full (0 Slots Left)
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 600 }}>
              Max {maxTeams} Teams Reached
            </span>
          </div>
        ) : (
          /* When slots are still available: show Last Registration Date and live Timer */
          <div
            className={`reg-timer-banner ${isLowSlots ? "reg-timer-urgent" : "reg-timer-active"}`}
            style={{
              marginTop: "0.75rem",
              padding: "0.55rem 0.8rem",
              borderRadius: "8px",
              background: isLowSlots ? "rgba(245, 158, 11, 0.08)" : "rgba(37, 99, 235, 0.06)",
              border: `1px solid ${isLowSlots ? "rgba(245, 158, 11, 0.3)" : "rgba(37, 99, 235, 0.2)"}`,
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Clock size={13} color={isLowSlots ? "#d97706" : "#2563eb"} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: isLowSlots ? "#b45309" : "#1d4ed8" }}>
                  Last Date: {lastRegDateStr || "Open"}
                </span>
              </div>
              {isLowSlots && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#b45309",
                    background: "rgba(245, 158, 11, 0.2)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                  }}
                >
                  ⚡ Only {slotsRemaining} {slotsRemaining === 1 ? "Slot" : "Slots"} Left!
                </span>
              )}
            </div>

            {timeLeft && !timeLeft.expired ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.76rem" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Closes in:</span>
                <span style={{ fontWeight: 700, color: isLowSlots ? "#d97706" : "#0f172a", letterSpacing: "0.02em" }}>
                  {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
                  {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>
            ) : timeLeft && timeLeft.expired ? (
              <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "#94a3b8" }}>
                Registration deadline passed
              </span>
            ) : (
              <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                Registration Open • {slotsRemaining} slots remaining
              </span>
            )}
          </div>
        )}

        {/* Action Link */}
        <div className="card-action-row">
          <Link to={`/tournament/${t.id}`} className="btn-tournament-action">
            <span>
              {isFull
                ? "View Tournament (Full)"
                : timeLeft && timeLeft.expired
                ? "View Tournament (Closed)"
                : `View & Register (${slotsRemaining} Left)`}
            </span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
