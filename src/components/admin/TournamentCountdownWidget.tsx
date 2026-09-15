import React, { useState, useEffect } from "react";
import { Clock, Calendar, Trophy, AlertCircle, Users, CheckCircle2, MapPin, Settings2, Edit3, X, Check } from "lucide-react";
import { Tournament, updateTournamentDates } from "../../services/dataService";

interface TournamentCountdownWidgetProps {
  tournaments: Tournament[];
  initialTournamentId?: number;
  onRefresh?: () => void;
  canManage?: boolean;
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
  onRefresh,
  canManage = true,
}) => {
  const [selectedId, setSelectedId] = useState<number>(
    initialTournamentId || tournaments[0]?.id || 1
  );

  const currentTourney =
    tournaments.find((t) => t.id === selectedId) || tournaments[0];

  // Manage Dates Modal State
  const [showManageModal, setShowManageModal] = useState(false);
  const [editRegDate, setEditRegDate] = useState("");
  const [editMatchDate, setEditMatchDate] = useState("");
  const [savingDates, setSavingDates] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync date inputs when opening modal or changing tournament
  useEffect(() => {
    if (currentTourney) {
      setEditRegDate(
        currentTourney.lastRegistrationDate
          ? new Date(currentTourney.lastRegistrationDate).toISOString().split("T")[0]
          : ""
      );
      setEditMatchDate(
        currentTourney.date
          ? new Date(currentTourney.date).toISOString().split("T")[0]
          : ""
      );
    }
  }, [currentTourney, showManageModal]);

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
  const isTeamCapacityFull = registered >= maxTeams && maxTeams > 0;
  const slotsLeft = Math.max(0, maxTeams - registered);

  const handleSaveDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTourney) return;
    setSavingDates(true);
    setSaveSuccessMsg(null);

    try {
      const res = await updateTournamentDates(currentTourney.id, {
        lastRegistrationDate: editRegDate ? new Date(editRegDate).toISOString() : undefined,
        date: editMatchDate ? new Date(editMatchDate).toISOString() : undefined,
      });

      if (res.success) {
        setSaveSuccessMsg("Registration deadline and kickoff dates updated successfully!");
        if (onRefresh) onRefresh();
        setTimeout(() => {
          setShowManageModal(false);
          setSaveSuccessMsg(null);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Error updating tournament dates:", err);
    } finally {
      setSavingDates(false);
    }
  };

  return (
    <div
      className="dash-panel-card"
      style={{
        marginBottom: "1.5rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        padding: "1.35rem 1.5rem",
      }}
      id="admin-tournament-countdown-card"
    >
      {/* Widget Header with Tournament Switcher & Manage Dates Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.85rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
              Live Tournament Countdown Clocks
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Official countdown to Kickoff Match Day & Registration Deadline (Admin Configurable)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {tournaments.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b" }}>Tournament:</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                style={{
                  padding: "0.42rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: "#ffffff",
                  color: "#0f172a",
                  maxWidth: "250px",
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

          {canManage && (
            <button
              onClick={() => setShowManageModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #059669",
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Manage Registration Deadline & Match Date"
            >
              <Settings2 size={15} />
              <span>Manage Dates & Deadline</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Prominent Countdown Displays Side-by-Side (Bigger Digits as requested) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.35rem",
        }}
      >
        {/* CLOCK 1: MATCH DAY COUNTDOWN */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "1.35rem",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#059669", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                🏆 Match Day Kickoff
              </span>
              <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.12rem", fontWeight: 800, color: "#0f172a" }}>
                {currentTourney.name}
              </h4>
            </div>

            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
                background: matchCountdown.isExpired ? "#f1f5f9" : "rgba(16, 185, 129, 0.12)",
                color: matchCountdown.isExpired ? "#64748b" : "#059669",
              }}
            >
              {matchCountdown.isExpired ? "Concluded" : "● Kicking Off Soon"}
            </span>
          </div>

          {/* Large Monospace Digital Ticking Digits */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.6rem", margin: "1rem 0" }}>
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
                  borderRadius: "10px",
                  padding: "0.75rem 0.4rem",
                  textAlign: "center",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontSize: "1.85rem", fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.04em", color: "#34d399", lineHeight: 1.1 }}>
                  {String(box.val).padStart(2, "0")}
                </div>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "#94a3b8", marginTop: "4px", letterSpacing: "0.05em" }}>
                  {box.label}
                </div>
              </div>
            ))}
          </div>

          {/* Location & Venue */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", color: "#64748b", marginTop: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.65rem" }}>
            <MapPin size={15} color="#059669" />
            <span style={{ fontWeight: 600 }}>{currentTourney.groundName || "Main Arena"}, {currentTourney.location || "Sports Complex"}</span>
            <span style={{ color: "#cbd5e1" }}>&bull;</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              Date: {currentTourney.date ? new Date(currentTourney.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
            </span>
          </div>
        </div>

        {/* CLOCK 2: LAST REGISTRATION DATE COUNTDOWN (Hidden if capacity full as user requested) */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "1.35rem",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#d97706", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ⏳ Last Registration Date
              </span>
              <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.12rem", fontWeight: 800, color: "#0f172a" }}>
                Team Entry Window
              </h4>
            </div>

            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
                background: isTeamCapacityFull
                  ? "#fee2e2"
                  : registerCountdown.isExpired
                  ? "#fee2e2"
                  : "rgba(245, 158, 11, 0.12)",
                color: isTeamCapacityFull
                  ? "#b91c1c"
                  : registerCountdown.isExpired
                  ? "#b91c1c"
                  : "#d97706",
              }}
            >
              {isTeamCapacityFull
                ? "Full (Capacity Reached)"
                : registerCountdown.isExpired
                ? "Registration Closed"
                : "● Registrations Open"}
            </span>
          </div>

          {/* If Maximum Teams Allowed is full, user requested: DON'T show the timer! */}
          {isTeamCapacityFull ? (
            <div
              style={{
                margin: "1rem 0",
                padding: "1.4rem 1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#991b1b", marginBottom: "0.25rem" }}>
                🚫 Tournament Capacity Full ({registered}/{maxTeams} Teams)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#b91c1c" }}>
                All maximum team slots are occupied. Registration timer is automatically paused and hidden.
              </div>
            </div>
          ) : (
            /* Large Monospace Digital Ticking Digits */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.6rem", margin: "1rem 0" }}>
              {[
                { label: "DAYS", val: registerCountdown.days },
                { label: "HOURS", val: registerCountdown.hours },
                { label: "MINS", val: registerCountdown.minutes },
                { label: "SECS", val: registerCountdown.seconds },
              ].map((box) => (
                <div
                  key={box.label}
                  style={{
                    background: registerCountdown.isExpired ? "#334155" : "#1e293b",
                    color: "#ffffff",
                    borderRadius: "10px",
                    padding: "0.75rem 0.4rem",
                    textAlign: "center",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 900,
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                      color: registerCountdown.isExpired ? "#94a3b8" : "#fbbf24",
                      lineHeight: 1.1,
                    }}
                  >
                    {String(box.val).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "#94a3b8", marginTop: "4px", letterSpacing: "0.05em" }}>
                    {box.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Capacity Progress Bar & Last Date */}
          <div style={{ marginTop: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.65rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
              <span style={{ color: "#64748b" }}>
                <strong>{registered}</strong> / {maxTeams} Teams Registered
              </span>
              <span style={{ fontWeight: 700, color: slotsLeft > 0 ? "#059669" : "#dc2626" }}>
                {slotsLeft > 0 ? `${slotsLeft} Slots Left` : "Registration Full"}
              </span>
            </div>
            <div style={{ height: "7px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((registered / maxTeams) * 100))}%`,
                  height: "100%",
                  background: slotsLeft > 0 ? "#059669" : "#dc2626",
                  borderRadius: "9999px",
                }}
              />
            </div>
            <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "0.45rem", textAlign: "right" }}>
              Deadline:{" "}
              <strong>
                {currentTourney.lastRegistrationDate
                  ? new Date(currentTourney.lastRegistrationDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not Specified"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* MANAGE DATES MODAL (DOES NOT CLOSE ON OUTSIDE CLICK) */}
      {showManageModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: "520px" }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                  Manage Registration & Kickoff Dates
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {currentTourney.name} (ID #{currentTourney.id})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDates}>
              <div className="admin-modal-body">
                {saveSuccessMsg && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      background: "#ecfdf5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Check size={16} />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <div className="admin-form-group" style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.4rem" }}>
                    Last Registration Date (Deadline) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editRegDate}
                    onChange={(e) => setEditRegDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                  <span style={{ display: "block", fontSize: "0.74rem", color: "#64748b", marginTop: "0.3rem" }}>
                    Teams must submit registration before midnight of this date.
                  </span>
                </div>

                <div className="admin-form-group" style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.4rem" }}>
                    Tournament Match Day (Kickoff Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editMatchDate}
                    onChange={(e) => setEditMatchDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                  <span style={{ display: "block", fontSize: "0.74rem", color: "#64748b", marginTop: "0.3rem" }}>
                    Official first match start date on field.
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.78rem",
                    color: "#475569",
                  }}
                >
                  💡 <strong>Tip:</strong> Changes made here will update the live countdown timers across both the public tournament cards and your admin dashboard.
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowManageModal(false)}
                  className="admin-btn-secondary"
                  disabled={savingDates}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={savingDates}
                >
                  {savingDates ? "Saving to System..." : "Save & Update Timers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
