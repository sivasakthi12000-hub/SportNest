import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Shield,
  Users,
  Calendar,
  Sparkles,
  ArrowLeft,
  Plus,
  Layers,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { getTeamById, getTournamentById } from "../services/dataService";
import TeamLockerRoom3D from "../components/TeamLockerRoom3D";
import { getTeamRoster, saveTeamCustomRoster } from "../utils/squadRosterService";
import "../styles/teams.css";

const TeamProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("3d"); // "3d" or "grid"
  const [roster, setRoster] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState("Forward / Attacker");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const teamData = await getTeamById(Number(id));
      setTeam(teamData);
      if (teamData) {
        const tour = await getTournamentById(teamData.tournamentId);
        setTournament(tour);
        const playerList = getTeamRoster(teamData, tour?.sportName || "Soccer");
        setRoster(playerList);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerNumber) return;

    const num = Number(newPlayerNumber);
    const nameParts = newPlayerName.trim().split(" ");
    const surname = nameParts[nameParts.length - 1].toUpperCase();

    const isGk = newPlayerRole.toLowerCase().includes("goalkeeper");
    const newPlayer = {
      id: `p_custom_${Date.now()}`,
      name: newPlayerName.trim(),
      jerseyName: surname,
      number: num,
      role: newPlayerRole,
      category: isGk ? "goalkeeper" : "forward",
      positionDetail: newPlayerRole,
      age: 22,
      dob: "12 May 2004",
      height: "180 cm",
      preferredFootOrHand: "Right Foot",
      hometown: "Chennai, TN",
      club: team.name,
      isCaptain: false,
      isGoalkeeper: isGk,
      status: "Starting Lineup",
      stats: {
        matches: 10,
        primaryLabel: "Goals / Runs",
        primaryValue: 5,
        secondaryLabel: "Assists",
        secondaryValue: 3,
        rating: 8.5,
      },
    };

    const updated = [newPlayer, ...roster];
    setRoster(updated);
    saveTeamCustomRoster(Number(id), updated);
    setShowAddModal(false);
    setNewPlayerName("");
    setNewPlayerNumber("");
  };

  if (loading) {
    return (
      <div className="team-profile-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Loading team profile & 3D locker room...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-profile-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p className="not-found">Team not found</p>
        <Link to="/tournaments" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Browse Tournaments
        </Link>
      </div>
    );
  }

  return (
    <div className="team-profile-container">
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Link
          to={team.tournamentId ? `/tournament/${team.tournamentId}/teams` : "/tournaments"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#64748b",
            fontSize: "0.88rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Teams</span>
        </Link>
        {tournament && (
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            · {tournament.name}
          </span>
        )}
      </div>

      {/* Team Header Strip */}
      <div className="team-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 0 0.4rem" }}>
              <span>{team.name}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.65rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#10b981",
                  borderRadius: "999px",
                  fontWeight: 700,
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                ✓ Official Registered Squad
              </span>
            </h1>
            {tournament && (
              <p className="tournament-link" style={{ margin: 0 }}>
                Participating in:{" "}
                <Link to={`/tournament/${tournament.id}`}>
                  <strong>{tournament.name}</strong>
                </Link>{" "}
                ({tournament.sportName || "Sports"})
              </p>
            )}
          </div>

          {/* View Mode Toggle & Add Player Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                display: "inline-flex",
                background: "var(--card-bg, #1e293b)",
                padding: "0.25rem",
                borderRadius: "10px",
                border: "1px solid var(--border-color, #334155)",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                style={{
                  background: viewMode === "3d" ? "#ef4444" : "transparent",
                  color: viewMode === "3d" ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s ease",
                }}
              >
                <Sparkles size={14} />
                <span>3D Locker Room</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  background: viewMode === "grid" ? "#ef4444" : "transparent",
                  color: viewMode === "grid" ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s ease",
                }}
              >
                <Layers size={14} />
                <span>Roster Grid</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.55rem 0.95rem",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Plus size={16} />
              <span>Add Player</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Meta Badges */}
      <div className="team-info-grid" style={{ marginBottom: "2rem" }}>
        <div className="info-card">
          <strong>Squad Size</strong>
          <p className="info-value">{roster.length || team.members || 11} Players</p>
        </div>
        <div className="info-card">
          <strong>Tournament Group</strong>
          <p className="info-value">Group {team.group || "A"}</p>
        </div>
        <div className="info-card">
          <strong>Registration Status</strong>
          <p className="info-value" style={{ color: "var(--pitch-green, #10b981)" }}>
            ✓ Verified
          </p>
        </div>
        <div className="info-card">
          <strong>Team Captain</strong>
          <p className="info-value">{team.captain || roster[1]?.name || "Assigned"}</p>
        </div>
      </div>

      {/* Primary Feature: Interactive 3D Locker Room Experience */}
      {viewMode === "3d" ? (
        <div style={{ marginBottom: "2.5rem" }}>
          <TeamLockerRoom3D
            team={team}
            tournament={tournament}
            sportName={tournament?.sportName || "Soccer"}
          />
        </div>
      ) : (
        /* Classic Roster Grid View */
        <div className="players-section" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Squad Roster ({roster.length} Players)</h2>
          </div>
          <div className="players-grid">
            {roster.map((player, idx) => (
              <div key={player.id || idx} className="player-card">
                <div className="jersey-number">{player.number || idx + 1}</div>
                <div className="player-info">
                  <p className="player-name">{player.name}</p>
                  <p className="player-position">
                    {player.role} · {player.height} · {player.hometown}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "460px",
              width: "100%",
              color: "#ffffff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: 800 }}>
              Add Squad Member to {team.name}
            </h3>
            <form onSubmit={handleAddPlayer} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Player Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kevin Diks"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Squad Jersey Number (1-99)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  placeholder="e.g. 2"
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Position / Role
                </label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#ffffff",
                  }}
                >
                  <option value="Goalkeeper (GK)">Goalkeeper (GK)</option>
                  <option value="Center Back (CB)">Center Back (CB)</option>
                  <option value="Full Back (RB/LB)">Full Back (RB/LB)</option>
                  <option value="Central Midfielder (CM)">Central Midfielder (CM)</option>
                  <option value="Winger (RW/LW)">Winger (RW/LW)</option>
                  <option value="Striker / Center Forward (ST)">Striker / Center Forward (ST)</option>
                  <option value="All-Rounder / Raider">All-Rounder / Raider</option>
                  <option value="Batter / Bowler">Batter / Bowler</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#334155",
                    border: "none",
                    color: "#e2e8f0",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#ef4444",
                    border: "none",
                    color: "#ffffff",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Add to Locker Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="profile-actions">
        <Link to={`/tournament/${team.tournamentId}/teams`} className="btn btn-secondary">
          Back to Teams
        </Link>
        {tournament && (
          <Link to={`/bracket/${tournament.id}`} className="btn btn-primary" style={{ marginLeft: "0.75rem" }}>
            View Tournament Bracket & Schedule
          </Link>
        )}
      </div>
    </div>
  );
};

export default TeamProfile;
