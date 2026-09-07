import React from "react";

interface Sport3DAssetProps {
  sportName: string;
  size?: number;
  className?: string;
}

/**
 * High-definition 3D rendered sports equipment with realistic specular highlights,
 * textures, and depth shadows.
 */
export const Sport3DAsset: React.FC<Sport3DAssetProps> = ({
  sportName,
  size = 200,
  className = "",
}) => {
  const norm = (sportName || "").toLowerCase().trim();

  // 1. SOCCER / FOOTBALL
  if (norm.includes("soccer") || norm.includes("foot")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="soccerSphere" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f1f5f9" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>
          <radialGradient id="patchGrad" cx="30%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>
          <filter id="soccerShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base Sphere */}
        <circle cx="100" cy="100" r="88" fill="url(#soccerSphere)" />

        {/* Pentagons & Hexagons */}
        {/* Center Pentagon */}
        <polygon
          points="100,68 126,86 116,118 84,118 74,86"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* Top patch */}
        <polygon
          points="100,16 114,36 86,36"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="100" y1="36" x2="100" y2="68" stroke="#94a3b8" strokeWidth="2" />

        {/* Top-Right patch */}
        <polygon
          points="162,48 174,75 148,82 136,58"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="126" y1="86" x2="148" y2="82" stroke="#94a3b8" strokeWidth="2" />

        {/* Bottom-Right patch */}
        <polygon
          points="148,150 162,122 138,124 126,145"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="116" y1="118" x2="138" y2="124" stroke="#94a3b8" strokeWidth="2" />

        {/* Bottom-Left patch */}
        <polygon
          points="52,150 38,122 62,124 74,145"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="84" y1="118" x2="62" y2="124" stroke="#94a3b8" strokeWidth="2" />

        {/* Top-Left patch */}
        <polygon
          points="38,48 26,75 52,82 64,58"
          fill="url(#patchGrad)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="74" y1="86" x2="52" y2="82" stroke="#94a3b8" strokeWidth="2" />

        {/* Specular Glare */}
        <ellipse cx="68" cy="52" rx="28" ry="16" fill="#ffffff" fillOpacity="0.45" transform="rotate(-30 68 52)" />
      </svg>
    );
  }

  // 2. BASKETBALL
  if (norm.includes("basket")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bballGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="35%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>
        </defs>

        {/* Basketball base */}
        <circle cx="100" cy="100" r="88" fill="url(#bballGrad)" />

        {/* Black Recessed Ribs */}
        {/* Horizontal & Vertical crossing */}
        <line x1="12" y1="100" x2="188" y2="100" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="12" x2="100" y2="188" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />

        {/* Curved Left Rib */}
        <path
          d="M 40 24 C 75 60 75 140 40 176"
          fill="none"
          stroke="#1c1917"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Curved Right Rib */}
        <path
          d="M 160 24 C 125 60 125 140 160 176"
          fill="none"
          stroke="#1c1917"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Specular Highlight */}
        <ellipse cx="65" cy="55" rx="30" ry="18" fill="#ffffff" fillOpacity="0.35" transform="rotate(-30 65 55)" />
      </svg>
    );
  }

  // 3. TENNIS
  if (norm.includes("tennis") && !norm.includes("table")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="tennisGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="45%" stopColor="#bef264" />
            <stop offset="75%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="88" fill="url(#tennisGrad)" />

        {/* Tennis Ball Curved Seams */}
        <path
          d="M 32 60 C 95 65 135 105 140 168"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M 60 168 C 65 105 105 65 168 32"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Felt texture sheen */}
        <ellipse cx="65" cy="55" rx="28" ry="16" fill="#ffffff" fillOpacity="0.4" transform="rotate(-25 65 55)" />
      </svg>
    );
  }

  // 4. CRICKET
  if (norm.includes("cricket")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cricketGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="88" fill="url(#cricketGrad)" />

        {/* Cricket White Seam (Raised stitched equator) */}
        <line x1="12" y1="100" x2="188" y2="100" stroke="#ffffff" strokeWidth="4" strokeDasharray="3 2" />
        <line x1="12" y1="96" x2="188" y2="96" stroke="#fecaca" strokeWidth="1" />
        <line x1="12" y1="104" x2="188" y2="104" stroke="#fecaca" strokeWidth="1" />

        {/* Golden Maker Stamp */}
        <circle cx="100" cy="65" r="14" fill="none" stroke="#fef08a" strokeWidth="2" strokeOpacity="0.8" />
        <text x="100" y="69" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold">PRO</text>

        {/* Glossy Lacquer Glare */}
        <ellipse cx="65" cy="45" rx="30" ry="16" fill="#ffffff" fillOpacity="0.45" transform="rotate(-20 65 45)" />
      </svg>
    );
  }

  // 5. KABADDI
  if (norm.includes("kabaddi")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="kabaddiShield" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>

        {/* Shield shape */}
        <path
          d="M 100 16 L 172 48 C 172 120 135 168 100 188 C 65 168 28 120 28 48 Z"
          fill="url(#kabaddiShield)"
          stroke="#fef3c7"
          strokeWidth="3.5"
        />

        {/* Inner Shield Border */}
        <path
          d="M 100 32 L 158 58 C 158 116 128 154 100 172 C 72 154 42 116 42 58 Z"
          fill="none"
          stroke="#fde68a"
          strokeWidth="2"
          strokeOpacity="0.6"
        />

        {/* Clashing Arm / Raider Icon */}
        <text x="100" y="112" textAnchor="middle" fontSize="48" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))">
          🤼
        </text>
        <text x="100" y="148" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="2">
          RAIDER
        </text>
      </svg>
    );
  }

  // 6. VOLLEYBALL
  if (norm.includes("volley")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vballShine" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="88" fill="#1e40af" />

        {/* Swirling Tri-Color Panels (Blue, Yellow, White Mikasa Style) */}
        <path d="M 100 12 C 145 35 155 85 130 130 L 100 100 Z" fill="#eab308" stroke="#0f172a" strokeWidth="2" />
        <path d="M 188 100 C 165 145 115 155 70 130 L 100 100 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        <path d="M 100 188 C 55 165 45 115 70 70 L 100 100 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" />
        <path d="M 12 100 C 35 55 85 45 130 70 L 100 100 Z" fill="#facc15" stroke="#0f172a" strokeWidth="2" />

        {/* 3D Sphere Overlay */}
        <circle cx="100" cy="100" r="88" fill="url(#vballShine)" />
        <ellipse cx="65" cy="50" rx="26" ry="14" fill="#ffffff" fillOpacity="0.4" transform="rotate(-30 65 50)" />
      </svg>
    );
  }

  // 7. HOCKEY
  if (norm.includes("hockey")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hockeySphere" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>
        </defs>

        {/* Hockey Dimpled Ball */}
        <circle cx="100" cy="100" r="88" fill="url(#hockeySphere)" />

        {/* Surface Dimples */}
        {[
          [70, 60], [100, 50], [130, 60],
          [55, 90], [85, 85], [115, 85], [145, 90],
          [70, 120], [100, 115], [130, 120],
          [85, 145], [115, 145]
        ].map(([x, y], idx) => (
          <circle key={idx} cx={x} cy={y} r="5" fill="#94a3b8" fillOpacity="0.4" stroke="#e2e8f0" strokeWidth="1" />
        ))}

        <ellipse cx="65" cy="45" rx="28" ry="16" fill="#ffffff" fillOpacity="0.5" transform="rotate(-25 65 45)" />
      </svg>
    );
  }

  // 8. BADMINTON
  if (norm.includes("badminton")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="corkGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
        </defs>

        {/* Shuttlecock Feathers (spread) */}
        <path
          d="M 50 40 L 88 120 L 112 120 L 150 40 C 130 35 70 35 50 40 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* Individual Feather Lines */}
        {[-35, -20, -7, 7, 20, 35].map((angle, idx) => (
          <line
            key={idx}
            x1="100"
            y1="120"
            x2={100 + angle * 1.3}
            y2="40"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        ))}

        {/* Rib rings tying feathers together */}
        <path d="M 68 70 Q 100 82 132 70" fill="none" stroke="#64748b" strokeWidth="2.5" />
        <path d="M 78 95 Q 100 105 122 95" fill="none" stroke="#64748b" strokeWidth="2.5" />

        {/* Cork Base (Dome at bottom) */}
        <path
          d="M 82 120 Q 100 115 118 120 Q 126 155 100 162 Q 74 155 82 120 Z"
          fill="url(#corkGrad)"
          stroke="#64748b"
          strokeWidth="2"
        />
        {/* Red Ribbon on Cork */}
        <path d="M 82 124 Q 100 120 118 124" stroke="#ef4444" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  // 9. TABLE TENNIS
  if (norm.includes("table") || norm.includes("ping")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="pingGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#ffedd5" />
            <stop offset="85%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="88" fill="url(#pingGrad)" />

        {/* ITTF 40+ Stamp */}
        <text x="100" y="96" textAnchor="middle" fill="#ea580c" fontSize="12" fontWeight="900" opacity="0.85">
          ★ ★ ★
        </text>
        <text x="100" y="114" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="bold" opacity="0.85">
          ITTF 40+
        </text>

        {/* Crisp Specular Glare */}
        <ellipse cx="65" cy="50" rx="26" ry="15" fill="#ffffff" fillOpacity="0.6" transform="rotate(-30 65 50)" />
      </svg>
    );
  }

  // 10. SWIMMING / AQUATICS
  if (norm.includes("swim") || norm.includes("aqua")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`sport-3d-ball ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="swimMedal" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="88" fill="url(#swimMedal)" stroke="#7dd3fc" strokeWidth="4" />

        {/* Wave and Swimmer Icon */}
        <text x="100" y="105" textAnchor="middle" fontSize="56" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.4))">
          🏊
        </text>

        {/* Water Ripple Rings */}
        <circle cx="100" cy="100" r="68" fill="none" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.6" />
        <ellipse cx="65" cy="50" rx="25" ry="14" fill="#ffffff" fillOpacity="0.45" transform="rotate(-30 65 50)" />
      </svg>
    );
  }

  // DEFAULT
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #a855f7 0%, #6b21a8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        color: "#fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}
      className={className}
    >
      🏆
    </div>
  );
};

export default Sport3DAsset;
