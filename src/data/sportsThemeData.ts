export interface SportThemeConfig {
  id: number;
  name: string;
  monogram: string; // The giant curved letter in the center
  splitLeft: string; // Left wordmark (e.g. "S O C")
  splitRight: string; // Right wordmark (e.g. "C E R")
  category: string; // Top-Left tag
  surface: string; // Ground type
  format: string; // Match format
  rules: string; // Regulation note
  accentColor: string; // Monogram & highlight color
  icon: string;
}

export const SPORTS_THEME_MAP: Record<string, SportThemeConfig> = {
  soccer: {
    id: 1,
    name: "Soccer",
    monogram: "S",
    splitLeft: "F O O",
    splitRight: "B A L L",
    category: "Outdoor Field",
    surface: "Natural Grass Pitch",
    format: "11 vs 11 Knockout",
    rules: "FIFA Regulation 90 Min",
    accentColor: "#9266cc", // Purple like in the reference
    icon: "⚽",
  },
  basketball: {
    id: 2,
    name: "Basketball",
    monogram: "B",
    splitLeft: "B A S",
    splitRight: "K E T",
    category: "Indoor Arena",
    surface: "Polished Hardwood Court",
    format: "5 vs 5 Full Court",
    rules: "FIBA 4x10 Min Quarters",
    accentColor: "#ea580c",
    icon: "🏀",
  },
  tennis: {
    id: 3,
    name: "Tennis",
    monogram: "T",
    splitLeft: "T E N",
    splitRight: "N I S",
    category: "Racquet Club",
    surface: "Grand Slam Hardcourt",
    format: "Singles & Doubles",
    rules: "Best of 3 / 5 Sets",
    accentColor: "#84cc16",
    icon: "🎾",
  },
  cricket: {
    id: 4,
    name: "Cricket",
    monogram: "C",
    splitLeft: "C R I",
    splitRight: "C K E T",
    category: "Oval Stadium",
    surface: "22-Yard Turf Pitch",
    format: "T20 Championship",
    rules: "ICC White Ball Standard",
    accentColor: "#dc2626",
    icon: "🏏",
  },
  kabaddi: {
    id: 5,
    name: "Kabaddi",
    monogram: "K",
    splitLeft: "K A B",
    splitRight: "A D D I",
    category: "Pro Combat Mat",
    surface: "13x10m Pro Synthetic Mat",
    format: "7 vs 7 Raid & Tackle",
    rules: "Pro Kabaddi League 40 Min",
    accentColor: "#d97706",
    icon: "🤼",
  },
  volleyball: {
    id: 6,
    name: "Volleyball",
    monogram: "V",
    splitLeft: "V O L",
    splitRight: "L E Y",
    category: "Indoor Court",
    surface: "Teraflex Synthetic Court",
    format: "6 vs 6 Rally System",
    rules: "FIVB Best of 5 Sets",
    accentColor: "#2563eb",
    icon: "🏐",
  },
  hockey: {
    id: 7,
    name: "Hockey",
    monogram: "H",
    splitLeft: "H O C",
    splitRight: "K E Y",
    category: "Water-Turf Field",
    surface: "Poligras Olympic Blue Turf",
    format: "11 vs 11 Field Hockey",
    rules: "FIH 4x15 Min Quarters",
    accentColor: "#0284c7",
    icon: "🏑",
  },
  badminton: {
    id: 8,
    name: "Badminton",
    monogram: "B",
    splitLeft: "B A D",
    splitRight: "M I N",
    category: "Indoor Arena",
    surface: "BWF Green Synthetic Mat",
    format: "Singles & Doubles",
    rules: "BWF 21-Point Rally",
    accentColor: "#10b981",
    icon: "🏸",
  },
  "table tennis": {
    id: 9,
    name: "Table Tennis",
    monogram: "P",
    splitLeft: "P I N",
    splitRight: "P O N G",
    category: "Fast Table Arena",
    surface: "ITTF Ultramarine Blue Table",
    format: "Singles Rapid Play",
    rules: "ITTF Best of 7 (11 Pts)",
    accentColor: "#f97316",
    icon: "🏓",
  },
  swimming: {
    id: 10,
    name: "Swimming",
    monogram: "A",
    splitLeft: "A Q U",
    splitRight: "A T I C",
    category: "Aquatic Center",
    surface: "50m Olympic 8-Lane Pool",
    format: "Individual & Relays",
    rules: "World Aquatics Standard",
    accentColor: "#06b6d4",
    icon: "🏊",
  },
};

export function getSportTheme(sportName: string): SportThemeConfig {
  const norm = (sportName || "").toLowerCase().trim();
  for (const [key, val] of Object.entries(SPORTS_THEME_MAP)) {
    if (norm.includes(key)) {
      return val;
    }
  }
  // Generic fallback
  const firstLetter = (sportName || "S").trim().charAt(0).toUpperCase();
  return {
    id: 99,
    name: sportName || "Sports",
    monogram: firstLetter || "S",
    splitLeft: (sportName || "ARE").slice(0, 3).toUpperCase().split("").join(" "),
    splitRight: (sportName || "NAS").slice(3, 7).toUpperCase().split("").join(" "),
    category: "Athletic Arena",
    surface: "Official Regulation Ground",
    format: "Tournament Knockout",
    rules: "Standard League Format",
    accentColor: "#9266cc",
    icon: "🏆",
  };
}
