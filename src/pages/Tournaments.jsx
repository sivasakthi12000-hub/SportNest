import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Calendar,
  CheckCircle2,
  PlusCircle,
  MapPin,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
  Layers,
} from "lucide-react";
import { getTournaments, getSports } from "../services/dataService";
import { getRealSportGround } from "../utils/visualTheme";
import TournamentCard from "../components/TournamentCard";
import "../styles/tournament.css";

const Tournaments = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const sportFilter = params.get("sport");

  const [timeFilter, setTimeFilter] = useState("all"); // "all", "future", "post"
  const [pincodeQuery, setPincodeQuery] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTournaments(), getSports()])
      .then(([tList, sList]) => {
        setTournaments(tList || []);
        setSports(sList || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading tournaments:", err);
        setLoading(false);
      });
  }, []);

  // Background image for selected sport
  const getSportBackground = (sportId) => {
    if (!sportId) return null;
    const currentSport = sports.find((s) => Number(s.id) === Number(sportId));
    return getRealSportGround(
      currentSport ? currentSport.name : sportId,
      currentSport?.image || currentSport?.imageUrl
    ).groundImage;
  };

  const selectedSportObj = useMemo(() => {
    if (!sportFilter) return null;
    return sports.find((s) => Number(s.id) === Number(sportFilter));
  }, [sportFilter, sports]);

  // Calculate live counts for the traffic light status filters
  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let all = 0;
    let future = 0;
    let post = 0;

    tournaments.forEach((t) => {
      if (sportFilter && Number(t.sportId) !== Number(sportFilter)) return;
      const tDate = new Date(t.date || Date.now());
      tDate.setHours(0, 0, 0, 0);
      const isPost = tDate < today || t.status === "post" || t.status === "completed";

      all++;
      if (isPost) {
        post++;
      } else {
        future++;
      }
    });

    return { all, future, post };
  }, [tournaments, sportFilter]);

  // Combined Filtering: Sport, Time Category, and Pincode / Address
  const filteredTournaments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = pincodeQuery.trim().toLowerCase();

    return tournaments.filter((t) => {
      // 1. Sport filter
      if (sportFilter && Number(t.sportId) !== Number(sportFilter)) {
        return false;
      }

      // 2. Time filter (Yellow: All, Green: Future/Upcoming, Red: Post/Completed)
      const tDate = new Date(t.date || Date.now());
      tDate.setHours(0, 0, 0, 0);
      const isPost = tDate < today || t.status === "post" || t.status === "completed";

      if (timeFilter === "future" && isPost) {
        return false;
      }
      if (timeFilter === "post" && !isPost) {
        return false;
      }

      // 3. Pincode and Address Search
      if (query) {
        const pinMatch = t.pincode && String(t.pincode).toLowerCase().includes(query);
        const addrMatch = t.address && t.address.toLowerCase().includes(query);
        const locMatch = t.location && t.location.toLowerCase().includes(query);
        const groundMatch = t.groundName && t.groundName.toLowerCase().includes(query);
        const districtMatch = t.district && t.district.toLowerCase().includes(query);
        const stateMatch = t.state && t.state.toLowerCase().includes(query);

        if (!pinMatch && !addrMatch && !locMatch && !groundMatch && !districtMatch && !stateMatch) {
          return false;
        }
      }

      return true;
    });
  }, [tournaments, sportFilter, timeFilter, pincodeQuery]);

  const backgroundImage = getSportBackground(Number(sportFilter));

  const clearSportFilter = () => {
    navigate("/tournaments");
  };

  return (
    <div
      className="tournaments-container"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Background Dim Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundImage ? "rgba(10, 15, 29, 0.88)" : "var(--bg-dark, #0b0f19)",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, paddingBottom: "4rem" }}>
        {/* Header Title Row */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
              Tournaments Arena
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "4px" }}>
              Discover curated tournaments across Tamil Nadu by pincode, district, or discipline.
            </p>
          </div>

          {/* Active Sport Filter indicator badge */}
          {selectedSportObj && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                padding: "6px 14px",
                borderRadius: "30px",
                color: "#34d399",
                fontSize: "0.9rem",
              }}
            >
              <span>Sport Filter: <strong>{selectedSportObj.name}</strong></span>
              <button
                onClick={clearSportFilter}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
                title="Clear sport filter and view all sports"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            PINCODE & ADDRESS AREA FILTER BAR
            ========================================================================= */}
        <div
          className="pincode-search-card"
          style={{
            background: "rgba(22, 27, 46, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 320px" }}>
              <MapPin
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#10b981",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                id="pincode-address-search-input"
                value={pincodeQuery}
                onChange={(e) => setPincodeQuery(e.target.value)}
                placeholder="Search by Pincode (e.g. 500032, 560001) or Address / City / Stadium..."
                style={{
                  width: "100%",
                  background: "rgba(10, 15, 29, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "10px",
                  padding: "11px 40px 11px 42px",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {pincodeQuery && (
                <button
                  type="button"
                  onClick={() => setPincodeQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title="Clear location filter"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Tamil Nadu pincode helper chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>TN Pincodes:</span>
              {[
                { code: "600003", city: "Chennai" },
                { code: "641018", city: "Coimbatore" },
                { code: "625002", city: "Madurai" },
                { code: "620020", city: "Trichy" },
                { code: "636004", city: "Salem" },
                { code: "627002", city: "Tirunelveli" },
              ].map((pin) => (
                <button
                  key={pin.code}
                  type="button"
                  onClick={() => setPincodeQuery(pin.code)}
                  style={{
                    background: pincodeQuery === pin.code ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.06)",
                    border: `1px solid ${pincodeQuery === pin.code ? "#10b981" : "rgba(255, 255, 255, 0.1)"}`,
                    color: pincodeQuery === pin.code ? "#34d399" : "#cbd5e1",
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title={`Filter tournaments in ${pin.city} (${pin.code})`}
                >
                  <span>📮</span>
                  <span>{pin.city} {pin.code}</span>
                </button>
              ))}
            </div>
          </div>

          {pincodeQuery && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem", color: "#38bdf8" }}>
              <span>
                📍 Showing tournaments matching area/pincode: <strong>"{pincodeQuery}"</strong> ({filteredTournaments.length} found)
              </span>
              <button
                type="button"
                onClick={() => setPincodeQuery("")}
                style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem" }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            SPACE-SAVING STATUS FILTER (Traffic Light Icons: Yellow, Green, Red)
            WITH HOVER TOOLTIPS
            ========================================================================= */}
        <div
          className="filter-tabs-action-bar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Traffic Light Filter Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div className="traffic-filter-container" id="tournament-traffic-filters">
              {/* Yellow Icon: All Tournaments */}
              <div className="traffic-icon-btn-wrapper">
                <button
                  id="filter-tab-all"
                  type="button"
                  className={`traffic-icon-btn yellow-filter ${timeFilter === "all" ? "active" : ""}`}
                  onClick={() => setTimeFilter("all")}
                  title={`All Tournaments (${counts.all}) — Show all tournaments across all dates`}
                  aria-label="All Tournaments"
                >
                  <span className="traffic-dot yellow" />
                  <Layers size={18} />
                </button>
                <div className="traffic-tooltip">
                  <div style={{ fontWeight: 700, color: "#fbbf24", marginBottom: "2px" }}>🟡 All Tournaments</div>
                  <div style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>Show all {counts.all} tournaments</div>
                </div>
              </div>

              {/* Green Icon: Future Tournaments */}
              <div className="traffic-icon-btn-wrapper">
                <button
                  id="filter-tab-future"
                  type="button"
                  className={`traffic-icon-btn green-filter ${timeFilter === "future" ? "active" : ""}`}
                  onClick={() => setTimeFilter("future")}
                  title={`Future Tournaments (${counts.future}) — Upcoming & open for team registration`}
                  aria-label="Future Tournaments"
                >
                  <span className="traffic-dot green" />
                  <Calendar size={18} />
                </button>
                <div className="traffic-tooltip">
                  <div style={{ fontWeight: 700, color: "#34d399", marginBottom: "2px" }}>🟢 Future Tournaments</div>
                  <div style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>{counts.future} upcoming & registration open</div>
                </div>
              </div>

              {/* Red Icon: Post Tournaments */}
              <div className="traffic-icon-btn-wrapper">
                <button
                  id="filter-tab-post"
                  type="button"
                  className={`traffic-icon-btn red-filter ${timeFilter === "post" ? "active" : ""}`}
                  onClick={() => setTimeFilter("post")}
                  title={`Post Tournaments (${counts.post}) — Completed matches and tournament archives`}
                  aria-label="Post Tournaments"
                >
                  <span className="traffic-dot red" />
                  <CheckCircle2 size={18} />
                </button>
                <div className="traffic-tooltip">
                  <div style={{ fontWeight: 700, color: "#f87171", marginBottom: "2px" }}>🔴 Post Tournaments</div>
                  <div style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>{counts.post} completed & archives</div>
                </div>
              </div>
            </div>

            {/* Current status indicator */}
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Viewing:</span>
              <span
                style={{
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background:
                    timeFilter === "future"
                      ? "rgba(16, 185, 129, 0.15)"
                      : timeFilter === "post"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color:
                    timeFilter === "future"
                      ? "#34d399"
                      : timeFilter === "post"
                      ? "#f87171"
                      : "#fbbf24",
                  border: `1px solid ${
                    timeFilter === "future"
                      ? "rgba(16, 185, 129, 0.3)"
                      : timeFilter === "post"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(245, 158, 11, 0.3)"
                  }`,
                }}
              >
                {timeFilter === "future" ? "Future (Upcoming)" : timeFilter === "post" ? "Post (Completed)" : "All Tournaments"} ({filteredTournaments.length})
              </span>
            </div>
          </div>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
            <div className="live-pulse-indicator" style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "1.1rem", color: "#f8fafc" }}>Loading tournaments from live database...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1.5rem",
              background: "rgba(22, 27, 46, 0.6)",
              borderRadius: "16px",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              maxWidth: "600px",
              margin: "2rem auto",
            }}
          >
            <MapPin size={40} style={{ color: "#94a3b8", margin: "0 auto 1rem", opacity: 0.6 }} />
            <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", marginBottom: "0.5rem" }}>
              No Tournaments Found
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              {pincodeQuery
                ? `No tournaments match the location or pincode "${pincodeQuery}". Try searching a different pincode or click reset.`
                : "No tournaments registered under this category yet."}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {pincodeQuery && (
                <button
                  type="button"
                  onClick={() => setPincodeQuery("")}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#f8fafc",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Clear Pincode Search
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setPincodeQuery("");
                  setTimeFilter("all");
                  clearSportFilter();
                }}
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#34d399",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {filteredTournaments.map((t) => {
              const sport = sports.find((s) => s.id === t.sportId);
              return (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  sportName={sport?.name || "Sports"}
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
