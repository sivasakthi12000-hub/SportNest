import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  DollarSign,
  Trophy,
  Users,
  Layers,
  Award,
  BookOpen,
  ArrowLeft,
  Plus,
  ExternalLink,
  Shield,
  Activity,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  getTournamentById,
  getSports,
  getTeamsByTournamentId,
  Tournament,
  Sport,
  Team,
} from "../services/dataService";
import { SPORT_ICONS_MAP } from "../utils/visualTheme";
import "../styles/tournament.css";

type TabKey = "overview" | "groups" | "teams" | "prizes";

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const tour = await getTournamentById(Number(id));
        setTournament(tour);
        if (tour) {
          const [sportsList, teamsList] = await Promise.all([
            getSports(),
            getTeamsByTournamentId(Number(id)),
          ]);
          const matchedSport = sportsList.find((s) => s.id === tour.sportId);
          setSport(matchedSport || null);
          setTeams(teamsList || []);
        }
      } catch (err) {
        console.error("Error loading tournament details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const groupA = teams.filter((t) => t.group === "A" || (!t.group && teams.indexOf(t) % 2 === 0));
  const groupB = teams.filter((t) => t.group === "B" || (!t.group && teams.indexOf(t) % 2 === 1));

  // Compute standings table directly from team data
  const computeStandings = (groupTeams: Team[]) => {
    return groupTeams
      .map((team) => {
        const played = Number((team as any).played) || 0;
        const won = Number((team as any).won) || 0;
        const lost = Number((team as any).lost) || 0;
        const points = Number((team as any).points) || won * 2;
        return {
          id: team.id,
          name: team.name,
          played,
          won,
          lost,
          points,
        };
      })
      .sort((a, b) => b.points - a.points || b.won - a.won);
  };

  const sortedGroupA = computeStandings(groupA);
  const sortedGroupB = computeStandings(groupB);

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏆</div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <h2>Tournament Not Found</h2>
        <p style={{ color: "#64748b" }}>The requested tournament could not be located.</p>
        <Link to="/tournaments" style={{ color: "#10b981", fontWeight: 700 }}>
          &larr; Back to Tournaments
        </Link>
      </div>
    );
  }

  const sportIcon =
    SPORT_ICONS_MAP[(sport?.name || tournament.sportName || "").toLowerCase()] ||
    sport?.icon ||
    "🏆";

  const isRegistrationOpen =
    tournament.status?.toLowerCase() !== "completed" &&
    (!tournament.maxTeams || (tournament.registeredTeams || teams.length) < tournament.maxTeams);

  const registeredCount = teams.length || tournament.registeredTeams || 0;
  const maxCapacity = tournament.maxTeams || 16;
  const progressPercent = Math.min(100, Math.round((registeredCount / maxCapacity) * 100));

  return (
    <div
      className="tournament-details-page-wrapper"
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "1.5rem 1.25rem 5rem",
        boxSizing: "border-box",
      }}
    >
      {/* Back Link */}
      <Link
        to="/tournaments"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#10b981",
          textDecoration: "none",
          fontSize: "0.88rem",
          fontWeight: 700,
          marginBottom: "1.25rem",
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Tournaments</span>
      </Link>

      {/* =========================================================================
          TOP COMPACT HERO BANNER (Title, Sport, Quick Metrics, Header Actions)
          ========================================================================= */}
      <div
        className="tournament-header-card"
        style={{
          background: "linear-gradient(135deg, #091523 0%, #0d1e33 60%, #08212e 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "2rem",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
          marginBottom: "1.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            {/* Badges Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                <span>{sportIcon}</span>
                <span>{sport?.name || tournament.sportName || "Tournament"}</span>
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    tournament.status === "completed"
                      ? "rgba(239, 68, 68, 0.15)"
                      : tournament.status === "live"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(56, 189, 248, 0.15)",
                  color:
                    tournament.status === "completed"
                      ? "#f87171"
                      : tournament.status === "live"
                      ? "#fbbf24"
                      : "#38bdf8",
                  border: `1px solid currentColor`,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                <span>{tournament.status || "Upcoming"}</span>
              </span>

              {tournament.format && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "4px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {tournament.format}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 900,
                color: "#ffffff",
                margin: "0 0 1rem 0",
                lineHeight: 1.15,
                textTransform: "capitalize",
              }}
            >
              {tournament.name}
            </h1>

            {/* Quick Metadata Line */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.25rem",
                fontSize: "0.88rem",
                color: "#cbd5e1",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <MapPin size={15} style={{ color: "#38bdf8" }} />
                <span>
                  {tournament.groundName || tournament.location}
                  {tournament.district ? `, ${tournament.district}` : ""}
                  {tournament.state ? `, ${tournament.state}` : ""}
                </span>
              </span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={15} style={{ color: "#10b981" }} />
                <span>Match Date: <strong>{tournament.date}</strong></span>
              </span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Trophy size={15} style={{ color: "#fbbf24" }} />
                <span>Prize: <strong style={{ color: "#fbbf24" }}>₹{Number(tournament.prizeAmount || 0).toLocaleString()}</strong></span>
              </span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              minWidth: "220px",
            }}
          >
            {isRegistrationOpen && (
              <Link
                to={`/register/${id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "0.75rem 1.4rem",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <Plus size={18} />
                <span>Register Team</span>
              </Link>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                to={`/bracket/${id}`}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                <Layers size={15} />
                <span>Bracket</span>
              </Link>

              <Link
                to={`/tournament/${id}/teams`}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                <Users size={15} />
                <span>Teams ({registeredCount})</span>
              </Link>
            </div>

            {/* Registration Progress Indicator */}
            <div style={{ marginTop: "0.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "4px" }}>
                <span>Registration Capacity</span>
                <span>{registeredCount} / {maxCapacity} Teams</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", background: "#10b981", borderRadius: "999px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE TAB NAVIGATION BAR (Compact, User-Friendly, Zero Scroll Fatigue)
          ========================================================================= */}
      <div
        className="tournament-tab-nav"
        style={{
          display: "flex",
          gap: "0.5rem",
          background: "#0d1624",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0.5rem",
          borderRadius: "14px",
          marginBottom: "1.75rem",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            flex: 1,
            minWidth: "150px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "overview" ? "#10b981" : "transparent",
            color: activeTab === "overview" ? "#ffffff" : "#94a3b8",
            boxShadow: activeTab === "overview" ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <MapPin size={16} />
          <span>Overview & Venue</span>
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          style={{
            flex: 1,
            minWidth: "150px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "groups" ? "#10b981" : "transparent",
            color: activeTab === "groups" ? "#ffffff" : "#94a3b8",
            boxShadow: activeTab === "groups" ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Trophy size={16} />
          <span>Groups & Standings</span>
        </button>

        <button
          onClick={() => setActiveTab("teams")}
          style={{
            flex: 1,
            minWidth: "150px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "teams" ? "#10b981" : "transparent",
            color: activeTab === "teams" ? "#ffffff" : "#94a3b8",
            boxShadow: activeTab === "teams" ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Users size={16} />
          <span>Teams ({registeredCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("prizes")}
          style={{
            flex: 1,
            minWidth: "150px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            background: activeTab === "prizes" ? "#10b981" : "transparent",
            color: activeTab === "prizes" ? "#ffffff" : "#94a3b8",
            boxShadow: activeTab === "prizes" ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Award size={16} />
          <span>Prizes & Rules</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & PINNED VENUE MAP
          ========================================================================= */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Key Facts Responsive Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <div className="tab-metric-box">
              <span className="metric-label">Registration Deadline</span>
              <strong className="metric-val" style={{ color: "#f59e0b" }}>
                {tournament.lastRegistrationDate || "Open until slots fill"}
              </strong>
            </div>

            <div className="tab-metric-box">
              <span className="metric-label">Entry Fee</span>
              <strong className="metric-val" style={{ color: "#10b981" }}>
                {tournament.entryFee ? `₹${Number(tournament.entryFee).toLocaleString()}` : "Free Entry"}
              </strong>
            </div>

            <div className="tab-metric-box">
              <span className="metric-label">Prize Pool</span>
              <strong className="metric-val" style={{ color: "#fbbf24" }}>
                ₹{Number(tournament.prizeAmount || 0).toLocaleString()}
              </strong>
            </div>

            <div className="tab-metric-box">
              <span className="metric-label">Tournament Duration</span>
              <strong className="metric-val">
                {tournament.durationDays || 2} Day(s) • {tournament.venues || 2} Pitches
              </strong>
            </div>

            <div className="tab-metric-box">
              <span className="metric-label">Match Duration</span>
              <strong className="metric-val">
                {tournament.matchDurationMinutes || 60} min / match
              </strong>
            </div>

            <div className="tab-metric-box">
              <span className="metric-label">Tournament Structure</span>
              <strong className="metric-val">
                {tournament.format || "Single Elimination (Knockout)"}
              </strong>
            </div>
          </div>

          {/* About Synopsis Card */}
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.1rem", color: "#f8fafc", fontWeight: 800 }}>
              About This Tournament
            </h3>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, fontSize: "0.95rem" }}>
              {tournament.description || "Official sanctioned tournament on SportsNest. Registered teams compete on regulation grounds with verified scoreboards, referee oversight, and elimination ladders."}
            </p>
          </div>

          {/* Discipline Specifications & Rules if entered */}
          {tournament.rules && tournament.rules.trim() && (
            <div
              style={{
                background: "#0d1624",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                <BookOpen size={18} style={{ color: "#38bdf8" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc", fontWeight: 800 }}>
                  Discipline Specifications & Ground Rules
                </h3>
              </div>
              <div
                className="rules-rich-content"
                style={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "0.92rem" }}
                dangerouslySetInnerHTML={{ __html: tournament.rules }}
              />
            </div>
          )}

          {/* Pinned Venue Map Card */}
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} style={{ color: "#38bdf8" }} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#f8fafc", fontWeight: 800 }}>
                  Venue Location & Pinned Map
                </h3>
              </div>

              <a
                href={
                  tournament.mapUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${tournament.groundName}, ${tournament.district}, ${tournament.state}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#38bdf8",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <span>Get Driving Directions</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ padding: "0.85rem 1.25rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
              📍 <strong>{tournament.groundName || tournament.location}</strong>
              {tournament.address ? `, ${tournament.address}` : ""}
              {tournament.district ? `, ${tournament.district}` : ""}
              {tournament.state ? `, ${tournament.state}` : ""}
              {tournament.pincode ? ` - ${tournament.pincode}` : ""}
            </div>

            <div style={{ width: "100%", height: "300px" }}>
              <iframe
                title="Tournament Venue Location Map"
                src={
                  tournament.mapUrl?.includes("/maps/embed")
                    ? tournament.mapUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(
                        tournament.mapUrl ||
                          `${tournament.groundName || tournament.location}, ${tournament.district || ""}, ${tournament.state || ""}`
                      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GROUPS & STANDINGS
          ========================================================================= */}
      {activeTab === "groups" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Quick Header Banner */}
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: 800 }}>
                Group Stage & Qualification Points Table
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                Top {tournament.advancingPerGroup || 2} teams from each pool advance to the knockout championship bracket
              </p>
            </div>

            <Link
              to={`/bracket/${id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#10b981",
                color: "#ffffff",
                padding: "0.55rem 1.15rem",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              <span>View Full Bracket Ladder</span>
              <ArrowLeft size={15} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>

          {teams.length === 0 ? (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: "#0d1624",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#ffffff", fontSize: "1.1rem" }}>
                No Teams Registered Yet
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                Groups and points tables will populate automatically as teams confirm registration.
              </p>
              {isRegistrationOpen && (
                <Link
                  to={`/register/${id}`}
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Register the First Team
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {/* Group A */}
              <div
                style={{
                  background: "#0d1624",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                    Group A Points Table
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                    Top 2 Advance
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "left" }}>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8" }}>Team</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>P</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>W</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>L</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGroupA.length > 0 ? (
                        sortedGroupA.map((team, idx) => (
                          <tr key={team.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: idx < 2 ? "rgba(16, 185, 129, 0.06)" : undefined }}>
                            <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>
                              <Link to={`/team/${team.id}`} style={{ color: "#38bdf8", textDecoration: "none" }}>
                                {team.name}
                              </Link>
                            </td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#94a3b8" }}>{team.played}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#34d399", fontWeight: 700 }}>{team.won}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#f87171" }}>{team.lost}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", fontWeight: 900, color: "#10b981" }}>{team.points}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                            No teams in Group A
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Group B */}
              <div
                style={{
                  background: "#0d1624",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                    Group B Points Table
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                    Top 2 Advance
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "left" }}>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8" }}>Team</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>P</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>W</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>L</th>
                        <th style={{ padding: "0.6rem 0.75rem", color: "#94a3b8", textAlign: "center" }}>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGroupB.length > 0 ? (
                        sortedGroupB.map((team, idx) => (
                          <tr key={team.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: idx < 2 ? "rgba(16, 185, 129, 0.06)" : undefined }}>
                            <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>
                              <Link to={`/team/${team.id}`} style={{ color: "#38bdf8", textDecoration: "none" }}>
                                {team.name}
                              </Link>
                            </td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#94a3b8" }}>{team.played}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#34d399", fontWeight: 700 }}>{team.won}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#f87171" }}>{team.lost}</td>
                            <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", fontWeight: 900, color: "#10b981" }}>{team.points}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                            No teams in Group B
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: REGISTERED TEAMS
          ========================================================================= */}
      {activeTab === "teams" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: 800 }}>
                Confirmed Registered Squads ({teams.length} / {maxCapacity})
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                Click any team card to access its interactive 3D locker room, player rosters, and tactical line-ups
              </p>
            </div>

            {isRegistrationOpen && (
              <Link
                to={`/register/${id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "0.55rem 1.15rem",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                <Plus size={16} />
                <span>Register a Squad</span>
              </Link>
            )}
          </div>

          {teams.length === 0 ? (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: "#0d1624",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛡️</div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#ffffff", fontSize: "1.1rem" }}>
                No Squads Registered Yet
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                Be the first team to enter and claim seed position #1!
              </p>
              {isRegistrationOpen && (
                <Link
                  to={`/register/${id}`}
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Register Team Now
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {teams.map((team, idx) => (
                <Link
                  key={team.id}
                  to={`/team/${team.id}`}
                  style={{
                    textDecoration: "none",
                    background: "#0d1624",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#10b981",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.95rem",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 3px 0", color: "#ffffff", fontSize: "1rem", fontWeight: 800 }}>
                        {team.name}
                      </h4>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        Group {team.group || (idx % 2 === 0 ? "A" : "B")} • {team.members || 11} Players
                      </span>
                    </div>
                  </div>

                  <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: 700 }}>
                    Locker &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: PRIZES & RULES
          ========================================================================= */}
      {activeTab === "prizes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Prize Breakdown Grid */}
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
              <Trophy size={20} style={{ color: "#fbbf24" }} />
              <div>
                <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.15rem", fontWeight: 800 }}>
                  Prize Money Distribution (Total: ₹{Number(tournament.prizeAmount || 0).toLocaleString()})
                </h3>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                  Verified tournament prize pool awarded to finalists and podium finishers
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {tournament.prizeBreakdown && tournament.prizeBreakdown.length > 0 ? (
                tournament.prizeBreakdown.map((prize, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: idx === 0 ? "rgba(251, 191, 36, 0.1)" : "rgba(255, 255, 255, 0.04)",
                      border: idx === 0 ? "1px solid rgba(251, 191, 36, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.25rem" }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block" }}>
                      {prize.position || `Position ${idx + 1}`}
                    </span>
                    <strong style={{ fontSize: "1.35rem", color: idx === 0 ? "#fbbf24" : "#ffffff", fontWeight: 900 }}>
                      ₹{Number(prize.amount || 0).toLocaleString()}
                    </strong>
                  </div>
                ))
              ) : (
                <>
                  <div
                    style={{
                      background: "rgba(251, 191, 36, 0.1)",
                      border: "1px solid rgba(251, 191, 36, 0.4)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.25rem" }}>🥇</span>
                    <span style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block" }}>1st Place (Champion)</span>
                    <strong style={{ fontSize: "1.35rem", color: "#fbbf24", fontWeight: 900 }}>
                      ₹{Math.round(Number(tournament.prizeAmount || 0) * 0.6).toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.25rem" }}>🥈</span>
                    <span style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block" }}>2nd Place (Runner-Up)</span>
                    <strong style={{ fontSize: "1.35rem", color: "#ffffff", fontWeight: 900 }}>
                      ₹{Math.round(Number(tournament.prizeAmount || 0) * 0.3).toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.25rem" }}>🥉</span>
                    <span style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block" }}>3rd Place (Semifinalist)</span>
                    <strong style={{ fontSize: "1.35rem", color: "#ffffff", fontWeight: 900 }}>
                      ₹{Math.round(Number(tournament.prizeAmount || 0) * 0.1).toLocaleString()}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Official Tournament Guidelines & Policies */}
          <div
            style={{
              background: "#0d1624",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#ffffff", fontSize: "1.1rem", fontWeight: 800 }}>
              Entry & Sanctioning Terms
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "4px" }}>
                  Entry Fee Policy
                </strong>
                <p style={{ margin: 0, lineHeight: 1.6, color: "#94a3b8" }}>
                  Entry fee of {tournament.entryFee ? `₹${Number(tournament.entryFee).toLocaleString()}` : "Free"} is payable per registered team prior to fixture draws.
                </p>
              </div>

              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "4px" }}>
                  Registration Cutoff
                </strong>
                <p style={{ margin: 0, lineHeight: 1.6, color: "#94a3b8" }}>
                  Registrations close on {tournament.lastRegistrationDate || "the deadline date"} or when maximum capacity of {maxCapacity} teams is reached.
                </p>
              </div>

              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "4px" }}>
                  Official Ground Rules
                </strong>
                <p style={{ margin: 0, lineHeight: 1.6, color: "#94a3b8" }}>
                  Standard regulation sports governing rules apply. Match referees and ground marshals have final authority over disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE QUICK ACTION FLOATING BOTTOM BAR
          ========================================================================= */}
      <div
        className="mobile-sticky-action-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(7, 13, 20, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "0.75rem 1.25rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          zIndex: 100,
          boxShadow: "0 -8px 25px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Link
          to={`/bracket/${id}`}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "0.7rem",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.88rem",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <Layers size={16} />
          <span>View Bracket</span>
        </Link>

        {isRegistrationOpen && (
          <Link
            to={`/register/${id}`}
            style={{
              flex: 1.5,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              background: "#10b981",
              color: "#ffffff",
              padding: "0.7rem",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.88rem",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
              textAlign: "center",
            }}
          >
            <Plus size={16} />
            <span>Register Team</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentDetails;
