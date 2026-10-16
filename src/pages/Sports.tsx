import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Search,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Sparkles,
  Activity,
} from "lucide-react";
import { getSports, getTournaments, Sport } from "../services/dataService";
import { SPORT_ICONS_MAP, getSportPitchMeta } from "../utils/visualTheme";
import "../styles/sport-showcase.css";

const CATEGORIES = [
  { id: "all", label: "All Sports" },
  { id: "outdoor", label: "Outdoor Turf" },
  { id: "indoor", label: "Indoor Arena" },
  { id: "court", label: "Court & Racket" },
  { id: "other", label: "Aquatics & Field" },
];

const Sports: React.FC = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [tournamentStats, setTournamentStats] = useState<
    Record<number, { count: number; prize: number; teams: number }>
  >({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSports(), getTournaments()])
      .then(([sList, tList]) => {
        setSports(sList || []);

        const stats: Record<number, { count: number; prize: number; teams: number }> = {};
        if (Array.isArray(tList)) {
          tList.forEach((t) => {
            const sId = Number(t.sportId);
            if (!stats[sId]) {
              stats[sId] = { count: 0, prize: 0, teams: 0 };
            }
            stats[sId].count++;
            stats[sId].prize += Number(t.prizeAmount) || 0;
            stats[sId].teams += Number(t.registeredTeams) || 0;
          });
        }
        setTournamentStats(stats);
      })
      .catch((err) => {
        console.warn("Sports page data fetch notice:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter sports based on selected category and search query
  const filteredSports = useMemo(() => {
    return sports.filter((sport) => {
      const sName = (sport.name || "").toLowerCase();
      const sDesc = (sport.description || "").toLowerCase();
      const sGround = (sport.groundName || "").toLowerCase();
      const sSurface = (sport.surface || "").toLowerCase();
      const sCat = (sport.category || "").toLowerCase();

      // Category filter match
      let matchesCat = true;
      if (selectedCategory === "outdoor") {
        matchesCat =
          sCat.includes("outdoor") ||
          sCat.includes("turf") ||
          sName.includes("soccer") ||
          sName.includes("football") ||
          sName.includes("cricket") ||
          sName.includes("hockey");
      } else if (selectedCategory === "indoor") {
        matchesCat =
          sCat.includes("indoor") ||
          sName.includes("kabaddi") ||
          sName.includes("basketball") ||
          sName.includes("volleyball");
      } else if (selectedCategory === "court") {
        matchesCat =
          sCat.includes("court") ||
          sCat.includes("hall") ||
          sName.includes("tennis") ||
          sName.includes("badminton") ||
          sName.includes("table tennis") ||
          sName.includes("squash");
      } else if (selectedCategory === "other") {
        matchesCat =
          sCat.includes("aquatic") ||
          sName.includes("swimming") ||
          sName.includes("athletic");
      }

      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        sName.includes(q) ||
        sDesc.includes(q) ||
        sGround.includes(q) ||
        sSurface.includes(q);

      return matchesCat && matchesSearch;
    });
  }, [sports, selectedCategory, searchQuery]);

  const handleCardClick = (sport: Sport) => {
    navigate(`/tournaments?sport=${sport.id}&sportName=${encodeURIComponent(sport.name)}`);
  };

  return (
    <div
      className="sports-page-container"
      style={{
        background: "#070d14",
        minHeight: "calc(100vh - 72px)",
        color: "#ffffff",
        padding: "2rem 1.5rem 5rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Hero Section */}
        <div
          style={{
            marginBottom: "2.5rem",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "2.25rem",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.12)",
                padding: "4px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              <Sparkles size={13} />
              <span>Sanctioned Championship Arenas</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 900,
                margin: "0 0 0.5rem 0",
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              Sports Disciplines & Grounds
            </h1>

            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
              Select any sport discipline card below to explore its active and upcoming tournaments,
              view regulation ground diorama specifications, and register your team.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "0.75rem 1.25rem",
              borderRadius: "14px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                Total Disciplines
              </span>
              <strong style={{ fontSize: "1.4rem", color: "#10b981", fontWeight: 800 }}>
                {sports.length} Arenas
              </strong>
            </div>
            <div style={{ width: "1px", height: "32px", background: "rgba(255, 255, 255, 0.1)" }} />
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                Active Competitions
              </span>
              <strong style={{ fontSize: "1.4rem", color: "#38bdf8", fontWeight: 800 }}>
                {Object.values(tournamentStats).reduce((sum, s) => sum + s.count, 0)} Live
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: isActive ? "#10b981" : "rgba(15, 23, 42, 0.7)",
                    color: isActive ? "#ffffff" : "#cbd5e1",
                    border: isActive
                      ? "1px solid #10b981"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                    padding: "0.5rem 1.15rem",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.3)" : "none",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              placeholder="Search sports or surfaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                padding: "0.55rem 1rem 0.55rem 2.4rem",
                borderRadius: "10px",
                fontSize: "0.88rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏟️</div>
            <p style={{ fontWeight: 600 }}>Loading championship grounds and sports...</p>
          </div>
        )}

        {/* Empty Search State */}
        {!loading && filteredSports.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "500px",
              margin: "2rem auto",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#ffffff", fontSize: "1.2rem" }}>
              No Sports Matching "{searchQuery}"
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Try searching with another keyword or select "All Sports" to view the full catalog.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              style={{
                background: "#10b981",
                color: "#ffffff",
                border: "none",
                padding: "0.5rem 1.25rem",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Responsive Grid of Clickable Sports Cards */}
        {!loading && filteredSports.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {filteredSports.map((sport) => {
              const meta = getSportPitchMeta(sport.name);
              const icon = SPORT_ICONS_MAP[(sport.name || "").toLowerCase()] || sport.icon || "🏆";
              const stats = tournamentStats[sport.id] || { count: 0, prize: 0, teams: 0 };
              const accentColor = sport.accentColor || meta.accentColor || "#10b981";

              const sName = (sport.name || "").toLowerCase();
              const fallbackGround =
                sName.includes("soccer") || sName.includes("football")
                  ? "/grounds/soccer.jpg"
                  : sName.includes("basket")
                  ? "/grounds/basketball.jpg"
                  : sName.includes("tennis")
                  ? "/grounds/tennis.jpg"
                  : sName.includes("cricket")
                  ? "/grounds/cricket.jpg"
                  : sName.includes("badminton")
                  ? "/grounds/badminton.jpg"
                  : sName.includes("kabaddi")
                  ? "/grounds/kabaddi.jpg"
                  : sName.includes("hockey")
                  ? "/grounds/hockey.jpg"
                  : "/grounds/volleyball.jpg";

              let rawImg = sport.image || sport.imageUrl || sport.bannerUrl;
              if (rawImg && rawImg.includes("/src/assets/")) {
                rawImg = fallbackGround;
              }
              const groundImage = rawImg || meta.groundImage || fallbackGround;

              return (
                <div
                  key={sport.id}
                  onClick={() => handleCardClick(sport)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${sport.name} tournaments and ground details`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCardClick(sport);
                    }
                  }}
                  style={{
                    position: "relative",
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: "#09101a",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "440px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = `0 20px 45px -8px ${accentColor}45`;
                    e.currentTarget.style.borderColor = accentColor;
                    const img = e.currentTarget.querySelector(".sport-card-img") as HTMLImageElement;
                    if (img) img.style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.4)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    const img = e.currentTarget.querySelector(".sport-card-img") as HTMLImageElement;
                    if (img) img.style.transform = "scale(1)";
                  }}
                >
                  {/* Backdrop Ground Image with High-Contrast Vignettes */}
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
                      src={groundImage}
                      alt={`${sport.name} official ground`}
                      className="sport-card-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 30%",
                        filter: "contrast(1.05) saturate(1.1)",
                        transition: "transform 0.5s ease-out",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackGround;
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(7, 13, 20, 0.75) 0%, rgba(7, 13, 20, 0.3) 35%, rgba(7, 13, 20, 0.88) 70%, #070d14 100%)",
                        zIndex: 2,
                      }}
                    />
                  </div>

                  {/* Card Header (Sport Icon & Live Tournaments Badge) */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 3,
                      padding: "1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(6px)",
                        border: `1.5px solid ${accentColor}80`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        boxShadow: `0 4px 15px ${accentColor}30`,
                      }}
                    >
                      {icon}
                    </div>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: stats.count > 0 ? "#10b981" : "#94a3b8",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(6px)",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: `1px solid ${stats.count > 0 ? "#10b98160" : "rgba(255, 255, 255, 0.15)"}`,
                      }}
                    >
                      <Activity size={12} color={stats.count > 0 ? "#10b981" : "#94a3b8"} />
                      <span>{stats.count > 0 ? `${stats.count} Tournaments` : "Active Season"}</span>
                    </span>
                  </div>

                  {/* Card Body (Name, Ground Specs, Format) */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 3,
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.65rem",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: accentColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {sport.category || "Regulation Sport"}
                      </span>
                      <h2
                        style={{
                          fontSize: "1.45rem",
                          fontWeight: 900,
                          color: "#ffffff",
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {sport.name}
                      </h2>
                    </div>

                    {/* Venue & Ground Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.82rem",
                        color: "#94a3b8",
                      }}
                    >
                      <MapPin size={13} style={{ color: accentColor }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sport.groundName || meta.groundName}
                      </span>
                    </div>

                    {/* Surface & Format Info */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "0.65rem 0.85rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.3rem",
                        fontSize: "0.78rem",
                        color: "#cbd5e1",
                      }}
                    >
                      <div>
                        <span style={{ color: "#64748b" }}>Surface: </span>
                        <strong>{sport.surface || meta.surfaceBadge}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Format: </span>
                        <strong>{sport.format || "Regulation League"}</strong>
                      </div>
                    </div>

                    {/* Click Action CTA */}
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
                        {stats.prize > 0 ? `₹${stats.prize.toLocaleString()} in prizes` : "Open entry"}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          color: accentColor,
                        }}
                      >
                        <span>Explore</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;
