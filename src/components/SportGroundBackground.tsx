import React from "react";

interface SportGroundBackgroundProps {
  sportName: string;
  className?: string;
  variant?: "showcase" | "card";
}

/**
 * Renders high-precision tactical sports grounds & arena markings:
 * Football pitch, Basketball hardwood, Tennis court, Cricket ground & pitch,
 * Kabaddi mat, Volleyball court, Hockey turf, Badminton court, Table Tennis, Swimming pool.
 */
export const SportGroundBackground: React.FC<SportGroundBackgroundProps> = ({
  sportName,
  className = "",
  variant = "showcase",
}) => {
  const norm = (sportName || "").toLowerCase().trim();

  // 1. SOCCER / FOOTBALL
  if (norm.includes("soccer") || norm.includes("foot")) {
    return (
      <div className={`ground-bg ground-soccer ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grassStripe" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.08)" />
              <stop offset="20%" stopColor="rgba(22, 163, 74, 0.15)" />
              <stop offset="40%" stopColor="rgba(34, 197, 94, 0.08)" />
              <stop offset="60%" stopColor="rgba(22, 163, 74, 0.15)" />
              <stop offset="80%" stopColor="rgba(34, 197, 94, 0.08)" />
              <stop offset="100%" stopColor="rgba(22, 163, 74, 0.15)" />
            </linearGradient>
            <pattern id="turfPattern" width="100" height="600" patternUnits="userSpaceOnUse">
              <rect width="50" height="600" fill="rgba(255, 255, 255, 0.02)" />
              <rect x="50" width="50" height="600" fill="rgba(0, 0, 0, 0.04)" />
            </pattern>
          </defs>

          {/* Grass Field Overlay */}
          <rect width="1000" height="600" fill="url(#turfPattern)" />

          {/* Boundary touchlines */}
          <rect
            x="40"
            y="30"
            width="920"
            height="540"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.4"
          />

          {/* Halfway Line */}
          <line
            x1="500"
            y1="30"
            x2="500"
            y2="570"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.5"
          />

          {/* Center Circle & Spot */}
          <circle
            cx="500"
            cy="300"
            r="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.45"
          />
          <circle cx="500" cy="300" r="6" fill="currentColor" fillOpacity="0.6" />

          {/* Left Penalty Area (18-yard box) */}
          <rect
            x="40"
            y="140"
            width="160"
            height="320"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Left Goal Area (6-yard box) */}
          <rect
            x="40"
            y="210"
            width="60"
            height="180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.3"
          />
          {/* Left Penalty Arc & Spot */}
          <path
            d="M 200 230 A 85 85 0 0 1 200 370"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.35"
          />
          <circle cx="150" cy="300" r="5" fill="currentColor" fillOpacity="0.5" />

          {/* Right Penalty Area */}
          <rect
            x="800"
            y="140"
            width="160"
            height="320"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Right Goal Area */}
          <rect
            x="900"
            y="210"
            width="60"
            height="180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.3"
          />
          {/* Right Penalty Arc & Spot */}
          <path
            d="M 800 230 A 85 85 0 0 0 800 370"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.35"
          />
          <circle cx="850" cy="300" r="5" fill="currentColor" fillOpacity="0.5" />

          {/* Corner Arcs */}
          <path d="M 40 55 A 25 25 0 0 0 65 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
          <path d="M 40 545 A 25 25 0 0 1 65 570" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
          <path d="M 960 55 A 25 25 0 0 1 935 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
          <path d="M 960 545 A 25 25 0 0 0 935 570" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
        </svg>
      </div>
    );
  }

  // 2. BASKETBALL
  if (norm.includes("basket")) {
    return (
      <div className={`ground-bg ground-basketball ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="woodPlanks" width="30" height="600" patternUnits="userSpaceOnUse">
              <rect width="28" height="600" fill="rgba(217, 119, 6, 0.04)" />
              <line x1="29" y1="0" x2="29" y2="600" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="600" fill="url(#woodPlanks)" />

          {/* Court Perimeter */}
          <rect
            x="40"
            y="30"
            width="920"
            height="540"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />

          {/* Center Court Line & Circle */}
          <line
            x1="500"
            y1="30"
            x2="500"
            y2="570"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.5"
          />
          <circle
            cx="500"
            cy="300"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.45"
          />

          {/* Left Three-Point Arc */}
          <path
            d="M 40 90 L 140 90 A 240 240 0 0 1 140 510 L 40 510"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Left Key / Paint Area */}
          <rect
            x="40"
            y="190"
            width="190"
            height="220"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.4"
          />
          {/* Left Free Throw Circle */}
          <circle
            cx="230"
            cy="300"
            r="65"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Left Hoop & Backboard */}
          <line x1="75" y1="260" x2="75" y2="340" stroke="currentColor" strokeWidth="4" strokeOpacity="0.6" />
          <circle cx="95" cy="300" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.6" />

          {/* Right Three-Point Arc */}
          <path
            d="M 960 90 L 860 90 A 240 240 0 0 0 860 510 L 960 510"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Right Key / Paint */}
          <rect
            x="770"
            y="190"
            width="190"
            height="220"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.4"
          />
          {/* Right Free Throw Circle */}
          <circle
            cx="770"
            cy="300"
            r="65"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          {/* Right Hoop */}
          <line x1="925" y1="260" x2="925" y2="340" stroke="currentColor" strokeWidth="4" strokeOpacity="0.6" />
          <circle cx="905" cy="300" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.6" />
        </svg>
      </div>
    );
  }

  // 3. TENNIS
  if (norm.includes("tennis") && !norm.includes("table")) {
    return (
      <div className={`ground-bg ground-tennis ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Court */}
          <rect
            x="50"
            y="60"
            width="900"
            height="480"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />

          {/* Singles Sidelines (Tramlines) */}
          <line x1="50" y1="120" x2="950" y2="120" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />
          <line x1="50" y1="480" x2="950" y2="480" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />

          {/* Service Lines */}
          <line x1="280" y1="120" x2="280" y2="480" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />
          <line x1="720" y1="120" x2="720" y2="480" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />

          {/* Center Service Line */}
          <line x1="280" y1="300" x2="720" y2="300" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />

          {/* Baseline Center Marks */}
          <line x1="50" y1="300" x2="70" y2="300" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
          <line x1="930" y1="300" x2="950" y2="300" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />

          {/* Center Net (down the exact middle) */}
          <line
            x1="500"
            y1="40"
            x2="500"
            y2="560"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="4 3"
            strokeOpacity="0.6"
          />
          <circle cx="500" cy="40" r="5" fill="currentColor" fillOpacity="0.7" />
          <circle cx="500" cy="560" r="5" fill="currentColor" fillOpacity="0.7" />
        </svg>
      </div>
    );
  }

  // 4. CRICKET
  if (norm.includes("cricket")) {
    return (
      <div className={`ground-bg ground-cricket ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Oval Boundary */}
          <ellipse
            cx="500"
            cy="300"
            rx="460"
            ry="270"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />

          {/* 30-Yard Inner Circle */}
          <ellipse
            cx="500"
            cy="300"
            rx="300"
            ry="180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeOpacity="0.35"
          />

          {/* The 22-Yard Rectangular Pitch Strip */}
          <rect
            x="440"
            y="160"
            width="120"
            height="280"
            rx="4"
            fill="rgba(217, 119, 6, 0.08)"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.45"
          />

          {/* Bowling Crease & Stumps (Top End) */}
          <line x1="420" y1="200" x2="580" y2="200" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.5" />
          <line x1="435" y1="220" x2="565" y2="220" stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" />
          <circle cx="485" cy="200" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="500" cy="200" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="515" cy="200" r="3" fill="currentColor" fillOpacity="0.8" />

          {/* Bowling Crease & Stumps (Bottom End) */}
          <line x1="420" y1="400" x2="580" y2="400" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.5" />
          <line x1="435" y1="380" x2="565" y2="380" stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" />
          <circle cx="485" cy="400" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="500" cy="400" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="515" cy="400" r="3" fill="currentColor" fillOpacity="0.8" />

          {/* Pitch Midline */}
          <line x1="440" y1="300" x2="560" y2="300" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.3" />
        </svg>
      </div>
    );
  }

  // 5. KABADDI
  if (norm.includes("kabaddi")) {
    return (
      <div className={`ground-bg ground-kabaddi ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mat Boundary (13m x 10m) */}
          <rect
            x="50"
            y="50"
            width="900"
            height="500"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.45"
          />

          {/* Side Lobbies (1m wide each) */}
          <line x1="50" y1="110" x2="950" y2="110" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
          <line x1="50" y1="490" x2="950" y2="490" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />

          {/* Midline dividing courts */}
          <line
            x1="500"
            y1="50"
            x2="500"
            y2="550"
            stroke="currentColor"
            strokeWidth="4"
            strokeOpacity="0.65"
          />

          {/* Left Court Baulk Line (3.75m from midline) */}
          <line x1="330" y1="110" x2="330" y2="490" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />
          {/* Left Court Bonus Line (1m from baulk line) */}
          <line
            x1="260"
            y1="110"
            x2="260"
            y2="490"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeOpacity="0.45"
          />

          {/* Right Court Baulk Line */}
          <line x1="670" y1="110" x2="670" y2="490" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />
          {/* Right Court Bonus Line */}
          <line
            x1="740"
            y1="110"
            x2="740"
            y2="490"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeOpacity="0.45"
          />
        </svg>
      </div>
    );
  }

  // 6. VOLLEYBALL
  if (norm.includes("volley")) {
    return (
      <div className={`ground-bg ground-volleyball ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 18m x 9m Court */}
          <rect
            x="60"
            y="80"
            width="880"
            height="440"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.45"
          />

          {/* Attack Line (3m line - Left) */}
          <line x1="320" y1="80" x2="320" y2="520" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />

          {/* Attack Line (3m line - Right) */}
          <line x1="680" y1="80" x2="680" y2="520" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />

          {/* Center Net (down middle) */}
          <line
            x1="500"
            y1="50"
            x2="500"
            y2="550"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="5 3"
            strokeOpacity="0.65"
          />
          <circle cx="500" cy="50" r="6" fill="currentColor" fillOpacity="0.7" />
          <circle cx="500" cy="550" r="6" fill="currentColor" fillOpacity="0.7" />
        </svg>
      </div>
    );
  }

  // 7. HOCKEY
  if (norm.includes("hockey")) {
    return (
      <div className={`ground-bg ground-hockey ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hockey Field Perimeter */}
          <rect
            x="40"
            y="40"
            width="920"
            height="520"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />

          {/* Center Line */}
          <line x1="500" y1="40" x2="500" y2="560" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
          <circle cx="500" cy="300" r="5" fill="currentColor" fillOpacity="0.6" />

          {/* 23m Lines */}
          <line x1="270" y1="40" x2="270" y2="560" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.35" />
          <line x1="730" y1="40" x2="730" y2="560" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.35" />

          {/* Left Striking Circle (Shooting D) */}
          <path
            d="M 40 180 L 140 180 A 120 120 0 0 1 140 420 L 40 420"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          <circle cx="105" cy="300" r="4" fill="currentColor" fillOpacity="0.5" />

          {/* Right Striking Circle (Shooting D) */}
          <path
            d="M 960 180 L 860 180 A 120 120 0 0 0 860 420 L 960 420"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.35"
          />
          <circle cx="895" cy="300" r="4" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    );
  }

  // 8. BADMINTON
  if (norm.includes("badminton")) {
    return (
      <div className={`ground-bg ground-badminton ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Doubles Boundary */}
          <rect
            x="50"
            y="60"
            width="900"
            height="480"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.45"
          />

          {/* Singles Side Lines (inside doubles) */}
          <line x1="50" y1="100" x2="950" y2="100" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
          <line x1="50" y1="500" x2="950" y2="500" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />

          {/* Doubles Back Service Lines */}
          <line x1="110" y1="60" x2="110" y2="540" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
          <line x1="890" y1="60" x2="890" y2="540" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />

          {/* Short Service Lines (near net) */}
          <line x1="360" y1="60" x2="360" y2="540" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="640" y1="60" x2="640" y2="540" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />

          {/* Center Service Line */}
          <line x1="50" y1="300" x2="360" y2="300" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
          <line x1="640" y1="300" x2="950" y2="300" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />

          {/* Center Net */}
          <line
            x1="500"
            y1="40"
            x2="500"
            y2="560"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="4 3"
            strokeOpacity="0.65"
          />
        </svg>
      </div>
    );
  }

  // 9. TABLE TENNIS
  if (norm.includes("table") || norm.includes("ping")) {
    return (
      <div className={`ground-bg ground-tabletennis ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Table Top Surface */}
          <rect
            x="60"
            y="70"
            width="880"
            height="460"
            rx="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeOpacity="0.5"
          />

          {/* White Center Line dividing table */}
          <line
            x1="60"
            y1="300"
            x2="940"
            y2="300"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.4"
          />

          {/* Center Net running vertically across the center */}
          <line
            x1="500"
            y1="45"
            x2="500"
            y2="555"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray="6 3"
            strokeOpacity="0.7"
          />
          <circle cx="500" cy="45" r="5" fill="currentColor" fillOpacity="0.8" />
          <circle cx="500" cy="555" r="5" fill="currentColor" fillOpacity="0.8" />
        </svg>
      </div>
    );
  }

  // 10. SWIMMING / AQUATICS
  if (norm.includes("swim") || norm.includes("water") || norm.includes("aqua")) {
    return (
      <div className={`ground-bg ground-swimming ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          className="ground-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 50m Pool Basin */}
          <rect
            x="40"
            y="50"
            width="920"
            height="500"
            rx="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />

          {/* 8 Swimming Lanes */}
          {[112, 174, 236, 300, 362, 424, 486].map((y, idx) => (
            <line
              key={idx}
              x1="40"
              y1={y}
              x2="960"
              y2={y}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="10 6"
              strokeOpacity="0.35"
            />
          ))}

          {/* Starting Blocks (Left Side) */}
          {[80, 142, 205, 268, 331, 393, 455, 518].map((y, idx) => (
            <rect
              key={`block-${idx}`}
              x="20"
              y={y - 12}
              width="18"
              height="24"
              rx="3"
              fill="currentColor"
              fillOpacity="0.5"
            />
          ))}

          {/* 15m & 25m Turn Markers */}
          <line x1="220" y1="50" x2="220" y2="550" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.25" />
          <line x1="500" y1="50" x2="500" y2="550" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="780" y1="50" x2="780" y2="550" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.25" />
        </svg>
      </div>
    );
  }

  // DEFAULT / GENERAL MULTI-SPORT STADIUM
  return (
    <div className={`ground-bg ground-default ${className}`}>
      <svg
        viewBox="0 0 1000 600"
        className="ground-svg"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="500"
          cy="300"
          rx="450"
          ry="260"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.35"
        />
        <line x1="500" y1="40" x2="500" y2="560" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />
        <circle cx="500" cy="300" r="90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />
      </svg>
    </div>
  );
};

export default SportGroundBackground;
