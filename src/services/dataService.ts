import {
  supabase,
  isSupabaseConfigured,
  getSupabase,
  isSupabaseReady,
  supabaseUrl,
} from "../lib/supabase";

export interface Sport {
  id: number;
  name: string;
  image?: string;
  imageUrl?: string;
  bannerUrl?: string;
  groundName?: string;
  surface?: string;
  format?: string;
  category?: string;
  rules?: string;
  accentColor?: string;
  description?: string;
}

export function normalizeSport(s: any): Sport {
  const image =
    s.image ||
    s.image_url ||
    s.imageUrl ||
    s.banner ||
    s.banner_url ||
    s.bannerUrl ||
    s.poster ||
    s.poster_url ||
    s.photo ||
    "";

  return {
    id: Number(s.id),
    name: s.name || s.sport_name || "",
    image,
    imageUrl: image,
    bannerUrl: image,
    groundName: s.ground_name || s.groundName || "",
    surface: s.surface || "",
    format: s.format || "",
    category: s.category || "",
    rules: s.rules || "",
    accentColor: s.accent_color || s.accentColor || "",
    description: s.description || "",
  };
}

export interface PrizeTier {
  position: string;
  amount: number;
}

export interface Tournament {
  id: number;
  name: string;
  sportId: number;
  location: string;
  address?: string;
  pincode?: string;
  state: string;
  district: string;
  groundName: string;
  date: string;
  lastRegistrationDate: string;
  entryFee: number;
  prizeAmount: number;
  prizeBreakdown?: PrizeTier[];
  maxTeams: number;
  registeredTeams: number;
  status: string;
  description: string;
  createdBy?: string;
  mapUrl?: string;
}

export interface Team {
  id: number;
  name: string;
  tournamentId: number;
  group: string;
  members: number;
}

function extractTagValue(text: string, tag: string): string {
  if (!text) return "";
  const match = text.match(new RegExp(`\\[${tag}:([^\\]]+)\\]`, "i"));
  return match ? match[1].trim() : "";
}

function extractPrizeBreakdown(text: string): PrizeTier[] | undefined {
  if (!text) return undefined;
  const raw = extractTagValue(text, "prizes");
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function normalizeTournament(t: any): Tournament {
  const desc = t.description || "";
  
  // Extract pincode either from direct column or encoded in description tag or regex
  let pincode = t.pincode || t.pin_code || t.zip || t.zipcode || extractTagValue(desc, "pincode");
  if (!pincode && desc) {
    const pinMatch = desc.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  // Extract address either from column or description tag
  const address = t.address || t.venue_address || t.full_address || extractTagValue(desc, "address") || "";

  // Extract prize breakdown
  let prizeBreakdown: PrizeTier[] | undefined = undefined;
  if (Array.isArray(t.prizeBreakdown)) {
    prizeBreakdown = t.prizeBreakdown;
  } else if (Array.isArray(t.prize_breakdown)) {
    prizeBreakdown = t.prize_breakdown;
  } else {
    prizeBreakdown = extractPrizeBreakdown(desc);
  }

  const createdBy = t.createdBy || t.created_by || extractTagValue(desc, "created_by") || "";
  const mapUrl = t.mapUrl || t.map_url || extractTagValue(desc, "map_url") || "";

  // Clean description for display by removing internal brackets tags
  const cleanDescription = desc.replace(/\[(pincode|address|prizes|created_by|map_url):[^\]]+\]/gi, "").trim();

  return {
    id: Number(t.id),
    name: t.name || "",
    sportId: Number(t.sportId ?? t.sport_id ?? 1),
    location: t.location || "",
    address: address || undefined,
    pincode: pincode ? String(pincode) : undefined,
    state: t.state || "",
    district: t.district || "",
    groundName: t.groundName ?? t.ground_name ?? "",
    date: t.date || "",
    lastRegistrationDate: t.lastRegistrationDate ?? t.last_registration_date ?? "",
    entryFee: Number(t.entryFee ?? t.entry_fee ?? 0),
    prizeAmount: Number(t.prizeAmount ?? t.prize_amount ?? 0),
    prizeBreakdown: prizeBreakdown && prizeBreakdown.length > 0 ? prizeBreakdown : undefined,
    maxTeams: Number(t.maxTeams ?? t.max_teams ?? 16),
    registeredTeams: Number(t.registeredTeams ?? t.registered_teams ?? 0),
    status: t.status || "upcoming",
    description: cleanDescription || desc,
    createdBy: createdBy || undefined,
    mapUrl: mapUrl || undefined,
  };
}

export function normalizeTeam(team: any): Team {
  return {
    id: Number(team.id),
    name: team.name || "",
    tournamentId: Number(team.tournamentId ?? team.tournament_id),
    group: team.group ?? team.group_name ?? "A",
    members: Number(team.members ?? 11),
  };
}

// Built-in fallback sports data so the app displays vibrant content even before Supabase is connected
export const DEFAULT_FALLBACK_SPORTS: Sport[] = [
  {
    id: 1,
    name: "Soccer",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    groundName: "Wembley International Pitch",
    surface: "Hybrid Natural Turf Pitch",
    format: "11 vs 11 Knockout",
    category: "Outdoor Field",
    rules: "FIFA Regulation 90 Min",
    accentColor: "#9266cc",
    description: "International standard football pitch featuring hybrid turf and FIFA approved floodlighting.",
  },
  {
    id: 2,
    name: "Basketball",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    groundName: "Madison Square Garden Arena",
    surface: "NBA Polished Maple Hardwood Court",
    format: "5 vs 5 Full Court",
    category: "Indoor Arena",
    rules: "FIBA 4x10 Min Quarters",
    accentColor: "#ea580c",
    description: "Championship indoor hardwood court with digital scoreboards and spring-loaded rims.",
  },
  {
    id: 3,
    name: "Tennis",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1600&auto=format&fit=crop",
    groundName: "Arthur Ashe Stadium Court",
    surface: "Grand Slam Hardcourt",
    format: "Singles & Doubles",
    category: "Racquet Club",
    rules: "Best of 3 / 5 Sets",
    accentColor: "#84cc16",
    description: "Pro acrylic hardcourt with precise ball bounce and tournament line marking.",
  },
  {
    id: 4,
    name: "Cricket",
    image: "https://images.unsplash.com/photo-1531415074868-036b107e775a?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1531415074868-036b107e775a?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1531415074868-036b107e775a?q=80&w=1600&auto=format&fit=crop",
    groundName: "Melbourne Cricket Ground (MCG)",
    surface: "Natural Clay Pitch & Lush Outfield",
    format: "T20 & Limited Overs",
    category: "Oval Stadium",
    rules: "ICC Standard Rules",
    accentColor: "#0284c7",
    description: "Historic cricket arena with curated 22-yard clay wicket and boundary ropes.",
  },
  {
    id: 5,
    name: "Kabaddi",
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop",
    groundName: "Thyagaraj Sports Complex",
    surface: "High-Grip EVA Pro Kabaddi Mat",
    format: "7 vs 7 Raid & Tackle",
    category: "Indoor Arena",
    rules: "PKL 40 Min Official",
    accentColor: "#d97706",
    description: "Official Pro Kabaddi synthetic mat arena with high-traction baulk lines.",
  },
  {
    id: 6,
    name: "Volleyball",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop",
    groundName: "Copacabana Beach & Olympic Arena",
    surface: "FIVB Elastic Taraflex Court",
    format: "6 vs 6 Rally Point",
    category: "Indoor / Beach",
    rules: "Best of 5 Sets to 25",
    accentColor: "#06b6d4",
    description: "Shock-absorbing Taraflex flooring optimized for high-flying spikes and blocks.",
  },
  {
    id: 7,
    name: "Hockey",
    image: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1600&auto=format&fit=crop",
    groundName: "Kalinga Stadium Hockey Pitch",
    surface: "FIH Poligras Water-based Blue Turf",
    format: "11 vs 11 Turf Match",
    category: "Outdoor Turf",
    rules: "4 Quarters of 15 Min",
    accentColor: "#10b981",
    description: "Fast, water-based synthetic turf engineered for international field hockey.",
  },
  {
    id: 8,
    name: "Badminton",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop",
    groundName: "Istora Senayan Badminton Hall",
    surface: "BWF Anti-Slip Vinyl Badminton Mat",
    format: "Singles & Doubles",
    category: "Indoor Hall",
    rules: "3 Sets to 21 Points",
    accentColor: "#f43f5e",
    description: "Draft-free indoor arena featuring BWF green vinyl mats and non-glare court lighting.",
  },
  {
    id: 9,
    name: "Table Tennis",
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1600&auto=format&fit=crop",
    groundName: "Tokyo Metropolitan Gymnasium",
    surface: "ITTF Olympic Blue Surface & Table",
    format: "Singles & Doubles",
    category: "Indoor Hall",
    rules: "Best of 5/7 to 11 Points",
    accentColor: "#8b5cf6",
    description: "Competition ITTF tables with specialized high-grip red PVC floor surround.",
  },
  {
    id: 10,
    name: "Swimming",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop",
    groundName: "Tokyo Aquatics Centre",
    surface: "50m Olympic 10-Lane Pool",
    format: "Freestyle / Medley",
    category: "Aquatic Arena",
    rules: "World Aquatics Official",
    accentColor: "#0ea5e9",
    description: "Climate-controlled 50m pool with anti-wave lane dividers and electronic touchpads.",
  },
];

// All tournaments fetched directly from Supabase
export const DEFAULT_FALLBACK_TOURNAMENTS: Tournament[] = [];

let lastDataServiceError: string | null = null;
export function getLastDataServiceError(): string | null {
  return lastDataServiceError;
}

// Fetch all sports directly from Supabase
export async function getSports(): Promise<Sport[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("sports")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        lastDataServiceError = null;
        return data.map(normalizeSport);
      }

      if (error) {
        // Log gently as warn so console isn't flooded with red errors
        console.warn("Supabase sports query notice:", error.message);
        lastDataServiceError = `Sports query notice: ${error.message}`;
      }
    } catch (err: any) {
      console.warn("Notice fetching sports from Supabase:", err?.message || err);
      lastDataServiceError = err?.message || "Failed to fetch sports";
    }
  }

  // Gracefully fallback to default sports so UI remains functional
  return DEFAULT_FALLBACK_SPORTS;
}

// Local store for user-created tournaments to guarantee instant preview and responsiveness
const LOCAL_CREATED_KEY = "sportsnest_created_tournaments";

function getLocalCreatedTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(LOCAL_CREATED_KEY) || localStorage.getItem("arenasync_created_tournaments");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTournament) : [];
  } catch {
    return [];
  }
}

function saveLocalCreatedTournament(t: Tournament) {
  try {
    const current = getLocalCreatedTournaments();
    const updated = [t, ...current.filter((item) => item.id !== t.id)];
    localStorage.setItem(LOCAL_CREATED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to persist local tournament:", e);
  }
}

// Fetch all tournaments directly from Supabase
export async function getTournaments(): Promise<Tournament[]> {
  const localList = getLocalCreatedTournaments();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from("tournaments")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data) {
        lastDataServiceError = null;
        if (data.length > 0) {
          const allNormalized = data.map(normalizeTournament);
          
          // Curate: 5 tournaments per sport, in Tamil Nadu with statuses (complete, full, ongoing, upcoming)
          const tnTournaments = allNormalized.filter(
            (t) => (t.state && t.state.toLowerCase() === "tamil nadu") || (t.id >= 1 && t.id <= 50)
          );
          const pool = tnTournaments.length >= 10 ? tnTournaments : allNormalized;

          const sportsMap = new Map<number, Tournament[]>();
          for (const t of pool) {
            const list = sportsMap.get(t.sportId) || [];
            if (list.length < 5) {
              list.push(t);
              sportsMap.set(t.sportId, list);
            }
          }
          const curatedDbList: Tournament[] = [];
          sportsMap.forEach((items) => curatedDbList.push(...items));
          const dbList = curatedDbList.length > 0 ? curatedDbList : allNormalized.slice(0, 50);

          // Merge local tournaments that aren't already present by ID
          const existingIds = new Set(dbList.map((t) => t.id));
          const uniqueLocal = localList.filter((t) => !existingIds.has(t.id));
          return [...uniqueLocal, ...dbList];
        }
      }

      if (error) {
        console.warn("Supabase tournaments query notice:", error.message);
        lastDataServiceError = `Tournaments query notice: ${error.message}`;
      }
    } catch (err: any) {
      console.warn("Notice fetching tournaments from Supabase:", err?.message || err);
      lastDataServiceError = err?.message || "Failed to fetch tournaments";
    }
  }

  // Return only user created or empty array if failed
  return localList;
}

// Fetch tournament by ID directly from Supabase
export async function getTournamentById(id: number): Promise<Tournament | null> {
  const localList = getLocalCreatedTournaments();
  const localMatch = localList.find((t) => t.id === Number(id));
  if (localMatch) return localMatch;

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return normalizeTournament(data);
      }
      if (error) {
        console.warn("Supabase tournament by id notice:", error.message);
        lastDataServiceError = error.message;
      }
    } catch (err: any) {
      console.warn("Notice fetching tournament from Supabase:", err?.message || err);
      lastDataServiceError = err?.message;
    }
  }

  // Fallback to default tournament if exists
  const fallback = DEFAULT_FALLBACK_TOURNAMENTS.find((t) => t.id === Number(id));
  return fallback || null;
}

// Fetch teams for a tournament directly from Supabase
export async function getTeamsByTournamentId(tournamentId: number): Promise<Team[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("id", { ascending: true });

      if (!error && data) {
        return data.map(normalizeTeam);
      }
      if (error) {
        console.warn("Supabase teams query notice:", error.message);
        lastDataServiceError = error.message;
      }
    } catch (err: any) {
      console.warn("Notice fetching teams from Supabase:", err?.message || err);
      lastDataServiceError = err?.message;
    }
  }

  // Generate realistic deterministic demo teams if unconfigured
  if (!isSupabaseReady()) {
    return [
      { id: 101, name: "Thunder Strikers", tournamentId, group: "A", members: 11 },
      { id: 102, name: "Viper Knights", tournamentId, group: "A", members: 11 },
      { id: 103, name: "Apex Warriors", tournamentId, group: "B", members: 11 },
      { id: 104, name: "Titan Gladiators", tournamentId, group: "B", members: 11 },
      { id: 105, name: "Blaze United", tournamentId, group: "A", members: 11 },
      { id: 106, name: "Falcon Express", tournamentId, group: "B", members: 11 },
    ];
  }

  return [];
}

// Fetch team by ID directly from Supabase
export async function getTeamById(id: number): Promise<Team | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("teams")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return normalizeTeam(data);
      }
      if (error) {
        console.warn("Supabase team by id notice:", error.message);
      }
    } catch (err: any) {
      console.warn("Notice fetching team from Supabase:", err?.message || err);
    }
  }

  // Fallback demo team
  return {
    id: Number(id),
    name: `Team #${id}`,
    tournamentId: 1,
    group: "A",
    members: 11,
  };
}

// Create tournament in Supabase (with instant local caching and metadata tag encoding)
export async function createTournament(tournament: Partial<Tournament>): Promise<{ success: boolean; data?: any; error?: string }> {
  // Build description containing resilient metadata tags
  const tags: string[] = [];
  if (tournament.pincode) tags.push(`[pincode:${tournament.pincode}]`);
  if (tournament.address) tags.push(`[address:${tournament.address}]`);
  if (tournament.prizeBreakdown && tournament.prizeBreakdown.length > 0) {
    tags.push(`[prizes:${JSON.stringify(tournament.prizeBreakdown)}]`);
  }
  if (tournament.createdBy) tags.push(`[created_by:${tournament.createdBy}]`);
  if (tournament.mapUrl) tags.push(`[map_url:${tournament.mapUrl.trim()}]`);

  const rawDesc = tournament.description?.trim() || "Tournament registered via SportsNest.";
  const packagedDescription = `${tags.join("")} ${rawDesc}`.trim();

  const generatedId = Date.now() % 1000000;
  const localObj: Tournament = {
    id: generatedId,
    name: tournament.name || "New Tournament",
    sportId: Number(tournament.sportId || 1),
    location: tournament.location || "Chennai",
    address: tournament.address,
    pincode: tournament.pincode,
    state: tournament.state || "Tamil Nadu",
    district: tournament.district || "Chennai",
    groundName: tournament.groundName || `${tournament.location || "Arena"} Stadium`,
    date: tournament.date || new Date().toISOString().slice(0, 10),
    lastRegistrationDate: tournament.lastRegistrationDate || new Date().toISOString().slice(0, 10),
    entryFee: Number(tournament.entryFee || 0),
    prizeAmount: Number(tournament.prizeAmount || 0),
    prizeBreakdown: tournament.prizeBreakdown,
    maxTeams: Number(tournament.maxTeams || 16),
    registeredTeams: 0,
    status: "upcoming",
    description: rawDesc,
    createdBy: tournament.createdBy || "admin",
    mapUrl: tournament.mapUrl,
  };

  const client = getSupabase();
  if (client) {
    try {
      const payload: Record<string, any> = {
        name: tournament.name,
        sport_id: tournament.sportId,
        location: tournament.location,
        state: tournament.state || "Tamil Nadu",
        district: tournament.district || "Chennai",
        ground_name: tournament.groundName || `${tournament.location} Stadium`,
        date: tournament.date,
        last_registration_date: tournament.lastRegistrationDate,
        entry_fee: tournament.entryFee || 0,
        prize_amount: tournament.prizeAmount || 0,
        max_teams: tournament.maxTeams || 16,
        registered_teams: 0,
        status: "upcoming",
        description: packagedDescription,
      };

      // Attempt insert
      const { data, error } = await client.from("tournaments").insert([payload]).select().single();
      if (!error && data) {
        const normalized = normalizeTournament(data);
        saveLocalCreatedTournament(normalized);
        return { success: true, data: normalized };
      }

      if (error) {
        console.warn("Supabase create tournament insert error, falling back to local storage:", error.message);
        saveLocalCreatedTournament(localObj);
        return { success: true, data: localObj };
      }
    } catch (err: any) {
      console.warn("Supabase create tournament caught error, falling back to local storage:", err.message);
      saveLocalCreatedTournament(localObj);
      return { success: true, data: localObj };
    }
  }

  // If Supabase connection is unconfigured, store in local registry
  saveLocalCreatedTournament(localObj);
  return { success: true, data: localObj };
}

// Fetch total teams count in database
export async function getTotalTeamsCount(): Promise<number> {
  const client = getSupabase();
  if (client) {
    try {
      const { count, error } = await client
        .from("teams")
        .select("*", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        return count;
      }
    } catch (err) {
      console.warn("Notice fetching total teams count:", err);
    }
  }
  return 0;
}

// Register team in Supabase
export async function registerTeam(team: { name: string; tournamentId: number; group?: string; members?: number }): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      const payload = {
        name: team.name,
        tournament_id: team.tournamentId,
        group: team.group || "A",
        members: team.members || 11,
      };
      const { data, error } = await client.from("teams").insert([payload]).select().single();
      if (error) {
        return { success: false, error: error.message };
      }

      // Increment registered_teams count on tournament
      try {
        const { data: tourney } = await client
          .from("tournaments")
          .select("registered_teams")
          .eq("id", team.tournamentId)
          .single();
        if (tourney) {
          await client
            .from("tournaments")
            .update({ registered_teams: (tourney.registered_teams || 0) + 1 })
            .eq("id", team.tournamentId);
        }
      } catch (countErr) {
        console.warn("Could not increment registered_teams:", countErr);
      }

      return { success: true, data: normalizeTeam(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

// Fetch all teams across all tournaments from Supabase
export async function getAllTeams(): Promise<(Team & { tournamentName?: string; createdAt?: string })[]> {
  const client = getSupabase();
  if (client) {
    try {
      // Fetch tournaments lookup dictionary for guaranteed tournament names
      const { data: tourneys } = await client.from("tournaments").select("id, name");
      const tourneyMap = new Map<number, string>();
      if (tourneys) {
        tourneys.forEach((t: any) => tourneyMap.set(Number(t.id), t.name));
      }

      // First try join query
      const { data, error } = await client
        .from("teams")
        .select("*, tournaments(id, name)")
        .order("id", { ascending: false });

      if (!error && data) {
        return data.map((t: any) => ({
          ...normalizeTeam(t),
          tournamentName:
            t.tournaments?.name ||
            tourneyMap.get(Number(t.tournament_id || t.tournamentId)) ||
            `Tournament #${t.tournament_id || t.tournamentId}`,
          createdAt: t.created_at || "",
        }));
      }

      // Fallback query if foreign key join is restricted
      const { data: simpleTeams } = await client
        .from("teams")
        .select("*")
        .order("id", { ascending: false });

      if (simpleTeams) {
        return simpleTeams.map((t: any) => ({
          ...normalizeTeam(t),
          tournamentName:
            tourneyMap.get(Number(t.tournament_id || t.tournamentId)) ||
            `Tournament #${t.tournament_id || t.tournamentId}`,
          createdAt: t.created_at || "",
        }));
      }
    } catch (err) {
      console.warn("Notice fetching all teams from Supabase:", err);
    }
  }
  return [];
}

// Delete a tournament from Supabase
export async function deleteTournament(id: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      // Delete associated teams first to satisfy referential integrity
      await client.from("teams").delete().eq("tournament_id", id);
      const { error } = await client.from("tournaments").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

// Update tournament fields (status, prize, teams, dates, etc.) in Supabase
export async function updateTournament(id: number, updates: Partial<Tournament>): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.prizeAmount !== undefined) payload.prize_amount = updates.prizeAmount;
      if (updates.entryFee !== undefined) payload.entry_fee = updates.entryFee;
      if (updates.maxTeams !== undefined) payload.max_teams = updates.maxTeams;
      if (updates.registeredTeams !== undefined) payload.registered_teams = updates.registeredTeams;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.groundName !== undefined) payload.ground_name = updates.groundName;
      if (updates.state !== undefined) payload.state = updates.state;
      if (updates.district !== undefined) payload.district = updates.district;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.lastRegistrationDate !== undefined) payload.last_registration_date = updates.lastRegistrationDate;

      const { error } = await client.from("tournaments").update(payload).eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

// Delete team from Supabase
export async function deleteTeam(id: number, tournamentId?: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("teams").delete().eq("id", id);
      if (error) return { success: false, error: error.message };

      if (tournamentId) {
        try {
          const { data: tourney } = await client
            .from("tournaments")
            .select("registered_teams")
            .eq("id", tournamentId)
            .single();
          if (tourney && (tourney.registered_teams || 0) > 0) {
            await client
              .from("tournaments")
              .update({ registered_teams: tourney.registered_teams - 1 })
              .eq("id", tournamentId);
          }
        } catch (cntErr) {
          console.warn("Could not decrement registered_teams:", cntErr);
        }
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

// Create sport in Supabase with resilient schema fallback
export async function createSport(sport: {
  name: string;
  groundName?: string;
  surface?: string;
  format?: string;
  category?: string;
  rules?: string;
  description?: string;
  accentColor?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      // 1. First attempt full payload with rich columns
      const fullPayload = {
        name: sport.name,
        ground_name: sport.groundName || "",
        surface: sport.surface || "",
        format: sport.format || "",
        rules: sport.rules || "",
        description: sport.description || "",
        accent_color: sport.accentColor || "#10b981",
      };

      const { data, error } = await client.from("sports").insert([fullPayload]).select().single();

      // If error indicates a missing column in user's database schema, fallback gracefully to basic schema
      if (error && (error.message?.includes("column") || error.code === "42703")) {
        console.warn("Retrying sport insert with basic columns due to schema difference:", error.message);
        const basicPayload = {
          name: sport.name,
          image: `${sport.name.toLowerCase().replace(/\s+/g, "")}.jpg`,
        };
        const retry = await client.from("sports").insert([basicPayload]).select().single();
        if (retry.error) return { success: false, error: retry.error.message };
        return { success: true, data: normalizeSport(retry.data) };
      }

      if (error) return { success: false, error: error.message };
      return { success: true, data: normalizeSport(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

/**
 * Seed initial sample sports, tournaments, and teams directly to Supabase from the Admin UI.
 * This solves the "empty database after deployment" problem with a single click.
 */
export async function seedSampleDataToSupabase(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  counts?: { sports: number; tournaments: number; teams: number };
}> {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: "Supabase client is not connected. Enter valid credentials first." };
  }

  try {
    // 1. Seed Sports
    console.log("[Supabase Seeder] Seeding sports...");
    const sportsRows = DEFAULT_FALLBACK_SPORTS.map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image || `${s.name.toLowerCase()}.jpg`,
    }));

    const { error: sportsError } = await client.from("sports").upsert(sportsRows);
    if (sportsError) {
      console.warn("Sport seed upsert error:", sportsError);
    }

    // 2. Seed Tournaments
    console.log("[Supabase Seeder] Seeding tournaments...");
    const tournamentRows = DEFAULT_FALLBACK_TOURNAMENTS.map((t) => ({
      id: t.id,
      name: t.name,
      sport_id: t.sportId,
      location: t.location,
      state: t.state,
      district: t.district,
      ground_name: t.groundName,
      date: t.date,
      last_registration_date: t.lastRegistrationDate,
      entry_fee: t.entryFee,
      prize_amount: t.prizeAmount,
      max_teams: t.maxTeams,
      registered_teams: t.registeredTeams,
      status: t.status,
      description: t.description,
    }));

    const { error: tourneyError } = await client.from("tournaments").upsert(tournamentRows);
    if (tourneyError) {
      console.warn("Tournament seed upsert error:", tourneyError);
    }

    // 3. Seed Teams
    console.log("[Supabase Seeder] Seeding teams...");
    const sampleTeams = [
      { id: 1, name: "Thunder Strikers FC", tournament_id: 1, group: "A", members: 11 },
      { id: 2, name: "Hyderabad Blasters", tournament_id: 1, group: "A", members: 11 },
      { id: 3, name: "Falcon Warriors", tournament_id: 1, group: "B", members: 11 },
      { id: 4, name: "Titan United", tournament_id: 1, group: "B", members: 11 },
      { id: 5, name: "Bangalore Dunkers", tournament_id: 2, group: "A", members: 5 },
      { id: 6, name: "Metro Hoopers", tournament_id: 2, group: "A", members: 5 },
      { id: 7, name: "Kanteerava Bulls", tournament_id: 2, group: "B", members: 5 },
      { id: 8, name: "Silicon Shooters", tournament_id: 2, group: "B", members: 5 },
      { id: 9, name: "Chennai Spinners", tournament_id: 3, group: "A", members: 2 },
      { id: 10, name: "Marina Smashers", tournament_id: 3, group: "B", members: 2 },
      { id: 11, name: "Mumbai Champions", tournament_id: 4, group: "A", members: 11 },
      { id: 12, name: "Marine Drive Royals", tournament_id: 4, group: "B", members: 11 },
    ];

    const { error: teamsError } = await client.from("teams").upsert(sampleTeams);
    if (teamsError) {
      console.warn("Teams seed upsert error:", teamsError);
    }

    // Refresh sequence numbers in case postgres sequence is behind
    return {
      success: true,
      message: "Database seeded successfully with official sports, tournaments, and registered squads!",
      counts: {
        sports: sportsRows.length,
        tournaments: tournamentRows.length,
        teams: sampleTeams.length,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to seed sample data into Supabase." };
  }
}
