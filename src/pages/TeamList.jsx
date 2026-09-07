import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTeamsByTournamentId, getTournamentById } from "../services/dataService";
import TeamCard from "../components/TeamCard";
import "../styles/teams.css";

const TeamList = () => {
  const { id } = useParams();
  const [teams, setTeams] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tour, teamList] = await Promise.all([
        getTournamentById(Number(id)),
        getTeamsByTournamentId(Number(id)),
      ]);
      setTournament(tour);
      setTeams(teamList);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <p>Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>Registered Teams</h1>
        {tournament && <p className="tournament-ref">Tournament: <strong>{tournament.name}</strong></p>}
        <p className="team-count">Total Teams: <strong>{teams.length}</strong></p>
      </div>

      {teams.length > 0 ? (
        <div className="card-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="no-teams">
          <p>No teams registered yet.</p>
          <Link to={`/register/${id}`} className="btn btn-primary">
            Register a Team
          </Link>
        </div>
      )}
    </div>
  );
};

export default TeamList;
