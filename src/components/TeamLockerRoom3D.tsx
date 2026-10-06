import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shield,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import {
  SquadPlayer,
  getTeamRoster,
  getSportRosterTemplate,
  saveTeamCustomRoster,
} from "../utils/squadRosterService";
import "../styles/locker-room.css";

interface TeamLockerRoom3DProps {
  team: {
    id: number;
    name: string;
    tournamentId?: number;
    group?: string;
    members?: number;
    captain?: string;
    roster?: any[];
    players?: any[];
  };
  tournament?: {
    id: number;
    name: string;
    sportName?: string;
  } | null;
  sportName?: string;
  onSelectPlayer?: (player: SquadPlayer) => void;
}

// Kit palettes
const KIT_THEMES = {
  home: {
    name: "Home Kit",
    bg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    accent: "#ef4444",
    numColor: "#ffffff",
    border: "rgba(239, 68, 68, 0.4)",
    gkBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  },
  away: {
    name: "Away Kit",
    bg: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
    accent: "#0f172a",
    numColor: "#0f172a",
    border: "rgba(15, 23, 42, 0.3)",
    gkBg: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  },
  third: {
    name: "Third Kit",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "#38bdf8",
    numColor: "#38bdf8",
    border: "rgba(56, 189, 248, 0.4)",
    gkBg: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  },
};

export const TeamLockerRoom3D: React.FC<TeamLockerRoom3DProps> = ({
  team,
  tournament,
  sportName = "Soccer",
  onSelectPlayer,
}) => {
  const sport = tournament?.sportName || sportName;
  const roster = useMemo(() => getTeamRoster(team, sport), [team, sport]);
  const template = useMemo(() => getSportRosterTemplate(sport), [sport]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [kitSide, setKitSide] = useState<"back" | "front">("back");
  const [kitTheme, setKitTheme] = useState<"home" | "away" | "third">("home");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAutoTour, setIsAutoTour] = useState<boolean>(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Filter players according to active category pill
  const filteredPlayers = useMemo(() => {
    if (activeCategory === "all") return roster;
    return roster.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [roster, activeCategory]);

  const activePlayer: SquadPlayer | undefined =
    filteredPlayers[selectedIndex] || filteredPlayers[0] || roster[0];

  // Synthesize broadcast UI sound via Web Audio API
  const playSwooshSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }, [soundEnabled]);

  const selectPlayerIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(filteredPlayers.length - 1, index));
      setSelectedIndex(safeIndex);
      playSwooshSound();
      if (filteredPlayers[safeIndex] && onSelectPlayer) {
        onSelectPlayer(filteredPlayers[safeIndex]);
      }
    },
    [filteredPlayers, onSelectPlayer, playSwooshSound]
  );

  // Auto-scroll the rack so the focused jersey stays in the comfortable viewport center
  useEffect(() => {
    if (carouselRef.current) {
      const activeElement = carouselRef.current.querySelector(
        `.locker-jersey-unit[data-idx="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeElement) {
        const container = carouselRef.current;
        const targetScroll =
          activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        playSwooshSound();
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => Math.min(filteredPlayers.length - 1, prev + 1));
        playSwooshSound();
      } else if (e.key.toLowerCase() === "f") {
        setKitSide((prev) => (prev === "back" ? "front" : "back"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPlayers.length, playSwooshSound]);

  // Auto-tour feature (cycles players like TV intro)
  useEffect(() => {
    if (!isAutoTour || filteredPlayers.length === 0) return;
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % filteredPlayers.length);
      playSwooshSound();
    }, 3200);
    return () => clearInterval(interval);
  }, [isAutoTour, filteredPlayers.length, playSwooshSound]);

  const activeTheme = KIT_THEMES[kitTheme];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: roster.length };
    roster.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [roster]);

  return (
    <div className="locker-room-viewport" id="interactive-3d-locker-room">
      {/* Overhead stadium spotlight glow */}
      <div className="locker-spotlight" />

      {/* Top Broadcast Bar */}
      <div className="locker-topbar">
        <div className="locker-brand">
          <div className="locker-team-crest">🛡️</div>
          <div className="locker-team-meta">
            <h3>
              {team.name}
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.2rem 0.5rem",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  borderRadius: "6px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Group {team.group || "A"}
              </span>
            </h3>
            <p>
              Interactive 3D Locker Room · {sport.toUpperCase()} ·{" "}
              {tournament?.name || "Official Championship"}
            </p>
          </div>
        </div>

        {/* Category Filter Pills (All, Goalkeepers, Defenders, etc.) */}
        <div className="locker-filter-pills" role="tablist">
          {template.categories.map((cat) => {
            const count = categoryCounts[cat.key] || 0;
            if (cat.key !== "all" && count === 0) return null;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`locker-filter-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSelectedIndex(0);
                  playSwooshSound();
                }}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Tools */}
        <div className="locker-actions">
          {/* Flip kit (front/back) */}
          <button
            type="button"
            className="locker-tool-btn"
            onClick={() => {
              setKitSide((prev) => (prev === "back" ? "front" : "back"));
              playSwooshSound();
            }}
            title="Inspect Front/Back of Jersey"
          >
            <RotateCcw size={14} />
            <span>{kitSide === "back" ? "Front Crest" : "Back Number"}</span>
          </button>

          {/* Kit Color Variant */}
          <button
            type="button"
            className="locker-tool-btn"
            onClick={() => {
              const order: ("home" | "away" | "third")[] = ["home", "away", "third"];
              const next = order[(order.indexOf(kitTheme) + 1) % order.length];
              setKitTheme(next);
              playSwooshSound();
            }}
            title="Switch Kit Variant"
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: activeTheme.accent,
                display: "inline-block",
              }}
            />
            <span>{activeTheme.name}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            className="locker-tool-btn"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? "Mute Broadcast Audio" : "Enable Broadcast Audio"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Auto Tour Play */}
          <button
            type="button"
            className={`locker-tool-btn ${isAutoTour ? "active" : ""}`}
            onClick={() => setIsAutoTour((prev) => !prev)}
            title="Automated TV Squad Tour"
          >
            {isAutoTour ? <Pause size={14} /> : <Play size={14} />}
            <span>Auto</span>
          </button>
        </div>
      </div>

      {/* Main Locker Room Grid (Stage on left, Squad Sheet on right) */}
      <div className="locker-arena-grid">
        {/* Left Stage: 3D Rail & Hanging Jerseys */}
        <div className="locker-stage">
          <div className="locker-rail-housing">
            {/* The Solid Chrome Steel Rail */}
            <div className="locker-metal-rail">
              <div className="locker-rail-caps-left" />
              <div className="locker-rail-caps-right" />
            </div>

            {/* Horizontal 3D Carousel of Hanging Jerseys */}
            <div className="locker-carousel-container" ref={carouselRef}>
              <div className="locker-jerseys-track">
                {filteredPlayers.map((player, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isGk = player.isGoalkeeper;

                  // Distinctive kit color for goalkeeper (as shown in cyan in the video!)
                  const cardBg = isGk ? activeTheme.gkBg : activeTheme.bg;
                  const numCol = isGk ? "#ffffff" : activeTheme.numColor;

                  return (
                    <div
                      key={player.id}
                      data-idx={idx}
                      className={`locker-jersey-unit ${isSelected ? "active" : ""}`}
                      onClick={() => selectPlayerIndex(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select jersey #${player.number} ${player.name}`}
                    >
                      {/* Chrome Hanger Hook hanging from the steel rail */}
                      <div className="jersey-hanger-hook" />
                      {/* Wooden Hanger Bar */}
                      <div className="jersey-hanger-bar" />

                      {/* 3D Fabric Jersey */}
                      <div
                        className="jersey-card"
                        style={{
                          background: cardBg,
                          border: `1px solid ${
                            isSelected ? "rgba(255, 255, 255, 0.45)" : activeTheme.border
                          }`,
                        }}
                      >
                        {/* Jersey Collar */}
                        <div className="jersey-collar" />

                        {kitSide === "back" ? (
                          /* BACK: Surname & Big Bold Number (matching the video) */
                          <div className="jersey-back">
                            <div className="jersey-back-name">{player.jerseyName}</div>
                            <div className="jersey-back-number" style={{ color: numCol }}>
                              {player.number}
                            </div>
                          </div>
                        ) : (
                          /* FRONT: Team Crest & Sponsor */
                          <div className="jersey-front">
                            <div className="jersey-front-top">
                              <span className="jersey-front-crest">🛡️</span>
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  fontWeight: 800,
                                  color: "rgba(255,255,255,0.8)",
                                }}
                              >
                                {sport.toUpperCase()}
                              </span>
                            </div>
                            <div className="jersey-front-sponsor">SPORTSNEST</div>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              NO. {player.number}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Player label shelf under jersey */}
                      <div className="jersey-shelf-label">
                        <span style={{ color: isSelected ? "#ef4444" : "#94a3b8" }}>
                          #{player.number}
                        </span>
                        <span>{player.jerseyName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floor Controls & Interaction Legend */}
          <div className="locker-floor-bar">
            <div className="locker-instruction">
              <Sliders size={15} color="#38bdf8" />
              <span>
                Click or drag any jersey to inspect · Use Left / Right arrow keys to slide
              </span>
            </div>

            <div className="locker-nav-controls">
              <button
                type="button"
                className="locker-nav-btn"
                onClick={() => selectPlayerIndex(selectedIndex - 1)}
                disabled={selectedIndex === 0}
                title="Previous Player"
              >
                <ChevronLeft size={18} />
              </button>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  minWidth: "60px",
                  textAlign: "center",
                }}
              >
                {selectedIndex + 1} / {filteredPlayers.length}
              </span>
              <button
                type="button"
                className="locker-nav-btn"
                onClick={() => selectPlayerIndex(selectedIndex + 1)}
                disabled={selectedIndex >= filteredPlayers.length - 1}
                title="Next Player"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Stage: SQUAD SHEET & Player Dossier (exact match to video HUD) */}
        {activePlayer && (
          <div className="locker-dossier-panel">
            <div className="dossier-card">
              <div className="dossier-ribbon" />

              <div className="dossier-header">
                <div className="dossier-league-tag">
                  <Award size={13} />
                  <span>SQUAD SHEET · {sport.toUpperCase()} CUP 2026</span>
                </div>

                <div className="dossier-hero-row">
                  <div className="dossier-big-number">{activePlayer.number}</div>
                  <div>
                    <h4 className="dossier-player-name">{activePlayer.name}</h4>
                    <span className="dossier-role-badge">
                      {activePlayer.isGoalkeeper ? "🛡️ GOALKEEPER" : `⚽ ${activePlayer.role.toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="dossier-bio-grid">
                <div className="bio-item">
                  <span className="bio-item-label">Club / Team</span>
                  <span className="bio-item-value">{team.name}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-item-label">Born / Age</span>
                  <span className="bio-item-value">
                    {activePlayer.dob} ({activePlayer.age} yrs)
                  </span>
                </div>
                <div className="bio-item">
                  <span className="bio-item-label">Birthplace</span>
                  <span className="bio-item-value">{activePlayer.hometown}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-item-label">Height & Foot</span>
                  <span className="bio-item-value">
                    {activePlayer.height} · {activePlayer.preferredFootOrHand}
                  </span>
                </div>
                <div className="bio-item">
                  <span className="bio-item-label">Squad Status</span>
                  <span className="bio-item-value" style={{ color: "#34d399" }}>
                    ✓ {activePlayer.status}
                  </span>
                </div>
                <div className="bio-item">
                  <span className="bio-item-label">Match Rating</span>
                  <span className="bio-item-value" style={{ color: "#facc15" }}>
                    ★ {activePlayer.stats.rating} / 10
                  </span>
                </div>
              </div>

              {/* Broadcast Stats Strip */}
              <div className="dossier-stats-strip">
                <div className="stat-box">
                  <div className="stat-box-val">{activePlayer.stats.matches}</div>
                  <div className="stat-box-lbl">Caps / Matches</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-val">{activePlayer.stats.primaryValue}</div>
                  <div className="stat-box-lbl">{activePlayer.stats.primaryLabel}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-val">{activePlayer.stats.secondaryValue}</div>
                  <div className="stat-box-lbl">{activePlayer.stats.secondaryLabel}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Jump */}
            <div className="dossier-footer">
              <button
                type="button"
                className="dossier-action-btn primary"
                onClick={() => {
                  setKitSide((prev) => (prev === "back" ? "front" : "back"));
                  playSwooshSound();
                }}
              >
                <RotateCcw size={14} />
                <span>Flip Jersey View</span>
              </button>

              <button
                type="button"
                className="dossier-action-btn"
                onClick={() => {
                  selectPlayerIndex((selectedIndex + 1) % filteredPlayers.length);
                }}
              >
                <span>Next Player</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLockerRoom3D;
