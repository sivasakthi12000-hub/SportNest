/**
 * Dynamic Visual Theme & Arena Photography Helpers
 * Dynamically resolves photography, color palettes, and stadium visual styles
 * for sports fetched from Supabase. No hardcoded database tournament arrays.
 */

export interface SportThemeConfig {
  id: number;
  name: string;
  monogram: string;
  splitLeft: string;
  splitRight: string;
  category: string;
  surface: string;
  format: string;
  rules: string;
  accentColor: string;
  icon: string;
}

export const SPORT_GROUND_ASSETS: Record<string, string> = {
  soccer: "/src/assets/images/soccer_pitch_ground_1790617926895.jpg",
  football: "/src/assets/images/soccer_pitch_ground_1790617926895.jpg",
  basketball: "/src/assets/images/basketball_court_ground_1790617938397.jpg",
  tennis: "/src/assets/images/tennis_court_ground_1790617949689.jpg",
  cricket: "/src/assets/images/cricket_pitch_ground_1790617963173.jpg",
  volleyball: "/src/assets/images/volleyball_court_ground_1790617974030.jpg",
  badminton: "/src/assets/images/volleyball_court_ground_1790617974030.jpg",
  kabaddi: "/src/assets/images/volleyball_court_ground_1790617974030.jpg",
  hockey: "/src/assets/images/soccer_pitch_ground_1790617926895.jpg",
  futsal: "/src/assets/images/soccer_pitch_ground_1790617926895.jpg",
};

const DEFAULT_SPORT_IMAGES: Record<string, string> = {
  ...SPORT_GROUND_ASSETS,
  "table tennis": "/src/assets/images/tennis_court_ground_1790617949689.jpg",
  swimming: "/src/assets/images/volleyball_court_ground_1790617974030.jpg",
};

export const SPORT_PITCH_METAS: Record<
  string,
  {
    headline: string;
    subheadline: string;
    quote: string;
    groundName: string;
    surfaceBadge: string;
    accentColor: string;
    badgeBg: string;
  }
> = {
  soccer: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY FIELD TELLS A STORY",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "105m × 68m FIFA Natural Grass Pitch",
    surfaceBadge: "🌱 Natural Grass Pitch",
    accentColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.2)",
  },
  football: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY FIELD TELLS A STORY",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "105m × 68m FIFA Natural Grass Pitch",
    surfaceBadge: "🌱 Natural Grass Pitch",
    accentColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.2)",
  },
  basketball: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY COURT HAS ITS RHYTHM",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "28m × 15m Polished Hardwood Parquet",
    surfaceBadge: "🪵 Hardwood Parquet",
    accentColor: "#f97316",
    badgeBg: "rgba(249, 115, 22, 0.2)",
  },
  tennis: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY BOUNCE DEMANDS PRECISION",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "23.77m × 8.23m Championship Clay Court",
    surfaceBadge: "🎾 Terracotta Clay Court",
    accentColor: "#eab308",
    badgeBg: "rgba(234, 179, 8, 0.2)",
  },
  cricket: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY PITCH CARRIES GLORY",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "22-Yard Curated Clay Pitch & Oval Outfield",
    surfaceBadge: "🏏 22-Yard Turf Wicket",
    accentColor: "#0ea5e9",
    badgeBg: "rgba(14, 165, 233, 0.2)",
  },
  volleyball: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY SPIKE DEFIES GRAVITY",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "18m × 9m FIVB Elastic Taraflex Court",
    surfaceBadge: "🏐 Elastic Taraflex Surface",
    accentColor: "#ec4899",
    badgeBg: "rgba(236, 72, 153, 0.2)",
  },
  badminton: {
    headline: "BOUNCE THAT LIFTS",
    subheadline: "EVERY SHUTTLE FLIES TRUE",
    quote: "Every court, every track, every field tells a different story. Each sport has its own rules, its own rhythm, its own kicks.",
    groundName: "13.4m × 6.1m BWF Synthetic Mat",
    surfaceBadge: "🏸 BWF Non-Slip Synthetic Mat",
    accentColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.2)",
  },
};

export function getSportPitchMeta(sportName?: string) {
  const key = String(sportName || "").toLowerCase().trim();
  const base = SPORT_PITCH_METAS[key] || SPORT_PITCH_METAS.soccer;
  const groundImage = getSportGroundImage(sportName);
  return {
    ...base,
    groundImage,
  };
}

export const SPORT_ICONS_MAP: Record<string, string> = {
  soccer: "⚽",
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  cricket: "🏏",
  kabaddi: "🤼",
  volleyball: "🏐",
  hockey: "🏑",
  badminton: "🏸",
  "table tennis": "🏓",
  swimming: "🏊",
};

export function getSportGroundImage(sportName?: string, customImage?: string): string {
  if (customImage && typeof customImage === "string" && customImage.startsWith("http")) {
    return customImage;
  }
  const key = String(sportName || "").toLowerCase().trim();
  return DEFAULT_SPORT_IMAGES[key] || DEFAULT_SPORT_IMAGES.soccer;
}

export function getRealSportGround(
  sportNameOrId: string | number,
  customImage?: string
): { groundImage: string; stadiumName: string; surfaceDescription: string } {
  const name = typeof sportNameOrId === "string" ? sportNameOrId : String(sportNameOrId);
  const groundImage = getSportGroundImage(name, customImage);
  return {
    groundImage,
    stadiumName: `${name || "Championship"} Arena`,
    surfaceDescription: "Regulation Sports Surface",
  };
}

export function getTournamentVisual(
  tournament: any,
  sportNameOrId?: string | number
): { imageUrl: string; isCustom: boolean; groundName: string } {
  const t = tournament || {};

  const candidates = [
    t.banner,
    t.bannerUrl,
    t.banner_url,
    t.image,
    t.imageUrl,
    t.image_url,
    t.poster,
    t.posterImage,
    t.poster_url,
    t.logo,
    t.logoUrl,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim().startsWith("http")) {
      return {
        imageUrl: c.trim(),
        isCustom: true,
        groundName: t.groundName || t.ground_name || "Official Venue",
      };
    }
  }

  if (typeof t.description === "string" && t.description.length > 0) {
    const bannerMatch = t.description.match(/\[banner:(https?:\/\/[^\]]+)\]/i);
    if (bannerMatch && bannerMatch[1]) {
      return {
        imageUrl: bannerMatch[1],
        isCustom: true,
        groundName: t.groundName || t.ground_name || "Official Venue",
      };
    }
  }

  const sName = typeof sportNameOrId === "string" ? sportNameOrId : "Sports";
  const groundImage = getSportGroundImage(sName);
  return {
    imageUrl: groundImage,
    isCustom: false,
    groundName: t.groundName || t.ground_name || `${sName} Stadium`,
  };
}

export function getSportTheme(sportName: string): SportThemeConfig {
  const cleanName = (sportName || "Sports").trim();
  const lower = cleanName.toLowerCase();
  const icon = SPORT_ICONS_MAP[lower] || "🏆";
  const monogram = cleanName.charAt(0).toUpperCase();

  const accentColors: Record<string, string> = {
    soccer: "#9266cc",
    football: "#9266cc",
    basketball: "#ea580c",
    tennis: "#84cc16",
    cricket: "#0284c7",
    kabaddi: "#d97706",
    volleyball: "#0d9488",
    hockey: "#dc2626",
    badminton: "#7c3aed",
    "table tennis": "#e11d48",
    swimming: "#0ea5e9",
  };

  const mid = Math.ceil(cleanName.length / 2);
  const left = cleanName.slice(0, mid).split("").join(" ").toUpperCase();
  const right = cleanName.slice(mid).split("").join(" ").toUpperCase();

  return {
    id: 1,
    name: cleanName,
    monogram,
    splitLeft: left,
    splitRight: right,
    category: "Championship League",
    surface: "Regulation Ground",
    format: "Tournament Knockout",
    rules: "Official Association Rules",
    accentColor: accentColors[lower] || "#059669",
    icon,
  };
}

export function getSportCinematicMeta(sportName: string, customImage?: string) {
  const name = (sportName || "Sports").trim();
  const image = getSportGroundImage(name, customImage);
  const theme = getSportTheme(name);

  return {
    name,
    image,
    posterImage: image,
    players: theme.format,
    accentColor: theme.accentColor,
    tagline: `Official ${name} Championships`,
    stadium: `${name} Arena`,
    surface: theme.surface,
    format: theme.format,
    icon: theme.icon,
  };
}
