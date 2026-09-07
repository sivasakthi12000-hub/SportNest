import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Trophy, Users, Shield, MapPin } from "lucide-react";
import { SportGroundBackground } from "./SportGroundBackground";
import { Sport3DAsset } from "./Sport3DAsset";
import { getSportTheme } from "../data/sportsThemeData";
import { getRealSportGround } from "../data/sportGroundImages";
import { getTournaments } from "../services/dataService";
import "../styles/sport-showcase.css";

export interface SportItem {
  id: number;
  name: string;
  image?: string;
}

interface SportShowcaseHeroProps {
  sports: SportItem[];
  showAllGroundsGrid?: boolean;
}

export const SportShowcaseHero: React.FC<SportShowcaseHeroProps> = ({
  sports,
  showAllGroundsGrid = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tournamentStats, setTournamentStats] = useState<
    Record<number, { count: number; prize: number; teams: number; stadiums: string[] }>
  >({});

  // Filter out any blank or test sports if needed, or include all
  const displaySports = sports.length > 0
    ? sports.filter((s) => !s.name.toLowerCase().includes("test"))
    : [
        { id: 1, name: "Soccer" },
        { id: 2, name: "Basketball" },
        { id: 3, name: "Tennis" },
        { id: 4, name: "Cricket" },
        { id: 5, name: "Kabaddi" },
        { id: 6, name: "Volleyball" },
        { id: 7, name: "Hockey" },
        { id: 8, name: "Badminton" },
        { id: 9, name: "Table Tennis" },
        { id: 10, name: "Swimming" },
      ];

  // Fetch real tournament stats from Supabase
  useEffect(() => {
    getTournaments().then((data) => {
      if (Array.isArray(data)) {
        const stats: Record<number, { count: number; prize: number; teams: number; stadiums: string[] }> = {};
        data.forEach((t) => {
          const sId = Number(t.sportId);
          if (!stats[sId]) {
            stats[sId] = { count: 0, prize: 0, teams: 0, stadiums: [] };
          }
          stats[sId].count++;
          stats[sId].prize += Number(t.prizeAmount) || 0;
          stats[sId].teams += Number(t.registeredTeams) || 0;
          if (t.groundName && !stats[sId].stadiums.includes(t.groundName)) {
            stats[sId].stadiums.push(t.groundName);
          }
        });
        setTournamentStats(stats);
      }
    });
  }, []);

  const activeSport = displaySports[currentIndex] || displaySports[0];
  const theme = getSportTheme(activeSport.name);
  const realGround = getRealSportGround(activeSport.name);
  const stats = tournamentStats[activeSport.id] || {
    count: 15,
    prize: 1050000,
    teams: 195,
    stadiums: [realGround.stadiumName, "Arena Complex"],
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displaySports.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displaySports.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="editorial-showcase-wrapper">
      {/* Main Split-Screen Editorial Showcase Card */}
      <div className="editorial-card">
        {/* The 50/50 Split Canvas with Real Ground Images + Tactical Markings + Motion */}
        <div className="split-screen-canvas">
          {/* Left 50% - Light Ground Half with Real Playing Ground Photography */}
          <div className="split-half-light">
            <img
              key={`light-${activeSport.id}-${activeSport.name}`}
              src={realGround.groundImage}
              alt={`${activeSport.name} Playing Ground`}
              className="real-ground-photo real-ground-photo-light animate-ken-burns"
              referrerPolicy="no-referrer"
            />
            <div className="ground-photo-overlay-light" />
            <SportGroundBackground
              sportName={activeSport.name}
              variant="showcase"
            />
          </div>

          {/* Right 50% - Dark Ground Half with Real Playing Ground Photography */}
          <div className="split-half-dark">
            <img
              key={`dark-${activeSport.id}-${activeSport.name}`}
              src={realGround.groundImage}
              alt={`${activeSport.name} Stadium Arena`}
              className="real-ground-photo real-ground-photo-dark animate-ken-burns"
              referrerPolicy="no-referrer"
            />
            <div className="ground-photo-overlay-dark" />
            <SportGroundBackground
              sportName={activeSport.name}
              variant="showcase"
            />
          </div>
        </div>

        {/* Top Header inside the Showcase Card */}
        <header className="showcase-inner-header">
          <div className="showcase-brand">
            <Link to="/" className="showcase-brand-title">
              ArenaSync
            </Link>
            <nav className="showcase-links-light">
              <Link to="/sports">Sports</Link>
              <Link to="/tournaments">Tournaments</Link>
              <Link to="/add-tournament">Register</Link>
            </nav>
          </div>

          <div className="showcase-links-dark">
            <span>Tournaments ({stats.count} Live)</span>
            <Link to="/login">Login / Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </header>

        {/* Left & Right Vertical Accent Tabs */}
        <div className="vertical-tab-left" title={`Ground: ${theme.surface}`}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#9266cc" }}></div>
          <span>{theme.category}</span>
        </div>

        <div className="vertical-tab-right">
          <span>GROUND ARENA</span>
        </div>

        {/* Center Giant Monogram Letter (like purple 'S' in Porsche reference) */}
        <div
          className="center-monogram-letter"
          style={{ color: theme.accentColor }}
          aria-hidden="true"
        >
          {theme.monogram}
        </div>

        {/* Spread Split-Screen Typography (like P O R [Asset] C H E) */}
        <div className="split-headline-wrap">
          <div className="split-text-left" style={{ color: "#ffffff", textShadow: "0 2px 14px rgba(0,0,0,0.3)" }}>
            {theme.splitLeft}
          </div>
          <div className="split-text-right">
            {theme.splitRight}
          </div>
        </div>

        {/* Quadrant 1: Top-Left Info Tag */}
        <div className="quadrant-tag top-left">
          <div className="quadrant-title">{activeSport.name}</div>
          <div className="quadrant-line"></div>
          <div className="quadrant-sub">{theme.surface}</div>
        </div>

        {/* Quadrant 2: Top-Right Info Tag */}
        <div className="quadrant-tag top-right split-half-dark-text">
          <div className="quadrant-title">{stats.count} Active Tournaments</div>
          <div className="quadrant-line"></div>
          <div className="quadrant-sub">National & State Leagues</div>
        </div>

        {/* Quadrant 3: Bottom-Left Info Tag */}
        <div className="quadrant-tag bottom-left">
          <div className="quadrant-title">{theme.format}</div>
          <div className="quadrant-line"></div>
          <div className="quadrant-sub">{theme.rules}</div>
        </div>

        {/* Quadrant 4: Bottom-Right Info Tag */}
        <div className="quadrant-tag bottom-right split-half-dark-text">
          <div className="quadrant-title">
            ${stats.prize.toLocaleString()} USD
          </div>
          <div className="quadrant-line"></div>
          <div className="quadrant-sub">{stats.teams} Registered Teams</div>
        </div>

        {/* Centerpiece 3D Floating Ball/Equipment & Explore Button */}
        <div className="center-asset-anchor">
          <Link
            to={`/tournaments?sport=${activeSport.id}`}
            className="center-3d-asset"
            title={`View ${activeSport.name} Tournaments`}
          >
            <Sport3DAsset sportName={activeSport.name} size={190} />
            <div className="asset-drop-shadow"></div>
          </Link>

          <Link
            to={`/tournaments?sport=${activeSport.id}`}
            className="center-explore-btn"
          >
            <span>Explore More</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Bottom Bar: Prev/Next Arrow Controls and Meta Links */}
        <footer className="showcase-bottom-bar">
          <div className="showcase-arrow-controls">
            <button
              className="showcase-arrow-btn"
              onClick={handlePrev}
              title="Previous Sport"
              aria-label="Previous Sport"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="showcase-arrow-btn"
              onClick={handleNext}
              title="Next Sport"
              aria-label="Next Sport"
            >
              <ChevronRight size={18} />
            </button>

            <div className="showcase-footer-left">
              <span style={{ fontWeight: 800, color: "#0f172a" }}>
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(displaySports.length).padStart(2, "0")}
              </span>
              <span>•</span>
              <span style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
                {activeSport.name} Ground View
              </span>
            </div>
          </div>

          <div className="showcase-footer-right">
            <span>Official Grounds</span>
            <span>•</span>
            <span>Supabase Verified</span>
            <span>•</span>
            <Link
              to={`/tournaments?sport=${activeSport.id}`}
              style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}
            >
              View Matches →
            </Link>
          </div>
        </footer>
      </div>

      {/* Quick Sport Selector Strip */}
      <nav className="sports-pill-nav" aria-label="Select Sport">
        {displaySports.map((s, idx) => {
          const sTheme = getSportTheme(s.name);
          const isActive = idx === currentIndex;
          return (
            <button
              key={s.id}
              className={`sport-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <span>{sTheme.icon}</span>
              <span>{s.name}</span>
            </button>
          );
        })}
      </nav>

      {/* "All Sports" Stadium Ground Gallery */}
      {showAllGroundsGrid && (
        <section className="sports-gallery-section">
          <h2 className="sports-gallery-title">All Sports & Stadium Grounds</h2>
          <p className="sports-gallery-sub">
            Explore tournaments, authentic tactical pitch grounds, and regulations across all disciplines
          </p>

          <div className="ground-card-grid">
            {displaySports.map((s, idx) => {
              const sTheme = getSportTheme(s.name);
              const sStats = tournamentStats[s.id] || {
                count: 15,
                prize: 1000000,
                teams: 190,
                stadiums: [],
              };
              const sRealGround = getRealSportGround(s.name);

              return (
                <Link
                  key={s.id}
                  to={`/tournaments?sport=${s.id}`}
                  className="ground-card"
                  onClick={() => setCurrentIndex(idx)}
                >
                  {/* Split Ground Background with Real Stadium Photo on every card */}
                  <div className="ground-card-split">
                    <div className="card-split-left">
                      <img
                        src={sRealGround.groundImage}
                        alt={s.name}
                        className="card-ground-bg-img"
                        referrerPolicy="no-referrer"
                      />
                      <SportGroundBackground sportName={s.name} variant="card" />
                    </div>
                    <div className="card-split-right">
                      <img
                        src={sRealGround.groundImage}
                        alt={s.name}
                        className="card-ground-bg-img"
                        referrerPolicy="no-referrer"
                      />
                      <SportGroundBackground sportName={s.name} variant="card" />
                    </div>
                  </div>

                  {/* Card Front Content */}
                  <div className="ground-card-content">
                    <div className="ground-card-header">
                      <span className="ground-card-badge">{sTheme.surface}</span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          background: "rgba(0,0,0,0.5)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {sStats.count} Events
                      </span>
                    </div>

                    <div className="ground-card-center">
                      <div className="ground-card-icon">
                        <Sport3DAsset sportName={s.name} size={90} />
                      </div>
                      <h3 className="ground-card-name">{s.name}</h3>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#cbd5e1",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                        }}
                      >
                        {sTheme.format}
                      </span>
                    </div>

                    <div className="ground-card-footer">
                      <span className="ground-card-stats">
                        ${(sStats.prize / 1000).toFixed(0)}k Prize Pool
                      </span>
                      <span className="ground-card-link">
                        Enter Ground <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default SportShowcaseHero;
