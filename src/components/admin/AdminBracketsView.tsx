import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  RefreshCw,
  Award,
  CheckCircle2,
  ChevronRight,
  Users,
  Calendar,
  Clock,
  MapPin,
  Layers,
  Download,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Tournament, Team, getTeamsByTournamentId } from "../../services/dataService";
import {
  TournamentFormatType,
  ScheduledMatchFixture,
  generateTournamentSchedule,
} from "../../services/scheduleFeasibilityService";

interface AdminBracketsViewProps {
  tournaments: Tournament[];
}

export const AdminBracketsView: React.FC<AdminBracketsViewProps> = ({ tournaments }) => {
  const [selectedTourneyId, setSelectedTourneyId] = useState<number>(
    tournaments[0]?.id || 1
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormatType>(
    "Single Elimination (Knockout)"
  );
  const [activeTab, setActiveTab] = useState<"bracket" | "fixtures" | "standings">("bracket");
  const [matchWinners, setMatchWinners] = useState<Record<string, string>>({});

  const selectedTourney = useMemo(
    () => tournaments.find((t) => t.id === selectedTourneyId) || tournaments[0],
    [tournaments, selectedTourneyId]
  );

  // Sync format with selected tournament's format
  useEffect(() => {
    if (selectedTourney?.format) {
      setSelectedFormat(selectedTourney.format as TournamentFormatType);
    }
  }, [selectedTourney]);

  const fetchTourneyTeams = async (id: number) => {
    setLoading(true);
    try {
      const data = await getTeamsByTournamentId(id);
      setTeams(data || []);
      setMatchWinners({});
    } catch (err) {
      console.error("Error fetching tournament teams for bracket:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTourneyId) {
      fetchTourneyTeams(selectedTourneyId);
    }
  }, [selectedTourneyId]);

  // Auto-generate realistic schedule & brackets based on format and confirmed teams
  const generatedSchedule = useMemo(() => {
    const confirmedList =
      teams.length > 0
        ? teams.map((t, idx) => ({ id: t.id, name: t.name || `Team ${idx + 1}` }))
        : Array.from({ length: selectedTourney?.maxTeams || 16 }, (_, i) => ({
            id: `seed-${i + 1}`,
            name: `Seed ${i + 1} (${selectedTourney?.name ? selectedTourney.name.slice(0, 3).toUpperCase() : "SPT"}-${i + 1})`,
          }));

    return generateTournamentSchedule(
      {
        teams: confirmedList.length,
        venues: selectedTourney?.venues || 2,
        durationDays: selectedTourney?.durationDays || 2,
        matchDurationMinutes: selectedTourney?.matchDurationMinutes || 60,
        playableHoursPerDay: selectedTourney?.playableHoursPerDay || 9,
        format: selectedFormat,
        numGroups: selectedTourney?.numGroups || 4,
        advancingPerGroup: selectedTourney?.advancingPerGroup || 2,
      },
      confirmedList,
      selectedTourney?.date
    );
  }, [selectedTourney, teams, selectedFormat]);

  const handleSetWinner = (matchId: string, teamName: string) => {
    setMatchWinners((prev) => ({
      ...prev,
      [matchId]: prev[matchId] === teamName ? "" : teamName,
    }));
  };

  const handleExportSchedule = () => {
    const headers = ["Match #", "Round", "Stage", "Team A", "Team B", "Date", "Time Slot", "Venue", "Status"];
    const rows = generatedSchedule.fixtures.map((f) => [
      f.matchNumber,
      f.roundName,
      f.stage,
      f.teamA?.name || "TBD",
      f.teamB?.name || "TBD",
      f.dateStr || "Day 1",
      f.timeSlot,
      f.venueName,
      matchWinners[f.id] ? `Winner: ${matchWinners[f.id]}` : f.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedTourney?.name || "Tournament"}_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group fixtures by stage/round for knockout view
  const knockoutRoundsGrouped = useMemo(() => {
    const map: Record<string, ScheduledMatchFixture[]> = {};
    generatedSchedule.fixtures.forEach((f) => {
      const key = f.roundName || "Round";
      if (!map[key]) map[key] = [];
      map[key].push(f);
    });
    return map;
  }, [generatedSchedule]);

  return (
    <div className="admin-view-container">
      {/* Top Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Tournament Brackets & Schedule Engine</h1>
          <p>
            Auto-generate elimination brackets, round-robin grids, and multi-venue match schedules
            from confirmed registered teams.
          </p>
        </div>

        <div className="admin-view-actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Tournament Picker */}
          <select
            className="admin-status-select"
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(Number(e.target.value))}
            style={{ padding: "0.55rem 0.85rem", height: "40px", maxWidth: "260px" }}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.registeredTeams || 0} registered)
              </option>
            ))}
          </select>

          {/* Format Selector Dropdown */}
          <select
            className="admin-status-select"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as TournamentFormatType)}
            style={{
              padding: "0.55rem 0.85rem",
              height: "40px",
              background: "#ecfdf5",
              borderColor: "#10b981",
              color: "#065f46",
              fontWeight: 700,
            }}
          >
            <option value="Single Elimination (Knockout)">Single Elimination (Knockout)</option>
            <option value="Round Robin">Round Robin</option>
            <option value="Group Stage + Knockout">Group Stage + Knockout</option>
            <option value="Double Elimination">Double Elimination</option>
          </select>

          <button
            onClick={() => fetchTourneyTeams(selectedTourneyId)}
            className="admin-btn-secondary"
            title="Reload from Supabase"
            style={{ height: "40px" }}
          >
            <RefreshCw size={15} />
            <span>Reset Fixtures</span>
          </button>

          <button
            onClick={handleExportSchedule}
            className="admin-btn-primary"
            title="Export match fixtures to CSV"
            style={{ height: "40px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={15} />
            <span>Export Schedule</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, display: "block" }}>
            Format Structure
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
            {selectedFormat}
          </span>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, display: "block" }}>
            Total Generated Fixtures
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#059669" }}>
            {generatedSchedule.totalMatches} Matches Scheduled
          </span>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, display: "block" }}>
            Venues & Pitches
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0284c7" }}>
            {selectedTourney?.venues || 2} Playing Courts / Pitches
          </span>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, display: "block" }}>
            Teams Verified
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#d97706" }}>
            {teams.length} Confirmed Squads
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Visual Bracket vs Complete Fixtures Schedule vs Group Standings */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "1.5rem",
          paddingBottom: "0.25rem",
        }}
      >
        <button
          onClick={() => setActiveTab("bracket")}
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "8px 8px 0 0",
            border: "none",
            borderBottom: activeTab === "bracket" ? "3px solid #10b981" : "3px solid transparent",
            background: activeTab === "bracket" ? "#ecfdf5" : "transparent",
            color: activeTab === "bracket" ? "#065f46" : "#64748b",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Layers size={15} />
          <span>Interactive Bracket Tree</span>
        </button>

        <button
          onClick={() => setActiveTab("fixtures")}
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "8px 8px 0 0",
            border: "none",
            borderBottom: activeTab === "fixtures" ? "3px solid #10b981" : "3px solid transparent",
            background: activeTab === "fixtures" ? "#ecfdf5" : "transparent",
            color: activeTab === "fixtures" ? "#065f46" : "#64748b",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Calendar size={15} />
          <span>Complete Match Schedule ({generatedSchedule.totalMatches})</span>
        </button>

        {(selectedFormat === "Round Robin" || selectedFormat === "Group Stage + Knockout") && (
          <button
            onClick={() => setActiveTab("standings")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px 8px 0 0",
              border: "none",
              borderBottom: activeTab === "standings" ? "3px solid #10b981" : "3px solid transparent",
              background: activeTab === "standings" ? "#ecfdf5" : "transparent",
              color: activeTab === "standings" ? "#065f46" : "#64748b",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trophy size={15} />
            <span>Group Tables & Standings</span>
          </button>
        )}
      </div>

      {/* =====================================================================
          TAB 1: INTERACTIVE BRACKET TREE
          ===================================================================== */}
      {activeTab === "bracket" && (
        <div className="admin-data-card" style={{ overflowX: "auto", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                {selectedTourney?.name} — {selectedFormat}
              </h2>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Click a team name to pick winners and record progression in real-time
              </span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#059669",
                background: "#ecfdf5",
                padding: "0.3rem 0.65rem",
                borderRadius: "999px",
                border: "1px solid #a7f3d0",
              }}
            >
              ● Live Fixture Ladder
            </span>
          </div>

          {/* Knockout Columns */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "stretch",
              minWidth: "780px",
              padding: "1rem 0",
            }}
          >
            {Object.entries(knockoutRoundsGrouped).map(([roundName, roundFixtures], rIdx) => (
              <div
                key={roundName}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "220px",
                }}
              >
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "1rem",
                  }}
                >
                  {roundName}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    flex: 1,
                    gap: "1.25rem",
                  }}
                >
                  {roundFixtures.map((f) => {
                    const isWinnerA = matchWinners[f.id] === f.teamA?.name;
                    const isWinnerB = matchWinners[f.id] === f.teamB?.name;

                    return (
                      <div
                        key={f.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          overflow: "hidden",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Match Slot Header */}
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: "0.35rem 0.6rem",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.72rem",
                            color: "#64748b",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Match #{f.matchNumber}</span>
                          <span style={{ color: "#0284c7" }}>{f.venueName}</span>
                        </div>

                        {/* Team A */}
                        <div
                          onClick={() => f.teamA?.name && handleSetWinner(f.id, f.teamA.name)}
                          style={{
                            padding: "0.6rem 0.8rem",
                            borderBottom: "1px solid #f1f5f9",
                            background: isWinnerA ? "#ecfdf5" : "transparent",
                            color: isWinnerA ? "#047857" : "#1e293b",
                            fontWeight: isWinnerA ? 800 : 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.teamA?.name || "TBD"}
                          </span>
                          {isWinnerA && <CheckCircle2 size={15} color="#059669" />}
                        </div>

                        {/* Team B */}
                        <div
                          onClick={() => f.teamB?.name && handleSetWinner(f.id, f.teamB.name)}
                          style={{
                            padding: "0.6rem 0.8rem",
                            background: isWinnerB ? "#ecfdf5" : "transparent",
                            color: isWinnerB ? "#047857" : "#1e293b",
                            fontWeight: isWinnerB ? 800 : 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.teamB?.name || "TBD"}
                          </span>
                          {isWinnerB && <CheckCircle2 size={15} color="#059669" />}
                        </div>

                        {/* Time Slot Footer */}
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.7rem",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock size={11} />
                          <span>{f.timeSlot} &bull; {f.dateStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: COMPLETE FIXTURES SCHEDULE TABLE
          ===================================================================== */}
      {activeTab === "fixtures" && (
        <div className="admin-data-card" style={{ padding: "0" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              Sanctioned Match Schedule & Venue Allocation
            </h2>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Chronologically scheduled matches across {selectedTourney?.venues || 2} venues with buffer times
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Match #</th>
                  <th>Stage / Round</th>
                  <th>Matchup</th>
                  <th>Date & Time</th>
                  <th>Assigned Pitch / Venue</th>
                  <th>Status / Winner</th>
                </tr>
              </thead>
              <tbody>
                {generatedSchedule.fixtures.map((f) => {
                  const winner = matchWinners[f.id];
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 800, color: "#0f172a" }}>
                        #{f.matchNumber}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.55rem",
                            borderRadius: "6px",
                            background: f.stage === "final" ? "#fef3c7" : "#f1f5f9",
                            color: f.stage === "final" ? "#b45309" : "#334155",
                          }}
                        >
                          {f.roundName}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            onClick={() => f.teamA?.name && handleSetWinner(f.id, f.teamA.name)}
                            style={{
                              fontWeight: winner === f.teamA?.name ? 800 : 600,
                              color: winner === f.teamA?.name ? "#059669" : "#0f172a",
                              cursor: "pointer",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: winner === f.teamA?.name ? "#ecfdf5" : "transparent",
                            }}
                          >
                            {f.teamA?.name || "TBD"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>vs</span>
                          <span
                            onClick={() => f.teamB?.name && handleSetWinner(f.id, f.teamB.name)}
                            style={{
                              fontWeight: winner === f.teamB?.name ? 800 : 600,
                              color: winner === f.teamB?.name ? "#059669" : "#0f172a",
                              cursor: "pointer",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: winner === f.teamB?.name ? "#ecfdf5" : "transparent",
                            }}
                          >
                            {f.teamB?.name || "TBD"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                            {f.dateStr || "Day 1"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {f.timeSlot}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#0284c7",
                            background: "#f0f9ff",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                          }}
                        >
                          <MapPin size={12} />
                          {f.venueName}
                        </span>
                      </td>
                      <td>
                        {winner ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#059669",
                              background: "#ecfdf5",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "6px",
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Won by {winner}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            Scheduled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: GROUP TABLES & STANDINGS
          ===================================================================== */}
      {activeTab === "standings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {generatedSchedule.groups ? (
            Object.entries(generatedSchedule.groups).map(([groupName, gTeams]) => (
              <div key={groupName} className="admin-data-card" style={{ padding: "0" }}>
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                    {groupName} Standings
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                    Top {selectedTourney?.advancingPerGroup || 2} advance to Knockouts
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>Pos</th>
                        <th>Team</th>
                        <th style={{ textAlign: "center" }}>P</th>
                        <th style={{ textAlign: "center" }}>W</th>
                        <th style={{ textAlign: "center" }}>D</th>
                        <th style={{ textAlign: "center" }}>L</th>
                        <th style={{ textAlign: "center" }}>Pts</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gTeams.map((t, idx) => {
                        const advancingLimit = selectedTourney?.advancingPerGroup || 2;
                        const isAdvancing = idx < advancingLimit;

                        return (
                          <tr key={t.id} style={{ background: isAdvancing ? "#f0fdf4" : "transparent" }}>
                            <td style={{ fontWeight: 800, color: isAdvancing ? "#059669" : "#64748b" }}>
                              {idx + 1}
                            </td>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>
                              {t.name}
                            </td>
                            <td style={{ textAlign: "center" }}>0</td>
                            <td style={{ textAlign: "center" }}>0</td>
                            <td style={{ textAlign: "center" }}>0</td>
                            <td style={{ textAlign: "center" }}>0</td>
                            <td style={{ textAlign: "center", fontWeight: 800, color: "#0f172a" }}>0</td>
                            <td>
                              {isAdvancing ? (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#059669",
                                    background: "#dcfce7",
                                    padding: "0.2rem 0.5rem",
                                    borderRadius: "4px",
                                  }}
                                >
                                  Knockout Qualified
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                  In Group
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-data-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "#64748b", margin: 0 }}>
                Standings table is generated for Round Robin and Group Stage + Knockout formats.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBracketsView;
