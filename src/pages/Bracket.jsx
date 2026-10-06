import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  Award,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Shield,
  Shuffle,
} from "lucide-react";
import { getTournamentById, getTeamsByTournamentId } from "../services/dataService";
import { generateTournamentSchedule } from "../services/scheduleFeasibilityService";
import "../styles/tournament.css";

const Bracket = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bracket");
  const [selectedFormat, setSelectedFormat] = useState("Single Elimination (Knockout)");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matchWinners, setMatchWinners] = useState({});

  const bracketRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [tour, teamList] = await Promise.all([
          getTournamentById(Number(tournamentId)),
          getTeamsByTournamentId(Number(tournamentId)),
        ]);
        setTournament(tour);
        const sorted = [...(teamList || [])].sort((a, b) => {
          if (a.group && b.group && a.group !== b.group) return a.group.localeCompare(b.group);
          return (a.id || 0) - (b.id || 0);
        });
        setTeams(sorted);
        if (tour?.format) {
          setSelectedFormat(tour.format);
        }
      } catch (err) {
        console.error("Error loading tournament details for bracket:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tournamentId]);

  const handleMouseDown = (e) => {
    if (!bracketRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - bracketRef.current.offsetLeft;
    scrollLeft.current = bracketRef.current.scrollLeft;
    bracketRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    if (!bracketRef.current) return;
    isDragging.current = false;
    bracketRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    if (!bracketRef.current) return;
    isDragging.current = false;
    bracketRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !bracketRef.current) return;
    e.preventDefault();
    const x = e.pageX - bracketRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    bracketRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Generate schedule and bracket tree based on confirmed teams or seeded placeholders
  const scheduleData = useMemo(() => {
    if (!tournament) return null;

    const maxCount = Number(tournament.maxTeams) || 16;
    const confirmedList =
      teams.length >= 2
        ? teams.map((t, idx) => ({ id: t.id, name: t.name || `Team ${idx + 1}` }))
        : Array.from({ length: maxCount }, (_, i) => ({
            id: `seed-${i + 1}`,
            name: `Seed ${i + 1} (${tournament.name ? tournament.name.slice(0, 3).toUpperCase() : "SPT"}-${i + 1})`,
          }));

    return generateTournamentSchedule(
      {
        teams: confirmedList.length,
        venues: tournament.venues || 2,
        durationDays: tournament.durationDays || 2,
        matchDurationMinutes: tournament.matchDurationMinutes || 60,
        playableHoursPerDay: tournament.playableHoursPerDay || 9,
        format: selectedFormat,
        numGroups: tournament.numGroups || 4,
        advancingPerGroup: tournament.advancingPerGroup || 2,
      },
      confirmedList,
      tournament.date
    );
  }, [tournament, teams, selectedFormat]);

  const handleToggleWinner = (matchId, teamName) => {
    setMatchWinners((prev) => ({
      ...prev,
      [matchId]: prev[matchId] === teamName ? "" : teamName,
    }));
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏆</div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading tournament bracket & match schedule...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ maxWidth: "800px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <h2>Tournament Not Found</h2>
        <p style={{ color: "#64748b" }}>The requested tournament schedule could not be loaded.</p>
        <Link to="/tournaments" style={{ color: "#10b981", fontWeight: 700 }}>
          &larr; Back to Tournaments
        </Link>
      </div>
    );
  }

  const isGroupFormat = selectedFormat === "Group Stage + Knockout";
  const isRoundRobin = selectedFormat === "Round Robin";

  return (
    <div style={{ maxWidth: "1400px", margin: "2rem auto 4rem", padding: "0 1.5rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "2rem",
          marginBottom: "1.75rem",
          boxShadow: "0 10px 30px rgba(6, 78, 59, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <Link
            to={`/tournament/${tournamentId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#a7f3d0",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Tournament Overview</span>
          </Link>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {selectedFormat}
                </span>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {teams.length} Confirmed / {tournament.maxTeams || 16} Max Teams
                </span>
              </div>

              <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: 800 }}>
                {tournament.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                  fontSize: "0.88rem",
                  color: "#d1fae5",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={16} color="#6ee7b7" />
                  {tournament.groundName || tournament.location || "Official Grounds"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={16} color="#6ee7b7" />
                  {tournament.durationDays || 2} Day(s) • {tournament.venues || 2} Pitches/Courts
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Clock size={16} color="#6ee7b7" />
                  {tournament.matchDurationMinutes || 60}m Match • {tournament.playableHoursPerDay || 9}h/day
                </span>
              </div>
            </div>

            {/* Format Switcher */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(6px)",
                padding: "0.85rem 1.15rem",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#a7f3d0",
                  marginBottom: "0.4rem",
                  textTransform: "uppercase",
                }}
              >
                Tournament Structure Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  padding: "0.45rem 0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <option value="Single Elimination (Knockout)">Single Elimination (Knockout)</option>
                <option value="Round Robin">Round Robin</option>
                <option value="Group Stage + Knockout">Group Stage + Knockout</option>
                <option value="Double Elimination">Double Elimination</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("bracket")}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "bracket" ? "#10b981" : "#f1f5f9",
            color: activeTab === "bracket" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.15s ease",
          }}
        >
          <Layers size={16} />
          <span>Bracket Tree & Knockout</span>
        </button>

        <button
          onClick={() => setActiveTab("fixtures")}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "fixtures" ? "#10b981" : "#f1f5f9",
            color: activeTab === "fixtures" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.15s ease",
          }}
        >
          <Calendar size={16} />
          <span>Match Fixtures & Venues ({scheduleData?.fixtures.length || 0})</span>
        </button>

        {(isGroupFormat || isRoundRobin) && (
          <button
            onClick={() => setActiveTab("standings")}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: activeTab === "standings" ? "#10b981" : "#f1f5f9",
              color: activeTab === "standings" ? "#ffffff" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <Trophy size={16} />
            <span>{isGroupFormat ? "Group Tables" : "Round Robin Standings"}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Bracket Tree */}
      {activeTab === "bracket" && (
        <div>
          {teams.length < 2 && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Sparkles size={18} color="#059669" />
                <span style={{ fontSize: "0.88rem", color: "#166534", fontWeight: 600 }}>
                  Showing projected bracket slots based on {tournament.maxTeams || 16} tournament capacity. Real team names fill in automatically as registrations are confirmed.
                </span>
              </div>
              <Link
                to={`/register/${tournamentId}`}
                style={{
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "0.45rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Register a Team
              </Link>
            </div>
          )}

          {/* Interactive Bracket Canvas */}
          <div
            ref={bracketRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "2rem",
              overflowX: "auto",
              cursor: "grab",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div style={{ display: "flex", gap: "3rem", minWidth: "max-content", alignItems: "center" }}>
              {(() => {
                const fixtures = scheduleData?.fixtures || [];
                const roundsMap = {};
                fixtures.forEach((f) => {
                  const rName = f.roundName || "Match";
                  if (!roundsMap[rName]) roundsMap[rName] = [];
                  roundsMap[rName].push(f);
                });

                const roundEntries = Object.entries(roundsMap);

                return roundEntries.map(([roundName, matches], rIdx) => (
                  <div key={roundName} style={{ display: "flex", flexDirection: "column", width: "260px" }}>
                    <div
                      style={{
                        textAlign: "center",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "0.55rem",
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        color: "#0f172a",
                        marginBottom: "1.25rem",
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
                      {matches.map((m) => {
                        const winner = matchWinners[m.id];
                        const isTeamAWinner = winner === m.teamA?.name;
                        const isTeamBWinner = winner === m.teamB?.name;

                        return (
                          <div
                            key={m.id}
                            style={{
                              background: "#ffffff",
                              borderRadius: "12px",
                              border: winner ? "2px solid #10b981" : "1px solid #e2e8f0",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                padding: "0.35rem 0.65rem",
                                background: "#f8fafc",
                                borderBottom: "1px solid #f1f5f9",
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.7rem",
                                color: "#64748b",
                                fontWeight: 700,
                              }}
                            >
                              <span>Match #{m.matchNumber}</span>
                              <span>{m.dateStr} • {m.venueName}</span>
                            </div>

                            {/* Team A */}
                            <div
                              onClick={() => m.teamA?.name && handleToggleWinner(m.id, m.teamA.name)}
                              style={{
                                padding: "0.6rem 0.75rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                background: isTeamAWinner ? "#ecfdf5" : "transparent",
                                fontWeight: isTeamAWinner ? 800 : 600,
                                color: isTeamAWinner ? "#065f46" : "#1e293b",
                                fontSize: "0.82rem",
                              }}
                              title="Click to select winner"
                            >
                              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {m.teamA?.name || "TBD"}
                              </span>
                              {isTeamAWinner && <CheckCircle2 size={14} color="#10b981" />}
                            </div>

                            {/* Team B */}
                            <div
                              onClick={() => m.teamB?.name && handleToggleWinner(m.id, m.teamB.name)}
                              style={{
                                padding: "0.6rem 0.75rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                background: isTeamBWinner ? "#ecfdf5" : "transparent",
                                fontWeight: isTeamBWinner ? 800 : 600,
                                color: isTeamBWinner ? "#065f46" : "#1e293b",
                                fontSize: "0.82rem",
                              }}
                              title="Click to select winner"
                            >
                              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {m.teamB?.name || "TBD"}
                              </span>
                              {isTeamBWinner && <CheckCircle2 size={14} color="#10b981" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Fixtures & Venues */}
      {activeTab === "fixtures" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Match #</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Round / Stage</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Matchup</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Day / Date</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Time Slot</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Venue / Court</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(scheduleData?.fixtures || []).map((f) => {
                  const winner = matchWinners[f.id];
                  return (
                    <tr
                      key={f.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: winner ? "#f0fdf4" : undefined,
                      }}
                    >
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#0f172a" }}>
                        #{f.matchNumber}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#334155" }}>
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {f.roundName}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: winner === f.teamA?.name ? 800 : 600, color: winner === f.teamA?.name ? "#059669" : "#1e293b" }}>
                            {f.teamA?.name || "TBD"}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>VS</span>
                          <span style={{ fontWeight: winner === f.teamB?.name ? 800 : 600, color: winner === f.teamB?.name ? "#059669" : "#1e293b" }}>
                            {f.teamB?.name || "TBD"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{f.dateStr}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>{f.timeSlot}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#047857", fontWeight: 600 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <MapPin size={13} />
                          {f.venueName}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {winner ? (
                          <span style={{ color: "#059669", fontWeight: 700, fontSize: "0.78rem" }}>
                            Winner: {winner}
                          </span>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Scheduled</span>
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

      {/* TAB 3: Group Standings */}
      {activeTab === "standings" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {(() => {
            const confirmedList =
              teams.length >= 2
                ? teams
                : Array.from({ length: tournament.maxTeams || 16 }, (_, i) => ({
                    id: `seed-${i + 1}`,
                    name: `Seed ${i + 1} (${tournament.name ? tournament.name.slice(0, 3).toUpperCase() : "SPT"}-${i + 1})`,
                  }));

            if (isRoundRobin) {
              return (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "1.5rem",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    Round Robin Points Table
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "0.6rem 0.8rem", color: "#475569" }}>Rank</th>
                        <th style={{ padding: "0.6rem 0.8rem", color: "#475569" }}>Team</th>
                        <th style={{ padding: "0.6rem 0.8rem", color: "#475569" }}>Played</th>
                        <th style={{ padding: "0.6rem 0.8rem", color: "#475569" }}>Won</th>
                        <th style={{ padding: "0.6rem 0.8rem", color: "#475569" }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedList.map((t, idx) => (
                        <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.6rem 0.8rem", fontWeight: 800 }}>#{idx + 1}</td>
                          <td style={{ padding: "0.6rem 0.8rem", fontWeight: 700, color: "#0f172a" }}>{t.name}</td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "#64748b" }}>0</td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "#64748b" }}>0</td>
                          <td style={{ padding: "0.6rem 0.8rem", fontWeight: 800, color: "#059669" }}>0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Group Stage
            const numGroups = tournament.numGroups || 4;
            const groups = {};
            for (let g = 0; g < numGroups; g++) {
              groups[`Group ${String.fromCharCode(65 + g)}`] = [];
            }
            confirmedList.forEach((t, idx) => {
              const gName = `Group ${String.fromCharCode(65 + (idx % numGroups))}`;
              groups[gName].push(t);
            });

            return Object.entries(groups).map(([groupName, gTeams]) => (
              <div
                key={groupName}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                    {groupName}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background: "#ecfdf5",
                      color: "#065f46",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    Top {tournament.advancingPerGroup || 2} advance
                  </span>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "0.5rem", color: "#475569" }}>Team</th>
                      <th style={{ padding: "0.5rem", color: "#475569", textAlign: "center" }}>P</th>
                      <th style={{ padding: "0.5rem", color: "#475569", textAlign: "center" }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gTeams.map((t, idx) => {
                      const isAdvancing = idx < (tournament.advancingPerGroup || 2);
                      return (
                        <tr
                          key={t.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: isAdvancing ? "#f0fdf4" : undefined,
                          }}
                        >
                          <td style={{ padding: "0.5rem", fontWeight: isAdvancing ? 700 : 500, color: isAdvancing ? "#065f46" : "#334155" }}>
                            {idx + 1}. {t.name}
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "center", color: "#64748b" }}>0</td>
                          <td style={{ padding: "0.5rem", textAlign: "center", fontWeight: 800, color: isAdvancing ? "#059669" : "#64748b" }}>
                            0
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default Bracket;
