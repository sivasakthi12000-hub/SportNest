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

const DEFAULT_SPORT_IMAGES: Record<string, string> = {
  soccer: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
  football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
  tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1600&auto=format&fit=crop",
  cricket: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop",
  kabaddi: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop",
  volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop",
  hockey: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1600&auto=format&fit=crop",
  badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop",
  "table tennis": "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=1600&auto=format&fit=crop",
  swimming: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop",
};

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
