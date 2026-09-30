import React from "react";
import { Trophy, Users, ArrowRight, Plus, MapPin } from "lucide-react";
import { getSportPitchMeta, SPORT_ICONS_MAP } from "../utils/visualTheme";

export interface SportPitchCardProps {
  sport: {
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
    accentColor?: string;
  };
  stats?: {
    count: number;
    prize: number;
    teams?: number;
  };
  variant?: "poster" | "carousel" | "admin-card" | "admin-grid";
  onClick?: () => void;
  onActionClick?: (e: React.MouseEvent) => void;
  actionLabel?: string;
}

export const SportPitchCard: React.FC<SportPitchCardProps> = ({
  sport,
  stats = { count: 0, prize: 0, teams: 0 },
  variant = "poster",
  onClick,
  onActionClick,
  actionLabel,
}) => {
  const meta = getSportPitchMeta(sport.name);
  const icon = SPORT_ICONS_MAP[sport.name.toLowerCase()] || "🏆";
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

  // Format currency
  const formatMoney = (val: number) => {
    return `₹${val.toLocaleString()}`;
  };

  // -------------------------------------------------------------
  // VARIANT: Admin Dashboard Wallet Card ("Tournaments by Sport")
  // -------------------------------------------------------------
  if (variant === "admin-card") {
    return (
      <div
        className="dash-wallet-card"
        onClick={onClick}
        style={{
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          borderRadius: "14px",
          border: `1px solid rgba(226, 232, 240, 0.9)`,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1rem",
          minHeight: "155px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = `0 12px 24px -4px ${meta.accentColor}25`;
          e.currentTarget.style.borderColor = meta.accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
          e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.9)";
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>{icon}</span>
            <div>
              <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", display: "block" }}>
                {sport.name}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                {sport.surface || meta.surfaceBadge}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
              background: meta.badgeBg,
              color: meta.accentColor,
            }}
          >
            {stats.count} Events
          </span>
        </div>

        {/* 3D Pitch Ground Preview Thumbnail */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "75px",
            borderRadius: "8px",
            overflow: "hidden",
            margin: "0.5rem 0",
            background: "#09101a",
          }}
        >
          <img
            src={groundImage}
            alt={`${sport.name} Pitch Ground`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const sName = (sport.name || "").toLowerCase();
              const key = sName.includes("soccer") || sName.includes("football")
                ? "soccer"
                : sName.includes("basket")
                ? "basketball"
                : sName.includes("tennis")
                ? "tennis"
                : sName.includes("cricket")
                ? "cricket"
                : "volleyball";
              e.currentTarget.src = `/grounds/${key}.jpg`;
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              transition: "transform 0.4s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.75) 100%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "4px",
              left: "6px",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            {sport.groundName || meta.groundName.split("&")[0]}
          </span>
        </div>

        {/* Bottom Metrics */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>Prize Commitment</span>
            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.92rem" }}>
              {formatMoney(stats.prize)}
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: meta.accentColor }}>
            Manage &rarr;
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT: Poster & Carousel ("BOUNCE THAT LIFTS" Design Reference)
  // -------------------------------------------------------------
  return (
    <div
      className={`sport-pitch-card-root ${variant}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`Click to view ${sport.name} tournaments`}
      style={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        background: "#09101a",
        border: "1.5px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        width: variant === "carousel" ? "260px" : "100%",
        minWidth: variant === "carousel" ? "260px" : "auto",
        maxWidth: variant === "carousel" ? "260px" : "380px",
        height: variant === "carousel" ? "420px" : "480px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 20px 48px -8px ${meta.accentColor}40`;
        e.currentTarget.style.borderColor = meta.accentColor;
        const img = e.currentTarget.querySelector(".pitch-3d-ground-img") as HTMLImageElement;
        if (img) img.style.transform = "scale(1.06) rotate(1deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.45)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        const img = e.currentTarget.querySelector(".pitch-3d-ground-img") as HTMLImageElement;
        if (img) img.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      {/* 3D Pitch Ground Backdrop Image (No feet, no shoes, pure 3D diorama) */}
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
          alt={`${sport.name} Pitch Ground`}
          className="pitch-3d-ground-img"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const sName = (sport.name || "").toLowerCase();
            const key = sName.includes("soccer") || sName.includes("football")
              ? "soccer"
              : sName.includes("basket")
              ? "basketball"
              : sName.includes("tennis")
              ? "tennis"
              : sName.includes("cricket")
              ? "cricket"
              : "volleyball";
            e.currentTarget.src = `/grounds/${key}.jpg`;
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 42%",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        {/* Top & Bottom Cinematic Vignettes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(7, 13, 20, 0.85) 0%, rgba(7, 13, 20, 0.15) 35%, rgba(7, 13, 20, 0.4) 65%, rgba(7, 13, 20, 0.95) 100%)",
          }}
        />
      </div>

      {/* TOP HEADER: Brand Monogram & "BOUNCE THAT LIFTS" Athletic Display Typography */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "1.25rem 1.25rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Athletic Brand Monogram */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 900,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#e2e8f0",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              SPORTSNEST FIELD
            </span>
          </div>

          {/* Active Events Badge */}
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "0.25rem 0.65rem",
              borderRadius: "999px",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(6px)",
              color: "#ffffff",
              border: `1px solid ${meta.accentColor}80`,
            }}
          >
            {stats.count > 0 ? `${stats.count} Tournaments` : "Open League"}
          </span>
        </div>

        {/* Big Bold Athletic Typography Matching Poster Reference */}
        <div style={{ marginTop: "0.5rem" }}>
          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: 900,
              lineHeight: 1.05,
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              color: "#ffffff",
              margin: 0,
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            BOUNCE
            <br />
            THAT
            <br />
            <span style={{ color: meta.accentColor }}>LIFTS</span>
          </h2>
        </div>
      </div>

      {/* Floating Center Indicator */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 1.25rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#ffffff",
            background: "rgba(15, 23, 42, 0.75)",
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
          }}
        >
          {meta.surfaceBadge}
        </span>
      </div>

      {/* BOTTOM FOOTER: Sport Specifications & Rules Tagline */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "1.25rem",
          background: "linear-gradient(180deg, transparent 0%, rgba(7, 13, 20, 0.95) 30%, #070d14 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: meta.accentColor,
              }}
            >
              EVERY SPORT HAS ITS ARENA
            </span>
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              lineHeight: 1.35,
              color: "#cbd5e1",
              margin: "0.25rem 0 0 0",
              fontWeight: 500,
            }}
          >
            {meta.quote}
          </p>
        </div>

        {/* Stadium Specifications & Prize Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#ffffff", display: "block" }}>
              {sport.name.toUpperCase()}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {sport.groundName || meta.groundName}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onActionClick) onActionClick(e);
              else if (onClick) onClick();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "0.4rem 0.85rem",
              borderRadius: "8px",
              background: `linear-gradient(135deg, ${meta.accentColor} 0%, #059669 100%)`,
              border: "none",
              color: "#ffffff",
              fontSize: "0.76rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${meta.accentColor}40`,
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span>{actionLabel || "Explore"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
