export interface SportCinematicMeta {
  badge: string;
  synopsis: string;
  bannerImage: string;
  posterImage: string;
  surface: string;
  players: string;
  format: string;
  accentColor: string;
}

export const SPORT_CINEMATIC_MAP: Record<string, SportCinematicMeta> = {
  cricket: {
    badge: "T20 & LEAGUE TOURNAMENTS",
    synopsis:
      "Experience high-voltage 22-yard rivalries, boundary blitzes, and strategic death overs under floodlit stadium atmospheres. Compete in premier knockout cups, track live net run rates, and lead your squad to championship glory.",
    bannerImage:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?q=80&w=800&auto=format&fit=crop",
    surface: "Turf Oval & 22-Yard Pitch",
    players: "11 a Side",
    format: "T20 / 50 Over Knockout",
    accentColor: "#10b981",
  },
  football: {
    badge: "FIFA REGULATION FIELD",
    synopsis:
      "Fast-paced tactical pitch mastery featuring 11-a-side intense clashes, lightning counter-attacks, and championship drama on floodlit hybrid natural grass pitches.",
    bannerImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    surface: "Hybrid Natural Grass Pitch",
    players: "11 a Side",
    format: "90 Min Knockout & League",
    accentColor: "#22c55e",
  },
  soccer: {
    badge: "FIFA REGULATION FIELD",
    synopsis:
      "Fast-paced tactical pitch mastery featuring 11-a-side intense clashes, lightning counter-attacks, and championship drama on floodlit hybrid natural grass pitches.",
    bannerImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    surface: "Hybrid Natural Grass Pitch",
    players: "11 a Side",
    format: "90 Min Knockout & League",
    accentColor: "#22c55e",
  },
  basketball: {
    badge: "PRO HARDWOOD ARENA",
    synopsis:
      "High-flying rim attacks, precision transition offense, and buzzer-beating intensity across polished maple hardwood courts. 5v5 full-court league play with live quarter breakdowns.",
    bannerImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=800&auto=format&fit=crop",
    surface: "Polished Maple Hardwood",
    players: "5 a Side",
    format: "4x10 Min Quarters",
    accentColor: "#f59e0b",
  },
  tennis: {
    badge: "GRAND SLAM CIRCUIT",
    synopsis:
      "Precision baseline battles, 130mph aces, and grand slam intensity on premier hardcourts and championship clay arenas. Compete in singles and doubles knockout draws.",
    bannerImage:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop",
    surface: "Championship Hardcourt",
    players: "Singles / Doubles",
    format: "Best of 3 / 5 Sets",
    accentColor: "#38bdf8",
  },
  kabaddi: {
    badge: "PRO MAT ARENA",
    synopsis:
      "Electrifying cant raids, bone-jarring tackles, and high-stakes super tackles inside regulation synthetic mat arenas. Uncompromising team strategy and breath control under high tension.",
    bannerImage:
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    surface: "Synthetic Pro Mat",
    players: "7 a Side",
    format: "2 x 20 Min Halves",
    accentColor: "#ec4899",
  },
  badminton: {
    badge: "OLYMPIC INDOOR COURT",
    synopsis:
      "Lightning-quick 400km/h smashes, deception drops, and athletic court coverage on championship indoor synthetic taraflex courts with world-class illumination.",
    bannerImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1613918431703-aa6321a4f783?q=80&w=800&auto=format&fit=crop",
    surface: "Synthetic Taraflex Court",
    players: "Singles / Doubles",
    format: "Best of 3 Games (21 Pts)",
    accentColor: "#a855f7",
  },
  volleyball: {
    badge: "PRO NET ARENA",
    synopsis:
      "Sky-scraping spikes, defensive diving digs, and high-energy rallies over the regulation net in championship indoor and sand arenas. Team coordination at its peak.",
    bannerImage:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      "https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=800&auto=format&fit=crop",
    surface: "Indoor Hardcourt / Sand",
    players: "6 a Side",
    format: "Best of 5 Sets (25 Pts)",
    accentColor: "#06b6d4",
  },
};

export function getSportCinematicMeta(sportName: string, customImage?: string): SportCinematicMeta {
  const key = (sportName || "").toLowerCase().trim();
  const found = SPORT_CINEMATIC_MAP[key];

  if (found) {
    return {
      ...found,
      bannerImage: customImage || found.bannerImage,
      posterImage: customImage || found.posterImage,
    };
  }

  // Fallback for any other sport from Supabase
  return {
    badge: "ARENASYNC TOURNAMENT",
    synopsis: `Compete in sanctioned tournaments for ${sportName}. Organize teams, track live standings, and battle through elimination brackets on professional grounds.`,
    bannerImage:
      customImage ||
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1800&auto=format&fit=crop",
    posterImage:
      customImage ||
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    surface: "Championship Ground",
    players: "Official Squad",
    format: "Tournament League",
    accentColor: "#10b981",
  };
}
