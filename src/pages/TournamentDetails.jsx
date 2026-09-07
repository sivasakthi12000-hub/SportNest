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

  const groupA = teams.slice(0, 8);
  const groupB = teams.slice(8, 16);

  // Hardcoded points for league stage (assuming 7 matches each, win=2 points)
  const generatePointsTable = (groupTeams) => {
    const points = [
      { name: groupTeams[0]?.name || "TBD", played: 7, won: 5, lost: 2, points: 10 },
      { name: groupTeams[1]?.name || "TBD", played: 7, won: 4, lost: 3, points: 8 },
      { name: groupTeams[2]?.name || "TBD", played: 7, won: 4, lost: 3, points: 8 },
      { name: groupTeams[3]?.name || "TBD", played: 7, won: 4, lost: 3, points: 8 },
      { name: groupTeams[4]?.name || "TBD", played: 7, won: 3, lost: 4, points: 6 },
      { name: groupTeams[5]?.name || "TBD", played: 7, won: 3, lost: 4, points: 6 },
      { name: groupTeams[6]?.name || "TBD", played: 7, won: 3, lost: 4, points: 6 },
      { name: groupTeams[7]?.name || "TBD", played: 7, won: 2, lost: 5, points: 4 },
    ];
    return points.filter((p) => p.name !== "TBD");
  };

  const groupAPoints = generatePointsTable(groupA);
  const groupBPoints = generatePointsTable(groupB);
  const sortedGroupA = groupAPoints.sort((a, b) => b.points - a.points);
  const sortedGroupB = groupBPoints.sort((a, b) => b.points - a.points);

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
        <div className="groups-grid">
          <div className="group">
            <h3>Group A</h3>
            <ul>
              {groupA.map((team) => (
                <li key={team.id}>{team.name}</li>
              ))}
            </ul>
          </div>
          <div className="group">
            <h3>Group B</h3>
            <ul>
              {groupB.map((team) => (
                <li key={team.id}>{team.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="points-stage">
        <h2>Points Table</h2>
        <div className="points-tables">
          <div className="points-table">
            <h4>Group A</h4>
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
                {sortedGroupA.map((team, index) => (
                  <tr key={index}>
                    <td>{team.name}</td>
                    <td>{team.played}</td>
                    <td>{team.won}</td>
                    <td>{team.lost}</td>
                    <td>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="points-table">
            <h4>Group B</h4>
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
                {sortedGroupB.map((team, index) => (
                  <tr key={index}>
                    <td>{team.name}</td>
                    <td>{team.played}</td>
                    <td>{team.won}</td>
                    <td>{team.lost}</td>
                    <td>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
