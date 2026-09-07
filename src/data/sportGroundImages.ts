/**
 * Real playing ground & stadium photography images for each sport.
 * Hand-curated high-resolution images featuring authentic pitches, courts,
 * turfs, and arenas with realistic atmospheric lighting.
 */

export interface SportGroundAsset {
  sportId: number;
  sportName: string;
  groundImage: string;
  lightHalfImage?: string;
  darkHalfImage?: string;
  stadiumName: string;
  surfaceDescription: string;
}

export const REAL_SPORT_GROUNDS: Record<string, SportGroundAsset> = {
  soccer: {
    sportId: 1,
    sportName: "Soccer",
    groundImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Camp Nou / Wembley Stadium",
    surfaceDescription: "FIFA Standard Floodlit Grass Pitch",
  },
  football: {
    sportId: 1,
    sportName: "Soccer",
    groundImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Wembley International Pitch",
    surfaceDescription: "Hybrid Natural Turf Pitch",
  },
  basketball: {
    sportId: 2,
    sportName: "Basketball",
    groundImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Madison Square Garden Arena",
    surfaceDescription: "NBA Polished Maple Hardwood Court",
  },
  tennis: {
    sportId: 3,
    sportName: "Tennis",
    groundImage:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Arthur Ashe Stadium / Centre Court",
    surfaceDescription: "Championship Grand Slam Hardcourt",
  },
  cricket: {
    sportId: 4,
    sportName: "Cricket",
    groundImage:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Eden Gardens / Lord's Cricket Ground",
    surfaceDescription: "22-Yard Oval Turf & Boundary Ring",
  },
  kabaddi: {
    sportId: 5,
    sportName: "Kabaddi",
    groundImage:
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Thyagaraj Indoor Stadium",
    surfaceDescription: "13x10m Pro Kabaddi Interlocking Mat",
  },
  volleyball: {
    sportId: 6,
    sportName: "Volleyball",
    groundImage:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Ariake Volleyball Arena",
    surfaceDescription: "FIVB Indoor Teraflex Court & Net",
  },
  hockey: {
    sportId: 7,
    sportName: "Hockey",
    groundImage:
      "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Major Dhyan Chand National Stadium",
    surfaceDescription: "Olympic Poligras Blue Water-Turf",
  },
  badminton: {
    sportId: 8,
    sportName: "Badminton",
    groundImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Istora Senayan Arena",
    surfaceDescription: "BWF Regulation Green Synthetic Court",
  },
  "table tennis": {
    sportId: 9,
    sportName: "Table Tennis",
    groundImage:
      "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Tokyo Metropolitan Gymnasium",
    surfaceDescription: "ITTF Ultramarine Blue Tournament Table",
  },
  swimming: {
    sportId: 10,
    sportName: "Swimming",
    groundImage:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "Paris Olympic Aquatics Centre",
    surfaceDescription: "50m Olympic 8-Lane Competition Pool",
  },
};

/**
 * Returns real ground image for any sport name or sport ID.
 */
export function getRealSportGround(sportNameOrId: string | number): SportGroundAsset {
  const norm = String(sportNameOrId || "").toLowerCase().trim();

  // Match by name
  for (const [key, asset] of Object.entries(REAL_SPORT_GROUNDS)) {
    if (norm.includes(key) || norm === String(asset.sportId)) {
      return asset;
    }
  }

  // Fallback to high-res stadium
  return {
    sportId: 0,
    sportName: typeof sportNameOrId === "string" ? sportNameOrId : "Sports",
    groundImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    stadiumName: "International Sports Stadium",
    surfaceDescription: "Professional Regulation Ground",
  };
}

/**
 * Checks if tournament has an admin-provided banner/logo/image.
 * If available, returns that image.
 * Otherwise, falls back to the real playing ground image for that sport!
 */
export function getTournamentVisual(
  tournament: any,
  sportNameOrId?: string | number
): { imageUrl: string; isCustom: boolean; groundName: string } {
  const t = tournament || {};

  // 1. Direct banner/logo properties if present
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

  // 2. Check if description contains an embedded image URL or [banner:URL]
  if (typeof t.description === "string" && t.description.length > 0) {
    const bannerMatch = t.description.match(/\[banner:(https?:\/\/[^\]]+)\]/i);
    if (bannerMatch && bannerMatch[1]) {
      return {
        imageUrl: bannerMatch[1],
        isCustom: true,
        groundName: t.groundName || t.ground_name || "Official Venue",
      };
    }
    const urlMatch = t.description.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp|gif)/i);
    if (urlMatch && urlMatch[0]) {
      return {
        imageUrl: urlMatch[0],
        isCustom: true,
        groundName: t.groundName || t.ground_name || "Official Venue",
      };
    }
  }

  // 3. Fallback to the real playing ground image for this sport!
  const ground = getRealSportGround(t.sportId || t.sport_id || sportNameOrId || "soccer");
  return {
    imageUrl: ground.groundImage,
    isCustom: false,
    groundName: t.groundName || t.ground_name || ground.stadiumName,
  };
}
