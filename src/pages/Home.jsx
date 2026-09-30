import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { getSports, getTournaments } from "../services/dataService";
import SportShowcaseHero from "../components/SportShowcaseHero";
import TournamentCard from "../components/TournamentCard";

const Home = () => {
  const [sports, setSports] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSports(), getTournaments()])
      .then(([sList, tList]) => {
        setSports(sList || []);
        setTournaments(tList || []);
      })
      .catch((err) => {
        console.warn("Home data fetch notice:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sportsMap = React.useMemo(() => {
    const map = {};
    sports.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sports]);

  const featuredTournaments = tournaments.slice(0, 6);

  return (
    <div className="home-showcase-container">
      <SportShowcaseHero sports={sports} showAllGroundsGrid={true} />

      {featuredTournaments.length > 0 && (
        <section
          style={{
            maxWidth: "1400px",
            margin: "2.5rem auto 4rem",
            padding: "0 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Trophy size={20} color="#10b981" />
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Live & Upcoming Tournaments
                </h2>
              </div>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
                Register your team or follow championship fixtures across sanctioned grounds
              </p>
            </div>

            <Link
              to="/tournaments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#10b981",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                background: "rgba(16, 185, 129, 0.08)",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <span>Explore All {tournaments.length} Tournaments</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {featuredTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                sportName={sportsMap[t.sportId] || "Sports"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
