import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Users, Trophy, Shield, Activity } from "lucide-react";
import { getTournaments } from "../services/dataService";
import { getSportCinematicMeta } from "../data/sportCinematicData";
import "../styles/sport-showcase.css";

export interface SportItem {
  id: number;
  name: string;
  image?: string;
  imageUrl?: string;
  bannerUrl?: string;
  groundName?: string;
  surface?: string;
  format?: string;
  category?: string;
  rules?: string;
  description?: string;
}

interface SportShowcaseHeroProps {
  sports: SportItem[];
  showAllGroundsGrid?: boolean;
}

export const SportShowcaseHero: React.FC<SportShowcaseHeroProps> = ({
  sports,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [tournamentStats, setTournamentStats] = useState<
    Record<number, { count: number; prize: number; teams: number }>
  >({});
  const carouselRef = useRef<HTMLDivElement>(null);

  // Live time for the top-right live TV badge (matching the Sky TV interface clock)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real tournament stats directly from Supabase
  useEffect(() => {
    getTournaments().then((data) => {
      if (Array.isArray(data)) {
        const stats: Record<number, { count: number; prize: number; teams: number }> = {};
        data.forEach((t) => {
          const sId = Number(t.sportId);
          if (!stats[sId]) {
            stats[sId] = { count: 0, prize: 0, teams: 0 };
          }
          stats[sId].count++;
          stats[sId].prize += Number(t.prizeAmount) || 0;
          stats[sId].teams += Number(t.registeredTeams) || 0;
        });
        setTournamentStats(stats);
      }
    });
  }, []);

  const displaySports = sports && sports.length > 0 ? sports : [];

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  const handleSelectSport = (index: number) => {
    setCurrentIndex(index);
    // Scroll the selected card into view in the carousel
    if (carouselRef.current) {
      const card = carouselRef.current.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  if (displaySports.length === 0) {
    return (
      <div className="cinematic-tv-container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", background: "rgba(15, 23, 42, 0.8)", padding: "2.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="live-pulse-indicator" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "#f8fafc" }}>
            Loading ArenaSync Sports...
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Connecting to live Supabase database for sports, grounds, and tournament schedules.
          </p>
        </div>
      </div>
    );
  }

  const activeSport = displaySports[currentIndex] || displaySports[0];
  const customImg = activeSport.bannerUrl || activeSport.imageUrl || activeSport.image;
  const cinematicMeta = getSportCinematicMeta(activeSport.name, customImg);
  const stats = tournamentStats[activeSport.id] || { count: 0, prize: 0, teams: 0 };
  const sportDescription = activeSport.description || cinematicMeta.synopsis;

  return (
    <div className="cinematic-tv-container">
      {/* =====================================================================
          TOP CINEMATIC HERO BANNER (Matches Sky TV / Streaming Header Layout)
          ===================================================================== */}
      <section className="cinematic-hero-banner" aria-label={`${activeSport.name} Featured Showcase`}>
        {/* Backdrop Image Container */}
        <div className="hero-backdrop-container">
          <img
            key={`hero-backdrop-${activeSport.id}-${activeSport.name}`}
            src={cinematicMeta.bannerImage}
            alt={`${activeSport.name} Arena Backdrop`}
            className="hero-backdrop-img animating"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1800&auto=format&fit=crop";
            }}
          />
          {/* Gradient Vignettes to ensure high-contrast readability */}
          <div className="hero-gradient-overlay" />
          <div className="hero-bottom-vignette" />
        </div>

        {/* Top-Right Live Clock Badge (matches 12:25pm in reference photo) */}
        <div className="hero-live-clock-badge">
          <span className="live-pulse-indicator" />
          <span>LIVE ARENA</span>
          {currentTime && <span style={{ opacity: 0.6 }}>| {currentTime}</span>}
        </div>

        {/* Content Area on the Left */}
        <div className="hero-content-column">
          {/* Category Tag / Network Pill (like sky atlantic) */}
          <div className="hero-top-meta-row">
            <span className="hero-network-badge">
              <span className="network-badge-dot" />
              {cinematicMeta.badge}
            </span>
            <span className="hero-status-pill">
              <Activity size={13} style={{ color: "#10b981" }} />
              {stats.count > 0 ? `${stats.count} Tournaments Open` : "Sanctioned Season"}
            </span>
          </div>

          {/* Main Display Title */}
          <h1 className="hero-sport-title">{activeSport.name}</h1>

          {/* Engaging Synopsis */}
          <p className="hero-synopsis-text">{sportDescription}</p>

          {/* Technical Specs & Stats Chips */}
          <div className="hero-specs-row">
            <div className="hero-spec-chip">
              <Shield size={14} style={{ color: "#10b981" }} />
              <span>Surface: <strong>{activeSport.surface || cinematicMeta.surface}</strong></span>
            </div>
            <div className="hero-spec-chip">
              <Users size={14} style={{ color: "#38bdf8" }} />
              <span>Format: <strong>{activeSport.format || cinematicMeta.players}</strong></span>
            </div>
            {stats.prize > 0 && (
              <div className="hero-spec-chip">
                <Trophy size={14} style={{ color: "#fbbf24" }} />
                <span>Prize Pool: <strong>${stats.prize.toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="hero-action-buttons">
            <Link
              to={`/tournaments?sport=${activeSport.id}`}
              className="btn-hero-primary"
              id="hero-explore-tournaments-btn"
            >
              Explore Tournaments
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/add-tournament"
              className="btn-hero-secondary"
              id="hero-create-tournament-btn"
            >
              Host Tournament
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BOTTOM CAROUSEL FORMAT (Matches Unmissable TV Series Row in Photo)
          ===================================================================== */}
      <section className="sports-carousel-section" aria-label="Explore Sports Carousel">
        {/* Header with Title and Scroll Controls */}
        <div className="carousel-header-row">
          <div className="carousel-title-group">
            <h2 className="carousel-section-title">Explore Sports</h2>
            <span className="carousel-section-subtitle">
              {displaySports.length} disciplines available
            </span>
          </div>

          <div className="carousel-nav-controls">
            <button
              onClick={handleScrollLeft}
              className="carousel-arrow-btn"
              aria-label="Scroll sports carousel left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleScrollRight}
              className="carousel-arrow-btn"
              aria-label="Scroll sports carousel right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* The Horizontal Carousel Track */}
        <div className="carousel-scroll-track" ref={carouselRef}>
          {displaySports.map((sport, idx) => {
            const isActive = idx === currentIndex;
            const sCustomImg = sport.image || sport.imageUrl || sport.bannerUrl;
            const sMeta = getSportCinematicMeta(sport.name, sCustomImg);
            const sStats = tournamentStats[sport.id] || { count: 0, prize: 0, teams: 0 };

            return (
              <div
                key={sport.id}
                className={`sport-poster-card ${isActive ? "is-active" : ""}`}
                onClick={() => handleSelectSport(idx)}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectSport(idx);
                  }
                }}
              >
                {/* Poster Image */}
                <img
                  src={sMeta.posterImage}
                  alt={`${sport.name} Poster`}
                  className="poster-bg-img"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop";
                  }}
                />

                {/* Gradient shade for bottom text readability */}
                <div className="poster-gradient-shade" />

                {/* Top Badge (Like Sky Atlantic / BBC iPlayer in reference) */}
                <div className="poster-top-tag-wrap">
                  <span className="poster-network-tag">
                    {sport.surface ? sport.surface.split(" ")[0] : sMeta.surface.split(" ")[0]}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 8px #10b981",
                      }}
                    />
                  )}
                </div>

                {/* Bottom Title & Meta (Like 'SUCCESSION', 'GAME OF THRONES') */}
                <div className="poster-bottom-info">
                  <h3 className="poster-sport-name">{sport.name}</h3>
                  <div className="poster-sub-meta">
                    <span>{sMeta.players}</span>
                    <span className="poster-tournament-count">
                      {sStats.count > 0 ? `${sStats.count} Events` : "Open League"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SportShowcaseHero;
