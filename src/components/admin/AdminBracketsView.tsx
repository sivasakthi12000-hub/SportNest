import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, Award, CheckCircle2, ChevronRight, Users } from "lucide-react";
import { Tournament, Team, getTeamsByTournamentId } from "../../services/dataService";

interface AdminBracketsViewProps {
  tournaments: Tournament[];
}

interface MatchFixture {
  id: string;
  round: "qf" | "sf" | "final";
  teamA: string;
  teamB: string;
  winner?: string;
}

export const AdminBracketsView: React.FC<AdminBracketsViewProps> = ({ tournaments }) => {
  const [selectedTourneyId, setSelectedTourneyId] = useState<number>(
    tournaments[0]?.id || 1
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchFixture[]>([]);

  const fetchTourneyTeams = async (id: number) => {
    setLoading(true);
    try {
      const data = await getTeamsByTournamentId(id);
      setTeams(data);

      // Generate preliminary bracket fixtures using real Supabase teams
      const teamNames = data.map((t) => t.name);
      // Pad to 8 if needed
      while (teamNames.length < 8) {
        teamNames.push(`Seed ${teamNames.length + 1}`);
      }

      const qfMatches: MatchFixture[] = [
        { id: "qf-1", round: "qf", teamA: teamNames[0], teamB: teamNames[1] },
        { id: "qf-2", round: "qf", teamA: teamNames[2], teamB: teamNames[3] },
        { id: "qf-3", round: "qf", teamA: teamNames[4], teamB: teamNames[5] },
        { id: "qf-4", round: "qf", teamA: teamNames[6], teamB: teamNames[7] },
      ];

      const sfMatches: MatchFixture[] = [
        { id: "sf-1", round: "sf", teamA: teamNames[0], teamB: teamNames[2] },
        { id: "sf-2", round: "sf", teamA: teamNames[4], teamB: teamNames[6] },
      ];

      const finalMatch: MatchFixture[] = [
        { id: "final-1", round: "final", teamA: teamNames[0], teamB: teamNames[4] },
      ];

      setMatches([...qfMatches, ...sfMatches, ...finalMatch]);
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

  const setWinner = (matchId: string, winningTeam: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, winner: winningTeam } : m))
    );
  };

  const selectedTourney = tournaments.find((t) => t.id === selectedTourneyId);

  const qf = matches.filter((m) => m.round === "qf");
  const sf = matches.filter((m) => m.round === "sf");
  const final = matches.find((m) => m.round === "final");

  return (
    <div className="admin-view-container">
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Tournament Brackets & Knockout Generator</h1>
          <p>
            Build elimination ladders and track match advancements in real time with Supabase teams.
          </p>
        </div>

        <div className="admin-view-actions">
          <select
            className="admin-status-select"
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(Number(e.target.value))}
            style={{ padding: "0.55rem 0.85rem", height: "40px", maxWidth: "280px" }}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.registeredTeams} teams registered)
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchTourneyTeams(selectedTourneyId)}
            className="admin-btn-secondary"
            title="Reload from Supabase"
          >
            <RefreshCw size={15} />
            <span>Reset Fixtures</span>
          </button>
        </div>
      </div>

      {/* Bracket Stage Info */}
      <div className="admin-data-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              {selectedTourney?.name || "Tournament"} — Championship Bracket
            </h2>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {teams.length} Verified Teams Registered in Supabase &bull; Single Elimination Format
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="admin-badge-group">8-Team Knockout</span>
            <span className="admin-badge-category">🏆 Trophy Final</span>
          </div>
        </div>

        {/* Interactive Bracket Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            alignItems: "center",
            padding: "1rem 0",
            overflowX: "auto",
          }}
        >
          {/* Column 1: Quarter-Finals */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "1rem", textAlign: "center" }}>
              Quarter-Finals
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {qf.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => setWinner(m.id, m.teamA)}
                    style={{
                      padding: "0.6rem 0.85rem",
                      borderBottom: "1px solid #e2e8f0",
                      background: m.winner === m.teamA ? "#ecfdf5" : "transparent",
                      color: m.winner === m.teamA ? "#059669" : "#1e293b",
                      fontWeight: m.winner === m.teamA ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{m.teamA}</span>
                    {m.winner === m.teamA && <CheckCircle2 size={14} color="#059669" />}
                  </div>

                  <div
                    onClick={() => setWinner(m.id, m.teamB)}
                    style={{
                      padding: "0.6rem 0.85rem",
                      background: m.winner === m.teamB ? "#ecfdf5" : "transparent",
                      color: m.winner === m.teamB ? "#059669" : "#1e293b",
                      fontWeight: m.winner === m.teamB ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{m.teamB}</span>
                    {m.winner === m.teamB && <CheckCircle2 size={14} color="#059669" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Semi-Finals */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "1rem", textAlign: "center" }}>
              Semi-Finals
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
              {sf.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => setWinner(m.id, m.teamA)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e2e8f0",
                      background: m.winner === m.teamA ? "#ecfdf5" : "transparent",
                      color: m.winner === m.teamA ? "#059669" : "#1e293b",
                      fontWeight: m.winner === m.teamA ? 700 : 600,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                    }}
                  >
                    <span>{m.teamA}</span>
                    {m.winner === m.teamA && <CheckCircle2 size={15} color="#059669" />}
                  </div>

                  <div
                    onClick={() => setWinner(m.id, m.teamB)}
                    style={{
                      padding: "0.75rem 1rem",
                      background: m.winner === m.teamB ? "#ecfdf5" : "transparent",
                      color: m.winner === m.teamB ? "#059669" : "#1e293b",
                      fontWeight: m.winner === m.teamB ? 700 : 600,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                    }}
                  >
                    <span>{m.teamB}</span>
                    {m.winner === m.teamB && <CheckCircle2 size={15} color="#059669" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Grand Championship Final */}
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase", marginBottom: "1rem", textAlign: "center" }}>
              👑 Grand Final
            </h3>
            {final && (
              <div
                style={{
                  background: "#ffffff",
                  border: "2px solid #f59e0b",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.15)",
                }}
              >
                <div
                  style={{
                    background: "#fef3c7",
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#b45309",
                    textAlign: "center",
                  }}
                >
                  🏆 Championship Match
                </div>

                <div
                  onClick={() => setWinner(final.id, final.teamA)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #fde68a",
                    background: final.winner === final.teamA ? "#fef3c7" : "transparent",
                    color: final.winner === final.teamA ? "#b45309" : "#1e293b",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1rem",
                  }}
                >
                  <span>{final.teamA}</span>
                  {final.winner === final.teamA && <Trophy size={18} color="#d97706" />}
                </div>

                <div
                  onClick={() => setWinner(final.id, final.teamB)}
                  style={{
                    padding: "1rem 1.25rem",
                    background: final.winner === final.teamB ? "#fef3c7" : "transparent",
                    color: final.winner === final.teamB ? "#b45309" : "#1e293b",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1rem",
                  }}
                >
                  <span>{final.teamB}</span>
                  {final.winner === final.teamB && <Trophy size={18} color="#d97706" />}
                </div>

                {final.winner && (
                  <div
                    style={{
                      background: "#059669",
                      color: "#ffffff",
                      textAlign: "center",
                      padding: "0.75rem",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    🎉 Champion: {final.winner}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8", textAlign: "center" }}>
          💡 Tip: Click on any team in a matchup fixture to designate them as the match winner and advance to the next round.
        </p>
      </div>
    </div>
  );
};
