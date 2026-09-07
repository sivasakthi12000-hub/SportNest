import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTeamById, getTournamentById } from "../services/dataService";
import "../styles/teams.css";

const TeamProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const teamData = await getTeamById(Number(id));
      setTeam(teamData);
      if (teamData) {
        const tour = await getTournamentById(teamData.tournamentId);
        setTournament(tour);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="team-profile-container"><p>Loading team profile...</p></div>;
  if (!team) return <p className="not-found">Team not found</p>;

  // Generate sample player list based on members count
  const players = Array.from({ length: team.members }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    position: ["Forward", "Midfielder", "Defender", "Goalkeeper"][i % 4],
    jersey: i + 1,
  }));

  return (
    <div className="team-profile-container">
      <div className="team-header">
        <h1>{team.name}</h1>
        {tournament && (
          <p className="tournament-link">
            Tournament: <strong>{tournament.name}</strong>
          </p>
        )}
      </div>

      <div className="team-info-grid">
        <div className="info-card">
          <strong>Total Members</strong>
          <p className="info-value">{team.members}</p>
        </div>
        <div className="info-card">
          <strong>Status</strong>
          <p className="info-value">Registered</p>
        </div>
      </div>

      <div className="players-section">
        <h2>Team Members</h2>
        <div className="players-grid">
          {players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="jersey-number">{player.jersey}</div>
              <div className="player-info">
                <p className="player-name">{player.name}</p>
                <p className="player-position">{player.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-actions">
        <Link to={`/tournament/${team.tournamentId}/teams`} className="btn btn-secondary">
          Back to Teams
        </Link>
      </div>
    </div>
  );
};

export default TeamProfile;
