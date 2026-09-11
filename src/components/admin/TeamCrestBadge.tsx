import React from "react";
import { Zap, Crown, Flame, Shield, Award, Sparkles } from "lucide-react";
import { TeamCombatant } from "../../services/matchesService";

interface TeamCrestBadgeProps {
  team: TeamCombatant;
  size?: number;
}

export const TeamCrestBadge: React.FC<TeamCrestBadgeProps> = ({ team, size = 64 }) => {
  const accent = team.accentColor || "#6366f1";
  const secondary = team.secondaryColor || "#f59e0b";

  const renderIcon = () => {
    const iconSize = Math.round(size * 0.42);
    switch (team.crestType) {
      case "shield-lightning":
        return <Zap size={iconSize} color="#ffffff" fill="#ffffff" />;
      case "lion-crown":
        return <Crown size={iconSize} color="#ffffff" fill="#ffffff" />;
      case "fire-ball":
        return <Flame size={iconSize} color="#ffffff" fill="#ffffff" />;
      case "eagle-wings":
        return <Award size={iconSize} color="#ffffff" fill="#ffffff" />;
      case "tiger-claw":
        return <Sparkles size={iconSize} color="#ffffff" fill="#ffffff" />;
      case "falcon-blade":
        return <Shield size={iconSize} color="#ffffff" fill="#ffffff" />;
      default:
        return <Shield size={iconSize} color="#ffffff" fill="#ffffff" />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
      }}
      title={team.name}
    >
      {/* SVG Shield Frame with metallic border gradient */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}
      >
        <defs>
          <linearGradient id={`grad-${team.name.replace(/\s+/g, "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
          <linearGradient id={`border-${team.name.replace(/\s+/g, "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>

        {/* Shield Outer Path */}
        <path
          d="M50 5 L88 18 C88 65 65 92 50 105 C35 92 12 65 12 18 Z"
          fill={`url(#grad-${team.name.replace(/\s+/g, "")})`}
          stroke={`url(#border-${team.name.replace(/\s+/g, "")})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Geometric Gloss Accent */}
        <path
          d="M50 12 L80 22 C80 58 62 82 50 94 C38 82 20 58 20 22 Z"
          fill="rgba(0,0,0,0.25)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />

        {/* Bottom Banner Accent */}
        <path
          d="M30 80 L50 94 L70 80"
          stroke={secondary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating Center Emblem Icon */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        }}
      >
        {renderIcon()}
      </div>
    </div>
  );
};
