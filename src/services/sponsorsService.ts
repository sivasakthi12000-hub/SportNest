/**
 * Sponsors Service
 * Manages Tournament Sponsors, Sponsored Prizes, and Poster generation details.
 */

export interface Sponsor {
  id: string;
  tournamentId?: number;
  tournamentName?: string;
  name: string;
  tier: "Title Sponsor" | "Powered By" | "Kit Partner" | "Beverage Partner" | "Official Trophy Partner";
  contribution: string; // e.g. "₹50,000 Cash + Championship Trophy"
  brandColor: string;
  logoIcon: string;
  tagline: string;
}

const DEFAULT_SPONSORS: Sponsor[] = [
  {
    id: "sp-1",
    tournamentId: 1,
    tournamentName: "Chennai Super Cup Soccer Championship",
    name: "Decathlon Sports India",
    tier: "Title Sponsor",
    contribution: "₹50,000 Cash Prize + Match Balls & Kits for Finalists",
    brandColor: "#0284c7",
    logoIcon: "🏆",
    tagline: "Sports for all, all for sports",
  },
  {
    id: "sp-2",
    tournamentId: 1,
    tournamentName: "Chennai Super Cup Soccer Championship",
    name: "Red Bull Energy",
    tier: "Powered By",
    contribution: "Hydration Stations & MVP Athlete Trophy",
    brandColor: "#dc2626",
    logoIcon: "⚡",
    tagline: "Gives You Wings",
  },
  {
    id: "sp-3",
    tournamentId: 4,
    tournamentName: "Tamil Nadu Premier T20 Cricket Trophy",
    name: "MRF Tyres & Sports",
    tier: "Title Sponsor",
    contribution: "₹75,000 Championship Purse + Grade 1 English Willow Bats",
    brandColor: "#ea580c",
    logoIcon: "🏏",
    tagline: "Pace, Power & Performance",
  },
  {
    id: "sp-4",
    tournamentId: 4,
    tournamentName: "Tamil Nadu Premier T20 Cricket Trophy",
    name: "Dream11 Sports",
    tier: "Powered By",
    contribution: "₹25,000 Top Scorer & Highest Wicket Taker Awards",
    brandColor: "#b91c1c",
    logoIcon: "🎯",
    tagline: "Khelo Dimaag Se",
  },
  {
    id: "sp-5",
    tournamentId: 5,
    tournamentName: "Tamil Nadu State Pro Kabaddi Trophy",
    name: "Nivia Sports",
    tier: "Kit Partner",
    contribution: "Official Match Mats & Pro Playing Uniforms",
    brandColor: "#059669",
    logoIcon: "🎽",
    tagline: "Step Out and Play",
  },
];

const LOCAL_SPONSORS_KEY = "sportsnest_tournament_sponsors";

export function getStoredSponsors(): Sponsor[] {
  try {
    const raw = localStorage.getItem(LOCAL_SPONSORS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(DEFAULT_SPONSORS));
      return DEFAULT_SPONSORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SPONSORS;
  } catch {
    return DEFAULT_SPONSORS;
  }
}

export function saveSponsors(list: Sponsor[]) {
  try {
    localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save sponsors to storage:", e);
  }
}

export function addSponsor(newSponsor: Omit<Sponsor, "id">): Sponsor {
  const current = getStoredSponsors();
  const created: Sponsor = {
    ...newSponsor,
    id: `sp-${Date.now()}`,
  };
  const updated = [created, ...current];
  saveSponsors(updated);
  return created;
}

export function getSponsorsByTournamentId(tournamentId: number): Sponsor[] {
  const all = getStoredSponsors();
  const matched = all.filter((s) => Number(s.tournamentId) === Number(tournamentId));
  if (matched.length > 0) return matched;
  // Fallback default sponsors
  return all.slice(0, 2);
}
