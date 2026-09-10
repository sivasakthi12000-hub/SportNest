import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Users, Trophy, Shield, Activity, Sparkles, MapPin } from "lucide-react";
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

// All-sports panoramic arena backdrop image
const ALL_SPORTS_HERO_IMAGE =
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1920&auto=format&fit=crop";

export const SportShowcaseHero: React.FC<SportShowcaseHeroProps> = ({
  sports,
}) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [totalTournamentsCount, setTotalTournamentsCount] = useState(0);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [tournamentStats, setTournamentStats] = useState<
    Record<number, { count: number; prize: number; teams: number }>
  >({});
  const carouselRef = useRef<HTMLDivElement>(null);

  // Live clock badge
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
        setTotalTournamentsCount(data.length);
        const stats: Record<number, { count: number; prize: number; teams: number }> = {};
        let prizeSum = 0;
        data.forEach((t) => {
          const sId = Number(t.sportId);
          if (!stats[sId]) {
            stats[sId] = { count: 0, prize: 0, teams: 0 };
          }
          stats[sId].count++;
          const p = Number(t.prizeAmount) || 0;
          stats[sId].prize += p;
          prizeSum += p;
          stats[sId].teams += Number(t.registeredTeams) || 0;
        });
        setTournamentStats(stats);
        setTotalPrizePool(prizeSum);
      }
    });
  }, []);

  const displaySports = sports && sports.length > 0 ? sports : [];

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // When user clicks the Explore Sports card, redirect to that requested tournament!
  const handleSportCardClick = (sport: SportItem) => {
    navigate(`/tournaments?sport=${sport.id}&sportName=${encodeURIComponent(sport.name)}`);
  };

  if (displaySports.length === 0) {
    return (
      <div className="cinematic-tv-container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", background: "rgba(15, 23, 42, 0.8)", padding: "2.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="live-pulse-indicator" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "#f8fafc" }}>
            Loading SportsNest Arena...
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Connecting to live Supabase database for sports, grounds, and tournament schedules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cinematic-tv-container">
      {/* =====================================================================
          TOP CINEMATIC HERO BANNER (1st show only the all sports kind image)
          ===================================================================== */}
      <section className="cinematic-hero-banner" aria-label="All Sports Multi-Arena Featured Showcase">
        {/* Backdrop Image Container: All Sports Kind Image */}
        <div className="hero-backdrop-container">
          <img
            key="hero-backdrop-all-sports"
            src={ALL_SPORTS_HERO_IMAGE}
            alt="All Sports Multi-Arena Backdrop"
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

        {/* Top-Right Live Clock Badge */}
        <div className="hero-live-clock-badge">
          <span className="live-pulse-indicator" />
          <span>LIVE SPORTS ARENA</span>
          {currentTime && <span style={{ opacity: 0.6 }}>| {currentTime}</span>}
        </div>

        {/* Content Area on the Left */}
        <div className="hero-content-column">
          {/* Category Tag / Network Pill */}
          <div className="hero-top-meta-row">
            <span className="hero-network-badge">
              <span className="network-badge-dot" />
              ALL SPORTS MULTI-ARENA
            </span>
            <span className="hero-status-pill">
              <Activity size={13} style={{ color: "#10b981" }} />
              {totalTournamentsCount > 0
                ? `${totalTournamentsCount} Sanctioned Tournaments Active`
                : "Active Season Open"}
            </span>
          </div>

          {/* Main Display Title */}
          <h1 className="hero-sport-title">SportsNest Championship Arena</h1>

          {/* Engaging Synopsis */}
          <p className="hero-synopsis-text">
            The definitive multi-sport championship platform. Discover local and state tournaments,
            register your squad, track group standings & elimination brackets, or host your own sanctioned competition.
          </p>

          {/* Technical Specs & Stats Chips */}
          <div className="hero-specs-row">
            <div className="hero-spec-chip">
              <Shield size={14} style={{ color: "#10b981" }} />
              <span>Disciplines: <strong>{displaySports.length} Olympic & League Sports</strong></span>
            </div>
            <div className="hero-spec-chip">
              <Users size={14} style={{ color: "#38bdf8" }} />
              <span>Coverage: <strong>All India Pincodes & Stadiums</strong></span>
            </div>
            {totalPrizePool > 0 && (
              <div className="hero-spec-chip">
                <Trophy size={14} style={{ color: "#fbbf24" }} />
                <span>Prize Pool: <strong>₹{totalPrizePool.toLocaleString("en-IN")}</strong></span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="hero-action-buttons">
            <Link
              to="/tournaments"
              className="btn-hero-primary"
              id="hero-explore-tournaments-btn"
            >
              Explore All Tournaments
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/add-tournament"
              className="btn-hero-secondary"
              id="hero-create-tournament-btn"
            >
              Add New Tournament
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BOTTOM CAROUSEL FORMAT (Explore Sports cards redirect to that tournament)
          ===================================================================== */}
      <section className="sports-carousel-section" aria-label="Explore Sports Carousel">
        {/* Header with Title and Scroll Controls */}
        <div className="carousel-header-row">
          <div className="carousel-title-group">
            <h2 className="carousel-section-title">Explore Sports</h2>
            <span className="carousel-section-subtitle">
              Click any sport card to view its live tournaments
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
          {displaySports.map((sport) => {
            const sCustomImg = sport.image || sport.imageUrl || sport.bannerUrl;
            const sMeta = getSportCinematicMeta(sport.name, sCustomImg);
            const sStats = tournamentStats[sport.id] || { count: 0, prize: 0, teams: 0 };

            return (
              <div
                key={sport.id}
                className="sport-poster-card"
                onClick={() => handleSportCardClick(sport)}
                tabIndex={0}
                role="button"
                title={`Click to view ${sport.name} tournaments`}
                aria-label={`View ${sport.name} tournaments`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSportCardClick(sport);
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

                {/* Top Badge */}
                <div className="poster-top-tag-wrap">
                  <span className="poster-network-tag">
                    {sport.surface ? sport.surface.split(" ")[0] : sMeta.surface.split(" ")[0]}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.7rem",
                      color: "#10b981",
                      background: "rgba(0, 0, 0, 0.6)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    View ➜
                  </span>
                </div>

                {/* Bottom Title & Meta */}
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
