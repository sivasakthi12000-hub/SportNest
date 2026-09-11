import React, { useState, useEffect } from "react";
import { Clock, Calendar, Trophy, AlertCircle, Users, CheckCircle2, MapPin } from "lucide-react";
import { Tournament } from "../../services/dataService";

interface TournamentCountdownWidgetProps {
  tournaments: Tournament[];
  initialTournamentId?: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const TournamentCountdownWidget: React.FC<TournamentCountdownWidgetProps> = ({
  tournaments,
  initialTournamentId,
}) => {
  const [selectedId, setSelectedId] = useState<number>(
    initialTournamentId || tournaments[0]?.id || 1
  );

  const currentTourney =
    tournaments.find((t) => t.id === selectedId) || tournaments[0];

  const calculateTimeRemaining = (targetDateStr?: string): TimeRemaining => {
    if (!targetDateStr) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  const [matchCountdown, setMatchCountdown] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(currentTourney?.date)
  );

  const [registerCountdown, setRegisterCountdown] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(currentTourney?.lastRegistrationDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchCountdown(calculateTimeRemaining(currentTourney?.date));
      setRegisterCountdown(calculateTimeRemaining(currentTourney?.lastRegistrationDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTourney]);

  if (!currentTourney) return null;

  const maxTeams = currentTourney.maxTeams || 16;
  const registered = currentTourney.registeredTeams || 0;
  const slotsLeft = Math.max(0, maxTeams - registered);

  return (
    <div
      className="dash-panel-card"
      style={{
        marginBottom: "1.5rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}
      id="admin-tournament-countdown-card"
    >
      {/* Widget Header with Tournament Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "0.85rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
              Admin Tournament Countdown Clocks
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Live countdown to Kickoff Match Day & Registration Deadline (Admin Exclusive)
            </span>
          </div>
        </div>

        {tournaments.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Switch Tournament:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "#ffffff",
                color: "#0f172a",
                maxWidth: "240px",
              }}
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Two Countdown Displays Side-by-Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* CLOCK 1: MATCH DAY COUNTDOWN */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#059669", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                🏆 Match Day Kickoff
              </span>
              <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                {currentTourney.name}
              </h4>
            </div>

            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "0.2rem 0.55rem",
                borderRadius: "9999px",
                background: matchCountdown.isExpired ? "#f1f5f9" : "rgba(16, 185, 129, 0.12)",
                color: matchCountdown.isExpired ? "#64748b" : "#059669",
              }}
            >
              {matchCountdown.isExpired ? "Concluded" : "● Kicking Off Soon"}
            </span>
          </div>

          {/* Ticking Digits Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", margin: "0.85rem 0" }}>
            {[
              { label: "DAYS", val: matchCountdown.days },
              { label: "HOURS", val: matchCountdown.hours },
              { label: "MINS", val: matchCountdown.minutes },
              { label: "SECS", val: matchCountdown.seconds },
            ].map((box) => (
              <div
                key={box.label}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "0.6rem 0.3rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.35rem", fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {String(box.val).padStart(2, "0")}
                </div>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", marginTop: "2px" }}>
                  {box.label}
                </div>
              </div>
            ))}
          </div>

          {/* Location & Venue */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#64748b", marginTop: "0.5rem" }}>
            <MapPin size={14} color="#059669" />
            <span style={{ fontWeight: 600 }}>{currentTourney.groundName || "Main Arena"}, {currentTourney.location}</span>
            <span style={{ color: "#cbd5e1" }}>&bull;</span>
            <span>Date: {currentTourney.date ? new Date(currentTourney.date).toLocaleDateString() : "TBD"}</span>
          </div>
        </div>

        {/* CLOCK 2: LAST REGISTRATION DATE COUNTDOWN */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#d97706", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                ⏳ Registration Deadline
              </span>
              <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Team Entry Window
              </h4>
            </div>

            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "0.2rem 0.55rem",
                borderRadius: "9999px",
                background: registerCountdown.isExpired ? "#fee2e2" : "rgba(245, 158, 11, 0.12)",
                color: registerCountdown.isExpired ? "#b91c1c" : "#d97706",
              }}
            >
              {registerCountdown.isExpired ? "Closed" : "● Registrations Open"}
            </span>
          </div>

          {/* Ticking Digits Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", margin: "0.85rem 0" }}>
            {[
              { label: "DAYS", val: registerCountdown.days },
              { label: "HOURS", val: registerCountdown.hours },
              { label: "MINS", val: registerCountdown.minutes },
              { label: "SECS", val: registerCountdown.seconds },
            ].map((box) => (
              <div
                key={box.label}
                style={{
                  background: registerCountdown.isExpired ? "#475569" : "#1e293b",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "0.6rem 0.3rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.35rem", fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.05em", color: registerCountdown.isExpired ? "#cbd5e1" : "#f59e0b" }}>
                  {String(box.val).padStart(2, "0")}
                </div>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", marginTop: "2px" }}>
                  {box.label}
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Progress Bar */}
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
              <span style={{ color: "#64748b" }}>
                <strong>{registered}</strong> / {maxTeams} Teams Registered
              </span>
              <span style={{ fontWeight: 700, color: slotsLeft > 0 ? "#059669" : "#dc2626" }}>
                {slotsLeft > 0 ? `${slotsLeft} Slots Left` : "Tournament Full"}
              </span>
            </div>
            <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((registered / maxTeams) * 100))}%`,
                  height: "100%",
                  background: slotsLeft > 0 ? "#059669" : "#dc2626",
                  borderRadius: "9999px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
