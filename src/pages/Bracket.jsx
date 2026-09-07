import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getTournamentById, getTeamsByTournamentId } from "../services/dataService";
import "../styles/tournament.css";

const Bracket = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tour, teamList] = await Promise.all([
        getTournamentById(Number(tournamentId)),
        getTeamsByTournamentId(Number(tournamentId))
      ]);
      setTournament(tour);
      const sorted = [...teamList].sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        return a.id - b.id;
      });
      setTeams(sorted);
      setLoading(false);
    }
    loadData();
  }, [tournamentId]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const bracketRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - bracketRef.current.offsetLeft;
    scrollLeft.current = bracketRef.current.scrollLeft;
    bracketRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    bracketRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    bracketRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - bracketRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2; // scroll speed
    bracketRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (loading) {
    return (
      <div className="bracket-container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <p>Loading tournament bracket...</p>
      </div>
    );
  }

  if (!tournament) return <p className="not-found">Tournament not found</p>;

  // Build a full elimination bracket for the given teams.
  // Bracket size is the next power of two (e.g., 20 teams => 32 slots).
  const buildBracketRounds = (teamsList) => {
    const size = 2 ** Math.ceil(Math.log2(Math.max(2, teamsList.length)));
    const slots = [...teamsList, ...Array(size - teamsList.length).fill(null)];

    const rounds = [];

    // First round: pair adjacent slots.
    let currentMatches = [];
    for (let i = 0; i < slots.length; i += 2) {
      currentMatches.push({
        id: `R1-M${i / 2 + 1}`,
        team1: slots[i],
        team2: slots[i + 1],
      });
    }
    rounds.push(currentMatches);

    // Build remaining rounds as placeholders (winners of previous matches).
    let roundIndex = 2;
    while (currentMatches.length > 1) {
      const nextMatches = [];
      for (let i = 0; i < currentMatches.length; i += 2) {
        const matchA = currentMatches[i];
        const matchB = currentMatches[i + 1];
        nextMatches.push({
          id: `R${roundIndex}-M${i / 2 + 1}`,
          team1: { placeholder: `Winner of ${matchA.id}` },
          team2: { placeholder: `Winner of ${matchB.id}` },
        });
      }
      rounds.push(nextMatches);
      currentMatches = nextMatches;
      roundIndex += 1;
    }

    return rounds;
  };

  const bracketRounds = buildBracketRounds(teams);

  const getTeamLabel = (team) => {
    if (!team) return "Bye";
    if (team.placeholder) return team.placeholder;
    return team.name;
  };
  const handleSelectWinner = (matchTeam) => {
    setSelectedTeam(matchTeam?.id);
  };

  return (
    <div className="bracket-container">
      <div className="bracket-header">
        <div className="bracket-logo">
          <span className="bracket-logo-icon">🏆</span>
          <div>
            <h1>Tournament Bracket</h1>
            <p className="bracket-subtitle">{tournament.name}</p>
          </div>
        </div>
        <p className="bracket-info">Total Teams: {teams.length}</p>
      </div>

      {teams.length === 0 ? (
        <div className="no-bracket">
          <p>No teams registered yet. Register a team to start the bracket.</p>
          <Link to={`/register/${tournamentId}`} className="btn btn-primary">
            Register Team
          </Link>
        </div>
      ) : (
        <div
          className="bracket-content"
          ref={bracketRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {bracketRounds.map((round, idx) => {
            const roundSize = 2 ** (bracketRounds.length - idx);
            const roundName =
              roundSize === 2
                ? "Final"
                : roundSize === 4
                ? "Semi Finals"
                : roundSize === 8
                ? "Quarter Finals"
                : `Round of ${roundSize}`;

            return (
              <div key={idx} className="bracket-round">
                <h3 className="round-title">{roundName}</h3>
                <div className="round-matches">
                  {round.map((match) => (
                    <div key={match.id} className="match-card">
                      <div
                        className={`team ${
                          selectedTeam === match.team1?.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectWinner(match.team1)}
                      >
                        <span className="team-name">{getTeamLabel(match.team1)}</span>
                        <span className="team-wins">0</span>
                      </div>
                      <div className="vs">VS</div>
                      <div
                        className={`team ${
                          selectedTeam === match.team2?.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectWinner(match.team2)}
                      >
                        <span className="team-name">{getTeamLabel(match.team2)}</span>
                        <span className="team-wins">0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bracket-actions">
        <Link to={`/tournament/${tournamentId}/teams`} className="btn btn-secondary">
          View Teams
        </Link>
        <Link to={`/tournament/${tournamentId}`} className="btn btn-secondary">
          Back to Tournament
        </Link>
      </div>
    </div>
  );
};

export default Bracket;
