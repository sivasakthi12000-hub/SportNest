import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { registerTeam } from "../services/dataService";
import "../styles/forms.css";

const RegisterTeam = () => {
  const { tournamentId } = useParams();
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState([{ id: 1, name: "", position: "Forward" }]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddPlayer = () => {
    const newPlayer = {
      id: Math.max(...players.map((p) => p.id), 0) + 1,
      name: "",
      position: "Forward",
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handlePlayerChange = (id, field, value) => {
    setError("");
    setPlayers(
      players.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamName.trim() === "" || players.some((p) => p.name.trim() === "")) {
      setError("Please fill in team name and all player names");
      return;
    }
    setLoading(true);
    const res = await registerTeam({
      name: teamName,
      tournamentId: Number(tournamentId),
      members: players.length,
      group: "A",
    });
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Failed to register team");
    }
  };

  if (submitted) {
    return (
      <div className="form-container">
        <div className="success-message">
          <h2>✓ Team Registered Successfully!</h2>
          <p className="team-name">{teamName}</p>
          <p className="player-count">{players.length} players registered</p>
          <div className="success-actions">
            <Link
              to={`/tournament/${tournamentId}/teams`}
              className="btn btn-primary"
            >
              View Teams
            </Link>
            <Link to={`/tournament/${tournamentId}`} className="btn btn-secondary">
              Back to Tournament
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Register Team</h1>
        <p>Tournament ID: {tournamentId}</p>
      </div>

      {error && (
        <div style={{ background: "rgba(220, 53, 69, 0.2)", border: "1px solid var(--danger)", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "4px", marginBottom: "1.5rem", textAlign: "center", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Team Information</legend>
          <div className="form-group">
            <label htmlFor="teamName">Team Name *</label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Players ({players.length})</legend>
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-row">
                <div className="form-group">
                  <label>Player Name *</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handlePlayerChange(player.id, "name", e.target.value)
                    }
                    placeholder="Player name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <select
                    value={player.position}
                    onChange={(e) =>
                      handlePlayerChange(player.id, "position", e.target.value)
                    }
                  >
                    <option>Forward</option>
                    <option>Midfielder</option>
                    <option>Defender</option>
                    <option>Goalkeeper</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(player.id)}
                  className="btn-remove"
                  disabled={players.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddPlayer}
            className="btn btn-add-player"
          >
            + Add Player
          </button>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Register Team
          </button>
          <Link
            to={`/tournament/${tournamentId}`}
            className="btn btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterTeam;
