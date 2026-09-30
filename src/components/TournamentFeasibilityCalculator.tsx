import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  TournamentFormatType,
  FeasibilityInputs,
  FeasibilityResult,
  analyzeScheduleFeasibility,
} from "../services/scheduleFeasibilityService";

export interface TournamentFeasibilityCalculatorProps {
  teams: number;
  onTeamsChange: (val: number) => void;
  venues: number;
  onVenuesChange: (val: number) => void;
  durationDays: number;
  onDurationDaysChange: (val: number) => void;
  matchDurationMinutes: number;
  onMatchDurationMinutesChange: (val: number) => void;
  playableHoursPerDay: number;
  onPlayableHoursPerDayChange: (val: number) => void;
  format: TournamentFormatType;
  onFormatChange: (val: TournamentFormatType) => void;
  numGroups: number;
  onNumGroupsChange: (val: number) => void;
  advancingPerGroup: number;
  onAdvancingPerGroupChange: (val: number) => void;
  isRegisteredCount?: number;
}

export const TournamentFeasibilityCalculator: React.FC<TournamentFeasibilityCalculatorProps> = ({
  teams,
  onTeamsChange,
  venues,
  onVenuesChange,
  durationDays,
  onDurationDaysChange,
  matchDurationMinutes,
  onMatchDurationMinutesChange,
  playableHoursPerDay,
  onPlayableHoursPerDayChange,
  format,
  onFormatChange,
  numGroups,
  onNumGroupsChange,
  advancingPerGroup,
  onAdvancingPerGroupChange,
  isRegisteredCount,
}) => {
  const inputs: FeasibilityInputs = useMemo(
    () => ({
      teams: Math.max(2, teams || 2),
      venues: Math.max(1, venues || 1),
      durationDays: Math.max(1, durationDays || 1),
      matchDurationMinutes: Math.max(15, matchDurationMinutes || 60),
      playableHoursPerDay: Math.max(1, Math.min(24, playableHoursPerDay || 9)),
      format,
      numGroups: Math.max(2, numGroups || 4),
      advancingPerGroup: Math.max(1, advancingPerGroup || 2),
    }),
    [
      teams,
      venues,
      durationDays,
      matchDurationMinutes,
      playableHoursPerDay,
      format,
      numGroups,
      advancingPerGroup,
    ]
  );

  const result: FeasibilityResult = useMemo(
    () => analyzeScheduleFeasibility(inputs),
    [inputs]
  );

  return (
    <div
      className="feasibility-calculator-container"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "1.25rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        margin: "1rem 0",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "0.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#ecfdf5",
                color: "#059669",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TrendingUp size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
              Tournament Format Feasibility Check
            </h3>
          </div>
          <p style={{ margin: "0.25rem 0 0 2.25rem", fontSize: "0.78rem", color: "#64748b" }}>
            Live scheduling capacity engine verifying court availability, playable hours, and fixture counts
          </p>
        </div>

        {/* Live Feasible Status Badge */}
        <div>
          {result.isFeasible ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 800,
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)",
              }}
            >
              <CheckCircle2 size={15} color="#059669" />
              <span>Feasible &bull; Ready to Host</span>
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 800,
                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.15)",
              }}
            >
              <AlertTriangle size={15} color="#dc2626" />
              <span>Not Feasible &bull; Over Capacity</span>
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Core Tournament Parameters Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Field 1: Number of teams */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "0.35rem",
            }}
          >
            <Users size={14} color="#059669" />
            <span>Number of Teams *</span>
            {Boolean(isRegisteredCount && isRegisteredCount > 0) && (
              <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>
                ({isRegisteredCount} registered)
              </span>
            )}
          </label>
          <input
            type="number"
            min={2}
            max={128}
            value={teams}
            onChange={(e) => onTeamsChange(Math.max(2, Number(e.target.value)))}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#0f172a",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Field 2: Available venues/courts/pitches */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "0.35rem",
            }}
          >
            <MapPin size={14} color="#0284c7" />
            <span>Venues / Courts / Pitches *</span>
          </label>
          <input
            type="number"
            min={1}
            max={32}
            value={venues}
            onChange={(e) => onVenuesChange(Math.max(1, Number(e.target.value)))}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#0f172a",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Field 3: Duration in days */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "0.35rem",
            }}
          >
            <Calendar size={14} color="#d97706" />
            <span>Duration (Days) *</span>
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={durationDays}
            onChange={(e) => onDurationDaysChange(Math.max(1, Number(e.target.value)))}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#0f172a",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Field 4: Match duration (minutes) */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "0.35rem",
            }}
          >
            <Clock size={14} color="#7c3aed" />
            <span>Match Duration + Buffer (Min)</span>
          </label>
          <input
            type="number"
            min={15}
            max={300}
            step={5}
            value={matchDurationMinutes}
            onChange={(e) => onMatchDurationMinutesChange(Math.max(15, Number(e.target.value)))}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#0f172a",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Field 5: Playable hours per day */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "0.35rem",
            }}
          >
            <Clock size={14} color="#059669" />
            <span>Playable Hours / Day</span>
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={playableHoursPerDay}
            onChange={(e) => onPlayableHoursPerDayChange(Math.max(1, Math.min(24, Number(e.target.value))))}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#0f172a",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Row 2: Tournament Format Selector */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "1rem",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.4rem",
              }}
            >
              <Layers size={15} color="#059669" />
              <span>Format Selector *</span>
            </label>
            <select
              value={format}
              onChange={(e) => onFormatChange(e.target.value as TournamentFormatType)}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#0f172a",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="Single Elimination (Knockout)">Single Elimination (Knockout)</option>
              <option value="Round Robin">Round Robin</option>
              <option value="Group Stage + Knockout">Group Stage + Knockout</option>
              <option value="Double Elimination">Double Elimination</option>
            </select>
          </div>

          {/* Conditional Group Stage fields */}
          {format === "Group Stage + Knockout" && (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Number of Groups
                </label>
                <input
                  type="number"
                  min={2}
                  max={Math.max(2, Math.floor(teams / 2))}
                  value={numGroups}
                  onChange={(e) => onNumGroupsChange(Math.max(2, Number(e.target.value)))}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    background: "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Advancing / Group
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={advancingPerGroup}
                  onChange={(e) => onAdvancingPerGroupChange(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    background: "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Live Mathematical Feasibility Summary Card */}
      <div
        style={{
          background: result.isFeasible ? "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" : "linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)",
          border: `1.5px solid ${result.isFeasible ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>
                Matches Required
              </span>
              <span style={{ fontSize: "1.45rem", fontWeight: 900, color: "#0f172a" }}>
                {result.requiredMatches} <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b" }}>matches</span>
              </span>
            </div>

            <div style={{ height: "35px", width: "1px", background: "#e2e8f0" }} />

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>
                Matches Possible in Given Time & Venues
              </span>
              <span style={{ fontSize: "1.45rem", fontWeight: 900, color: result.isFeasible ? "#059669" : "#dc2626" }}>
                {result.capacity} <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b" }}>matches capacity</span>
              </span>
            </div>

            <div style={{ height: "35px", width: "1px", background: "#e2e8f0" }} />

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>
                Daily Throughput
              </span>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#334155" }}>
                {result.matchesPerVenuePerDay} matches / venue / day
              </span>
            </div>
          </div>

          <div>
            {result.isFeasible ? (
              <span
                style={{
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Feasible ✓</span>
              </span>
            ) : (
              <span
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Not feasible — {result.requiredMatches} matches needed but only {result.capacity} possible</span>
              </span>
            )}
          </div>
        </div>

        {/* Capacity Utilization Progress Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#64748b", marginBottom: "4px" }}>
            <span>Venue Scheduling Utilization</span>
            <span style={{ fontWeight: 700, color: result.isFeasible ? "#059669" : "#dc2626" }}>
              {result.utilizationPercent}% of maximum slot capacity
            </span>
          </div>
          <div style={{ width: "100%", height: "7px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(100, result.utilizationPercent)}%`,
                height: "100%",
                background: result.isFeasible ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #ef4444, #dc2626)",
                borderRadius: "999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Actionable Suggestions & Dynamic Format Switcher */}
        {!result.isFeasible && (
          <div
            style={{
              marginTop: "0.5rem",
              background: "#fff",
              border: "1px dashed #fca5a5",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Lightbulb size={16} color="#d97706" />
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#991b1b" }}>
                Suggested Solutions to Fit Your Schedule:
              </span>
            </div>

            <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>
              {result.suggestions.map((sug, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>
                  {sug}
                </li>
              ))}
            </ul>

            {/* Quick Format Switcher Comparison Grid */}
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Compare Alternate Formats for {teams} Teams (Capacity: {result.capacity} matches):
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {result.comparisons.map((c) => (
                  <button
                    key={c.format}
                    type="button"
                    onClick={() => onFormatChange(c.format)}
                    style={{
                      padding: "0.35rem 0.65rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: c.format === format ? "1.5px solid #059669" : "1px solid #cbd5e1",
                      background: c.isFeasible ? "#f0fdf4" : "#fef2f2",
                      color: c.isFeasible ? "#15803d" : "#b91c1c",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{c.format}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>({c.requiredMatches} matches)</span>
                    {c.isFeasible ? (
                      <span style={{ color: "#16a34a" }}>✓</span>
                    ) : (
                      <span style={{ color: "#dc2626" }}>✗</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
