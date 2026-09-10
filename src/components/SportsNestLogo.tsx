import React from "react";

interface SportsNestLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  theme?: "light" | "dark" | "colored";
}

export const SportsNestLogo: React.FC<SportsNestLogoProps> = ({
  size = "md",
  showSubtitle = true,
  className = "",
  theme = "colored",
}) => {
  const iconDimensions = {
    sm: 28,
    md: 36,
    lg: 46,
  };

  const currentDim = iconDimensions[size];

  return (
    <div className={`sportsnest-brand-logo ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: size === "lg" ? "10px" : "8px", textDecoration: "none" }}>
      {/* Visual Nest & Arena Emblem */}
      <div
        className="sportsnest-icon-wrap"
        style={{
          width: `${currentDim}px`,
          height: `${currentDim}px`,
          borderRadius: "10px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
          flexShrink: 0,
        }}
      >
        <svg
          width={currentDim * 0.65}
          height={currentDim * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Nest curve / stadium arc */}
          <path
            d="M3 13C3.5 17.5 7.5 21 12 21C16.5 21 20.5 17.5 21 13"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Inner nest cradle */}
          <path
            d="M6 15C7.2 17.2 9.5 18.5 12 18.5C14.5 18.5 16.8 17.2 18 15"
            stroke="#a7f3d0"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Center athletic core ball / star */}
          <circle cx="12" cy="9" r="4.5" fill="#ffffff" />
          <path
            d="M12 5.5V12.5M8.5 9H15.5"
            stroke="#059669"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Dynamic wing flare */}
          <path
            d="M12 2L13.2 4.5H10.8L12 2Z"
            fill="#facc15"
          />
        </svg>
      </div>

      {/* Brand Text Typography */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 800,
              fontSize: size === "sm" ? "1.1rem" : size === "lg" ? "1.65rem" : "1.35rem",
              letterSpacing: "-0.03em",
              color: theme === "light" ? "#ffffff" : "#0f172a",
            }}
          >
            sports<span style={{ color: "#10b981" }}>nest</span>
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: size === "sm" ? "0.6rem" : "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme === "light" ? "#94a3b8" : "#64748b",
              marginTop: "2px",
            }}
          >
            SPORTS ARENA
          </span>
        )}
      </div>
    </div>
  );
};

export default SportsNestLogo;
