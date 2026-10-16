import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Users,
  Trophy,
  Activity,
  Calendar,
  Sparkles,
} from "lucide-react";
import "../styles/sport-showcase.css";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  sportName: string;
  sportId?: number;
  image: string;
  accentColor: string;
  specs: { label: string; value: string; icon: "shield" | "users" | "trophy" }[];
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: "arena-all",
    title: "SportsNest Championship Arena",
    subtitle:
      "The definitive multi-sport tournament platform. Discover local and state tournaments, register your squad, track group standings & elimination brackets, or host your own sanctioned competition.",
    badge: "ALL SPORTS MULTI-ARENA",
    sportName: "Multi-Sport",
    image: "/hero-arena.jpg",
    accentColor: "#10b981",
    specs: [
      { label: "Disciplines", value: "10 Olympic & League Sports", icon: "shield" },
      { label: "Coverage", value: "All India Pincodes & Stadiums", icon: "users" },
      { label: "Format", value: "Knockout, Round Robin & Groups", icon: "trophy" },
    ],
    primaryBtnText: "Explore All Tournaments",
    primaryBtnLink: "/tournaments",
    secondaryBtnText: "Add New Tournament",
    secondaryBtnLink: "/add-tournament",
  },
  {
    id: "arena-soccer",
    title: "State Soccer Champions League",
    subtitle:
      "Official regulation natural grass pitches and floodlit turfs. Live 3-1-0 group stage points tables, goal differential tie-breakers, and single-elimination knockout ladders.",
    badge: "OUTDOOR TURF ARENA",
    sportName: "Soccer",
    sportId: 1,
    image: "/grounds/soccer.jpg",
    accentColor: "#10b981",
    specs: [
      { label: "Regulation", value: "11 vs 11 Turf Match", icon: "shield" },
      { label: "Scoring", value: "FIFA 3-1-0 Points System", icon: "trophy" },
      { label: "Surface", value: "Natural Grass & Synthetic Turf", icon: "users" },
    ],
    primaryBtnText: "Explore Soccer Tournaments",
    primaryBtnLink: "/tournaments?sport=1&sportName=Soccer",
    secondaryBtnText: "View Soccer Discipline",
    secondaryBtnLink: "/sports",
  },
  {
    id: "arena-cricket",
    title: "Premier T20 Cricket Trophy",
    subtitle:
      "State-of-the-art turf wickets and floodlit stadiums. Complete Net Run Rate (NRR) calculations, live chase tracking, powerplay rules, and super over thrillers.",
    badge: "STADIUM TURF PITCH",
    sportName: "Cricket",
    sportId: 4,
    image: "/grounds/cricket.jpg",
    accentColor: "#3b82f6",
    specs: [
      { label: "Match Format", value: "T20 & Limited Overs", icon: "shield" },
      { label: "Standings", value: "Net Run Rate (NRR) Points Table", icon: "trophy" },
      { label: "Venue", value: "Turf Wicket & Pavilions", icon: "users" },
    ],
    primaryBtnText: "Explore Cricket Tournaments",
    primaryBtnLink: "/tournaments?sport=4&sportName=Cricket",
    secondaryBtnText: "View Cricket Grounds",
    secondaryBtnLink: "/sports",
  },
  {
    id: "arena-kabaddi",
    title: "Tamil Nadu Pro Kabaddi Championship",
    subtitle:
      "High-traction synthetic mat arenas with official baulk and bonus lines. Track super raids, super tackles, all-outs, and PKL 5-3-0 points tables.",
    badge: "SYNTHETIC MAT ARENA",
    sportName: "Kabaddi",
    sportId: 5,
    image: "/grounds/kabaddi.jpg",
    accentColor: "#f59e0b",
    specs: [
      { label: "Discipline", value: "7 vs 7 Raid & Tackle", icon: "shield" },
      { label: "Point System", value: "PKL 5-3-0 Official Rules", icon: "trophy" },
      { label: "Court", value: "High-Grip Synthetic Mat", icon: "users" },
    ],
    primaryBtnText: "Explore Kabaddi Tournaments",
    primaryBtnLink: "/tournaments?sport=5&sportName=Kabaddi",
    secondaryBtnText: "View Kabaddi Specs",
    secondaryBtnLink: "/sports",
  },
  {
    id: "arena-basketball",
    title: "Elite Hardwood Basketball Classic",
    subtitle:
      "FIBA regulation sprung hardwood courts and arena backboards. Fastbreak basketball, overtime rules, group stage point differentials, and knockout playoffs.",
    badge: "HARDWOOD COURT ARENA",
    sportName: "Basketball",
    sportId: 2,
    image: "/grounds/basketball.jpg",
    accentColor: "#ef4444",
    specs: [
      { label: "Regulation", value: "5 vs 5 FIBA Court", icon: "shield" },
      { label: "Structure", value: "Quarter Finals to Trophy Match", icon: "trophy" },
      { label: "Surface", value: "Sprung Maple Hardwood", icon: "users" },
    ],
    primaryBtnText: "Explore Basketball Tournaments",
    primaryBtnLink: "/tournaments?sport=2&sportName=Basketball",
    secondaryBtnText: "View Basketball Arena",
    secondaryBtnLink: "/sports",
  },
  {
    id: "arena-tennis",
    title: "Open Tennis Championship",
    subtitle:
      "Competition synthetic acrylic and clay courts. Complete singles and doubles draws, seeded elimination ladders, tie-breaks, and match set ratios.",
    badge: "COMPETITION COURT",
    sportName: "Tennis",
    sportId: 3,
    image: "/grounds/tennis.jpg",
    accentColor: "#8b5cf6",
    specs: [
      { label: "Draws", value: "Singles & Doubles Brackets", icon: "shield" },
      { label: "Ladder", value: "Seeded Elimination Tree", icon: "trophy" },
      { label: "Surface", value: "ITTF / Grand Slam Hardcourt", icon: "users" },
    ],
    primaryBtnText: "Explore Tennis Tournaments",
    primaryBtnLink: "/tournaments?sport=3&sportName=Tennis",
    secondaryBtnText: "View Tennis Court",
    secondaryBtnLink: "/sports",
  },
];

interface HomeBannerSliderProps {
  slides?: BannerSlide[];
  autoPlayInterval?: number;
  totalTournamentsCount?: number;
}

export const HomeBannerSlider: React.FC<HomeBannerSliderProps> = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
  totalTournamentsCount = 0,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Live clock
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

  // Autoplay sideways moving banners
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeSlide = slides[currentIdx] || slides[0];

  return (
    <div
      className="home-banner-slider-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "1.25rem 1.5rem 0",
        boxSizing: "border-box",
      }}
    >
      {/* Slider Window */}
      <div
        className="home-banner-slider-container"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "480px",
          borderRadius: "24px",
          overflow: "hidden",
          background: "#070d14",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Sideways Moving Slide Track */}
        <div
          className="home-banner-track"
          style={{
            display: "flex",
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(currentIdx * 100) / slides.length}%)`,
            transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((slide, sIdx) => {
            const isActive = sIdx === currentIdx;
            return (
              <div
                key={slide.id}
                className="home-banner-slide"
                style={{
                  position: "relative",
                  width: `${100 / slides.length}%`,
                  minHeight: "480px",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* Backdrop Arena Ground Image */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    zIndex: 1,
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "72%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      filter: "contrast(1.08) saturate(1.15)",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                      transition: "transform 4s ease-out",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero-arena.jpg";
                    }}
                  />
                  {/* High contrast gradient masks */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, #070d14 0%, #070d14 42%, rgba(7, 13, 20, 0.92) 58%, rgba(7, 13, 20, 0.5) 78%, rgba(7, 13, 20, 0.15) 100%)",
                      zIndex: 2,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(7, 13, 20, 0.4) 0%, transparent 40%, rgba(7, 13, 20, 0.95) 100%)",
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* Banner Content Column */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 3,
                    maxWidth: "680px",
                    padding: "3.5rem 2rem 3.5rem 3.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.15rem",
                  }}
                >
                  {/* Top Meta Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        border: `1px solid ${slide.accentColor}80`,
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: slide.accentColor,
                          boxShadow: `0 0 8px ${slide.accentColor}`,
                        }}
                      />
                      {slide.badge}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#94a3b8",
                      }}
                    >
                      <Activity size={13} style={{ color: slide.accentColor }} />
                      <span>{slide.sportName} Arena</span>
                    </span>
                  </div>

                  {/* Main Display Title */}
                  <h1
                    style={{
                      fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: 1.15,
                      letterSpacing: "-0.5px",
                      margin: 0,
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* Synopsis Text */}
                  <p
                    style={{
                      fontSize: "clamp(0.88rem, 1.2vw, 1.02rem)",
                      color: "#cbd5e1",
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: "580px",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Quick Specs Chips */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      flexWrap: "wrap",
                      fontSize: "0.82rem",
                      color: "#e2e8f0",
                    }}
                  >
                    {slide.specs.map((spec, spIdx) => (
                      <div
                        key={spIdx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "5px 11px",
                          borderRadius: "8px",
                        }}
                      >
                        {spec.icon === "shield" && <Shield size={13} style={{ color: slide.accentColor }} />}
                        {spec.icon === "users" && <Users size={13} style={{ color: "#38bdf8" }} />}
                        {spec.icon === "trophy" && <Trophy size={13} style={{ color: "#fbbf24" }} />}
                        <span>
                          {spec.label}: <strong>{spec.value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      to={slide.primaryBtnLink}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: slide.accentColor,
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        padding: "0.75rem 1.6rem",
                        borderRadius: "12px",
                        textDecoration: "none",
                        boxShadow: `0 8px 20px -4px ${slide.accentColor}60`,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{slide.primaryBtnText}</span>
                      <ArrowRight size={17} />
                    </Link>

                    <Link
                      to={slide.secondaryBtnLink}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#f8fafc",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        padding: "0.75rem 1.4rem",
                        borderRadius: "12px",
                        textDecoration: "none",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{slide.secondaryBtnText}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top-Right Live Clock Badge */}
        <div
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.5rem",
            zIndex: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px #10b981",
            }}
          />
          <span>LIVE ARENA</span>
          {currentTime && <span style={{ opacity: 0.65 }}>| {currentTime}</span>}
        </div>

        {/* Sideways Navigation Arrows (Left / Right) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Banner Slide"
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 4,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Banner Slide"
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 4,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ChevronRight size={24} />
        </button>

        {/* Bottom Pagination Dots */}
        <div
          style={{
            position: "absolute",
            bottom: "1.25rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {slides.map((slide, dotIdx) => {
            const isDotActive = dotIdx === currentIdx;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentIdx(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}: ${slide.title}`}
                style={{
                  width: isDotActive ? "26px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: isDotActive ? slide.accentColor : "rgba(255, 255, 255, 0.35)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isDotActive ? `0 0 10px ${slide.accentColor}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeBannerSlider;
