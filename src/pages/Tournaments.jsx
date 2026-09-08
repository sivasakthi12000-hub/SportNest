import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getTournaments, getSports } from "../services/dataService";
import { getRealSportGround } from "../data/sportGroundImages";
import TournamentCard from "../components/TournamentCard";
import "../styles/tournament.css";

const Tournaments = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sportFilter = params.get("sport");
  const [timeFilter, setTimeFilter] = useState("all"); // all, future, post
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTournaments(), getSports()]).then(([tList, sList]) => {
      setTournaments(tList);
      setSports(sList);
      setLoading(false);
    });
  }, []);

  // Get background image for selected sport
  const getSportBackground = (sportId) => {
    if (!sportId) return null;
    const currentSport = sports.find((s) => Number(s.id) === Number(sportId));
    return getRealSportGround(
      currentSport ? currentSport.name : sportId,
      currentSport?.image || currentSport?.imageUrl
    ).groundImage;
  };

  // Filter by sport
  const sportFiltered = sportFilter
    ? tournaments.filter((t) => t.sportId === Number(sportFilter))
    : tournaments;

  // Filter by time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = sportFiltered.filter((t) => {
    const tournamentDate = new Date(t.date);
    tournamentDate.setHours(0, 0, 0, 0);

    if (timeFilter === "future") {
      return tournamentDate >= today;
    } else if (timeFilter === "post") {
      return tournamentDate < today;
    }
    return true; // "all"
  });

  const backgroundImage = getSportBackground(Number(sportFilter));

  return (
    <div
      className="tournaments-container"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      {/* Overlay for better text readability */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            zIndex: 1
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1>Tournaments</h1>
        {sportFilter && (
          <h2>
            Sport:{" "}
            {sports.find((s) => s.id === Number(sportFilter))?.name ||
              "Unknown"}
          </h2>
        )}

        <div className="filter-tabs">
          <button
            className={`filter-btn ${timeFilter === "all" ? "active" : ""}`}
            onClick={() => setTimeFilter("all")}
          >
            All Tournaments
          </button>
          <button
            className={`filter-btn ${timeFilter === "future" ? "active" : ""}`}
            onClick={() => setTimeFilter("future")}
          >
            Future Tournaments
          </button>
          <button
            className={`filter-btn ${timeFilter === "post" ? "active" : ""}`}
            onClick={() => setTimeFilter("post")}
          >
            Post Tournaments
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p>Loading tournaments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p>No tournaments found for this filter.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filtered.map((t) => {
              const sport = sports.find((s) => s.id === t.sportId);
              return (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  sportName={sport?.name || "Unknown"}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
