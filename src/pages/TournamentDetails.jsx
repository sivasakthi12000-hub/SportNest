import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTournamentById, getSports, getTeamsByTournamentId } from "../services/dataService";
import "../styles/tournament.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [sport, setSport] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const tour = await getTournamentById(Number(id));
      setTournament(tour);
      if (tour) {
        const [sportsList, teamsList] = await Promise.all([
          getSports(),
          getTeamsByTournamentId(Number(id))
        ]);
        const matchedSport = sportsList.find((s) => s.id === tour.sportId);
        setSport(matchedSport || null);
        setTeams(teamsList);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const groupA = teams.filter((t) => t.group === "A" || (!t.group && teams.indexOf(t) % 2 === 0));
  const groupB = teams.filter((t) => t.group === "B" || (!t.group && teams.indexOf(t) % 2 === 1));

  // Compute standings table directly from real Supabase team data
  const computeStandings = (groupTeams) => {
    return groupTeams.map((team) => {
      const played = Number(team.played) || 0;
      const won = Number(team.won) || 0;
      const lost = Number(team.lost) || 0;
      const points = Number(team.points) || (won * 2);
      return {
        id: team.id,
        name: team.name,
        played,
        won,
        lost,
        points,
      };
    }).sort((a, b) => b.points - a.points || b.won - a.won);
  };

  const sortedGroupA = computeStandings(groupA);
  const sortedGroupB = computeStandings(groupB);

  if (loading) {
    return (
      <div className="tournament-details-container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <p>Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) return <p className="not-found">Tournament not found</p>;

  return (
    <div className="tournament-details-container">
      <div className="tournament-details">
        <h1>{tournament.name}</h1>
        <div className="details-grid">
          <div className="detail-item">
            <strong>Sport:</strong>
            <p>{sport?.name || "Unknown"}</p>
          </div>
          <div className="detail-item">
            <strong>Date:</strong>
            <p>{tournament.date}</p>
          </div>
          <div className="detail-item">
            <strong>Location:</strong>
            <p>{tournament.location}</p>
          </div>
          <div className="detail-item">
            <strong>State:</strong>
            <p>{tournament.state}</p>
          </div>
          <div className="detail-item">
            <strong>District:</strong>
            <p>{tournament.district}</p>
          </div>
          <div className="detail-item">
            <strong>Ground Name:</strong>
            <p>{tournament.groundName}</p>
          </div>
          <div className="detail-item">
            <strong>Last Registration:</strong>
            <p>{tournament.lastRegistrationDate}</p>
          </div>
          <div className="detail-item">
            <strong>Entry Fee:</strong>
            <p>₹{tournament.entryFee}</p>
          </div>
          <div className="detail-item">
            <strong>Prize Amount:</strong>
            <p>₹{tournament.prizeAmount}</p>
          </div>
          <div className="detail-item">
            <strong>Max Teams:</strong>
            <p>{tournament.maxTeams}</p>
          </div>
          <div className="detail-item">
            <strong>Registered Teams:</strong>
            <p>{tournament.registeredTeams}</p>
          </div>
          <div className="detail-item">
            <strong>Status:</strong>
            <p className={`status-${tournament.status}`}>{tournament.status}</p>
          </div>
        </div>
        <div className="description-section">
          <h3>About</h3>
          <p>{tournament.description}</p>
        </div>
      </div>

      <div className="group-stage">
        <h2>Group Stage</h2>
        {teams.length === 0 ? (
          <div className="no-data-msg" style={{ padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>No teams registered yet. Be the first to register a team!</p>
          </div>
        ) : (
          <div className="groups-grid">
            <div className="group">
              <h3>Group A</h3>
              <ul>
                {groupA.length > 0 ? (
                  groupA.map((team) => (
                    <li key={team.id}><Link to={`/team/${team.id}`}>{team.name}</Link></li>
                  ))
                ) : (
                  <li style={{ color: "var(--text-muted)" }}>No teams assigned yet</li>
                )}
              </ul>
            </div>
            <div className="group">
              <h3>Group B</h3>
              <ul>
                {groupB.length > 0 ? (
                  groupB.map((team) => (
                    <li key={team.id}><Link to={`/team/${team.id}`}>{team.name}</Link></li>
                  ))
                ) : (
                  <li style={{ color: "var(--text-muted)" }}>No teams assigned yet</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="points-stage">
        <h2>Points Table</h2>
        {teams.length === 0 ? (
          <div className="no-data-msg" style={{ padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Standings will update live as teams register and play.</p>
          </div>
        ) : (
          <div className="points-tables">
            <div className="points-table">
              <h4>Group A Standings</h4>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Lost</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroupA.length > 0 ? (
                    sortedGroupA.map((team, index) => (
                      <tr key={index}>
                        <td><Link to={`/team/${team.id}`}>{team.name}</Link></td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.lost}</td>
                        <td><strong>{team.points}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No teams in Group A</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="points-table">
              <h4>Group B Standings</h4>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Lost</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroupB.length > 0 ? (
                    sortedGroupB.map((team, index) => (
                      <tr key={index}>
                        <td><Link to={`/team/${team.id}`}>{team.name}</Link></td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.lost}</td>
                        <td><strong>{team.points}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No teams in Group B</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="actions-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <Link to={`/tournament/${id}/teams`} className="btn btn-primary">
            View Teams
          </Link>
          <Link to={`/register/${id}`} className="btn btn-success">
            Register Team
          </Link>
          <Link to={`/bracket/${id}`} className="btn btn-info">
            View Bracket
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
