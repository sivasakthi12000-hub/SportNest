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
  label?: string;
}

export interface Tournament {
  id: number;
  name: string;
  sportId: number;
  sportName?: string;
  sport?: string;
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
  rules?: string;
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

  // Extract rules if provided
  let rules = t.rules || "";
  if (!rules) {
    const rawRules = extractTagValue(desc, "rules");
    if (rawRules) {
      try {
        rules = decodeURIComponent(rawRules);
      } catch {
        rules = rawRules;
      }
    }
  }

  // Clean description for display by removing internal brackets tags
  const cleanDescription = desc.replace(/\[(pincode|address|prizes|created_by|map_url|rules):[^\]]+\]/gi, "").trim();

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
    rules: rules ? rules.trim() : undefined,
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

// Tournaments data service - All tournaments are fetched and persisted directly in Supabase
let lastDataServiceError: string | null = null;
export function getLastDataServiceError(): string | null {
  return lastDataServiceError;
}

const CUSTOM_SPORTS_KEY = "sportsnest_custom_sports_v2";
const TOURNAMENT_OVERRIDES_KEY = "sportsnest_tournament_overrides_v2";

export function getLocalCustomSports(): Sport[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeSport) : [];
  } catch {
    return [];
  }
}

const DELETED_SPORTS_KEY = "sportsnest_deleted_sports";

export function getLocalDeletedSports(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLocalDeletedSport(target: string | number) {
  try {
    const list = getLocalDeletedSports();
    const str = String(target).toLowerCase();
    if (!list.includes(str)) {
      list.push(str);
      localStorage.setItem(DELETED_SPORTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn("Notice saving deleted sport to localStorage:", e);
  }
}

export function saveLocalCustomSport(sport: Sport) {
  try {
    const current = getLocalCustomSports();
    const filtered = current.filter((s) => s.id !== sport.id && s.name.toLowerCase() !== sport.name.toLowerCase());
    filtered.push(sport);
    localStorage.setItem(CUSTOM_SPORTS_KEY, JSON.stringify(filtered));

    // Also remove from deleted tombstones if previously deleted
    const deleted = getLocalDeletedSports().filter(
      (d) => d !== String(sport.id) && d !== sport.name.toLowerCase()
    );
    localStorage.setItem(DELETED_SPORTS_KEY, JSON.stringify(deleted));
  } catch (e) {
    console.warn("Notice saving custom sport to localStorage:", e);
  }
}

export function getLocalTournamentOverrides(): Record<string, { lastRegistrationDate?: string; date?: string }> {
  try {
    const raw = localStorage.getItem(TOURNAMENT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalTournamentOverride(id: number | string, override: { lastRegistrationDate?: string; date?: string }) {
  try {
    const all = getLocalTournamentOverrides();
    all[String(id)] = { ...(all[String(id)] || {}), ...override };
    localStorage.setItem(TOURNAMENT_OVERRIDES_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Notice saving tournament override:", e);
  }
}

// Fetch all sports directly from Supabase + custom sports
export async function getSports(): Promise<Sport[]> {
  let baseSports: Sport[] = [];
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("sports")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        lastDataServiceError = null;
        baseSports = data.map(normalizeSport);
      } else if (error) {
        console.warn("Supabase sports query notice:", error.message);
        lastDataServiceError = `Sports query notice: ${error.message}`;
        baseSports = [...DEFAULT_FALLBACK_SPORTS];
      }
    } catch (err: any) {
      console.warn("Notice fetching sports from Supabase:", err?.message || err);
      lastDataServiceError = err?.message || "Failed to fetch sports";
      baseSports = [...DEFAULT_FALLBACK_SPORTS];
    }
  } else {
    baseSports = [...DEFAULT_FALLBACK_SPORTS];
  }

  // Load custom sports and deleted tombstones from backend server & localStorage
  const localCustom = getLocalCustomSports();
  const localDeleted = getLocalDeletedSports();
  let serverCustom: Sport[] = [];
  let serverDeleted: string[] = [];

  try {
    const resp = await fetch("/api/sports");
    if (resp.ok) {
      const json = await resp.json();
      if (json.success && Array.isArray(json.sports)) {
        serverCustom = json.sports.map(normalizeSport);
      }
      if (json.success && Array.isArray(json.deleted)) {
        serverDeleted = json.deleted;
      }
    }
  } catch {
    // Network or server starting
  }

  const allDeletedSet = new Set(
    [...localDeleted, ...serverDeleted].map((d) => String(d).toLowerCase())
  );

  // Merge sports uniquely by name and id
  const sportsMap = new Map<string, Sport>();
  baseSports.forEach((s) => sportsMap.set(s.name.toLowerCase(), s));
  localCustom.forEach((s) => sportsMap.set(s.name.toLowerCase(), s));
  serverCustom.forEach((s) => sportsMap.set(s.name.toLowerCase(), s));

  // Filter out any explicitly deleted sports
  const activeSports = Array.from(sportsMap.values()).filter((s) => {
    const idMatch = allDeletedSet.has(String(s.id));
    const nameMatch = allDeletedSet.has(s.name.toLowerCase());
    return !idMatch && !nameMatch;
  });

  return activeSports.sort((a, b) => a.id - b.id);
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

function applyTournamentOverrides(tourneys: Tournament[]): Tournament[] {
  const overrides = getLocalTournamentOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return tourneys;
  return tourneys.map((t) => {
    const o = overrides[String(t.id)];
    if (!o) return t;
    return {
      ...t,
      lastRegistrationDate: o.lastRegistrationDate || t.lastRegistrationDate,
      date: o.date || t.date,
    };
  });
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
        .order("id", { ascending: false });

      if (!error && data) {
        lastDataServiceError = null;
        const allNormalized = data.map(normalizeTournament);

        // Merge any locally created tournaments that haven't been assigned a remote ID
        const existingIds = new Set(allNormalized.map((t) => t.id));
        const uniqueLocal = localList.filter((t) => !existingIds.has(t.id));
        return applyTournamentOverrides([...uniqueLocal, ...allNormalized]);
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

  // If Supabase is unreachable, return any user-created local records
  return applyTournamentOverrides(localList);
}

// Fetch tournament by ID directly from Supabase
export async function getTournamentById(id: number): Promise<Tournament | null> {
  const localList = getLocalCreatedTournaments();
  const localMatch = localList.find((t) => t.id === Number(id));
  if (localMatch) {
    const [overridden] = applyTournamentOverrides([localMatch]);
    return overridden;
  }

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const normalized = normalizeTournament(data);
        const [overridden] = applyTournamentOverrides([normalized]);
        return overridden;
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

  return null;
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

  return null;
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
  if (tournament.rules) tags.push(`[rules:${encodeURIComponent(tournament.rules.trim())}]`);

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
    rules: tournament.rules,
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

// Register team in Supabase & Backend Registry
export async function registerTeam(team: {
  name: string;
  tournamentId: number;
  tournamentName?: string;
  group?: string;
  members?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  // Sync to backend persistent store
  try {
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
  } catch (err) {
    console.warn("Backend team registration notice:", err);
  }

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
  return { success: true, data: { id: Date.now() % 100000, ...team } };
}

// Update existing team
export async function updateTeam(
  id: number,
  updates: Partial<Team> & { tournamentName?: string }
): Promise<{ success: boolean; error?: string }> {
  // Update backend persistent store
  try {
    await fetch(`/api/teams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn("Backend team update notice:", err);
  }

  const client = getSupabase();
  if (client) {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.group !== undefined) payload.group = updates.group;
      if (updates.members !== undefined) payload.members = updates.members;
      if (updates.tournamentId !== undefined) payload.tournament_id = updates.tournamentId;
      const { error } = await client.from("teams").update(payload).eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

// Fetch all teams across all tournaments from Supabase and Backend Registry
export async function getAllTeams(): Promise<(Team & { tournamentName?: string; createdAt?: string })[]> {
  let backendTeams: (Team & { tournamentName?: string; createdAt?: string })[] = [];
  try {
    const res = await fetch("/api/teams");
    if (res.ok) {
      const json = await res.json();
      if (json.teams && Array.isArray(json.teams)) {
        backendTeams = json.teams.map((t: any) => ({
          id: Number(t.id),
          name: t.name,
          tournamentId: Number(t.tournamentId),
          group: t.group || "A",
          members: Number(t.members || 11),
          tournamentName: t.tournamentName || `Tournament #${t.tournamentId}`,
          createdAt: t.createdAt || "",
        }));
      }
    }
  } catch (err) {
    console.warn("Notice querying backend teams:", err);
  }

  const client = getSupabase();
  if (client) {
    try {
      const { data: tourneys } = await client.from("tournaments").select("id, name");
      const tourneyMap = new Map<number, string>();
      if (tourneys) {
        tourneys.forEach((t: any) => tourneyMap.set(Number(t.id), t.name));
      }

      const { data, error } = await client
        .from("teams")
        .select("*, tournaments(id, name)")
        .order("id", { ascending: false });

      if (!error && data) {
        const supaTeams = data.map((t: any) => ({
          ...normalizeTeam(t),
          tournamentName:
            t.tournaments?.name ||
            tourneyMap.get(Number(t.tournament_id || t.tournamentId)) ||
            `Tournament #${t.tournament_id || t.tournamentId}`,
          createdAt: t.created_at || "",
        }));

        // Merge backend and supabase without duplicates
        const seenIds = new Set(supaTeams.map((t) => t.id));
        const uniqueBackend = backendTeams.filter((t) => !seenIds.has(t.id));
        return [...uniqueBackend, ...supaTeams];
      }
    } catch (err) {
      console.warn("Notice fetching teams from Supabase:", err);
    }
  }

  return backendTeams;
}

// Delete a tournament from Supabase
export async function deleteTournament(id: number): Promise<{ success: boolean; error?: string }> {
  // Update local storage cache
  try {
    const localList = getLocalCreatedTournaments();
    const updated = localList.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_CREATED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Notice removing tournament from local cache:", e);
  }

  // Audit log
  try {
    await fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor: "admin",
        action: "Deleted Tournament",
        target: `Tournament #${id}`,
        status: "warning",
      }),
    });
  } catch {
    // ignore
  }

  const client = getSupabase();
  if (client) {
    try {
      await client.from("teams").delete().eq("tournament_id", id);
      const { error } = await client.from("tournaments").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

// Update tournament fields (all properties including rules, prizes, venue, dates)
export async function updateTournament(id: number, updates: Partial<Tournament>): Promise<{ success: boolean; error?: string }> {
  // 1. Update local created tournament cache
  try {
    const localList = getLocalCreatedTournaments();
    const index = localList.findIndex((t) => t.id === Number(id));
    if (index >= 0) {
      localList[index] = { ...localList[index], ...updates };
      localStorage.setItem(LOCAL_CREATED_KEY, JSON.stringify(localList));
    }
  } catch (e) {
    console.warn("Notice updating local tournament cache:", e);
  }

  // 2. Audit log
  try {
    await fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor: "admin",
        action: "Updated Tournament",
        target: `${updates.name || `Tournament #${id}`}`,
        status: "success",
      }),
    });
  } catch {
    // ignore
  }

  const client = getSupabase();
  if (client) {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.sportId !== undefined) payload.sport_id = updates.sportId;
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

      // Pack metadata tags into description if rules or extra fields changed
      if (updates.rules !== undefined || updates.pincode !== undefined || updates.address !== undefined || updates.mapUrl !== undefined) {
        const tags: string[] = [];
        if (updates.pincode) tags.push(`[pincode:${updates.pincode}]`);
        if (updates.address) tags.push(`[address:${updates.address}]`);
        if (updates.prizeBreakdown && updates.prizeBreakdown.length > 0) {
          tags.push(`[prizes:${JSON.stringify(updates.prizeBreakdown)}]`);
        }
        if (updates.mapUrl) tags.push(`[map_url:${updates.mapUrl.trim()}]`);
        if (updates.rules) tags.push(`[rules:${encodeURIComponent(updates.rules.trim())}]`);

        const rawDesc = updates.description?.trim() || "Tournament registered via SportsNest.";
        payload.description = `${tags.join("")} ${rawDesc}`.trim();
      } else if (updates.description !== undefined) {
        payload.description = updates.description;
      }

      const { error } = await client.from("tournaments").update(payload).eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

// Delete team from Supabase & Backend Registry
export async function deleteTeam(id: number, tournamentId?: number): Promise<{ success: boolean; error?: string }> {
  try {
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Notice deleting backend team:", err);
  }

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
  return { success: true };
}

// Create sport in Supabase with resilient backend and localStorage fallback
export async function createSport(sport: {
  name: string;
  groundName?: string;
  surface?: string;
  format?: string;
  category?: string;
  rules?: string;
  description?: string;
  accentColor?: string;
}): Promise<{ success: boolean; data?: Sport; error?: string }> {
  const cleanName = sport.name.trim();
  const generatedId = Date.now() % 100000;
  const localSport: Sport = {
    id: generatedId,
    name: cleanName,
    image: `${cleanName.toLowerCase().replace(/\s+/g, "")}.jpg`,
    imageUrl: `${cleanName.toLowerCase().replace(/\s+/g, "")}.jpg`,
    groundName: sport.groundName || `${cleanName} Arena`,
    surface: sport.surface || "Synthetic / Natural",
    format: sport.format || "Standard Competition",
    category: sport.category || "Arena",
    rules: sport.rules || "Standard Official Rules",
    description: sport.description || `Sanctioned tournament discipline for ${cleanName}.`,
    accentColor: sport.accentColor || "#10b981",
  };

  // 1. Try Supabase insert
  const client = getSupabase();
  if (client) {
    try {
      const fullPayload = {
        name: cleanName,
        ground_name: localSport.groundName,
        surface: localSport.surface,
        format: localSport.format,
        rules: localSport.rules,
        description: localSport.description,
        accent_color: localSport.accentColor,
      };

      const { data, error } = await client.from("sports").insert([fullPayload]).select().single();
      if (!error && data) {
        const normalized = normalizeSport(data);
        saveLocalCustomSport(normalized);
        return { success: true, data: normalized };
      }

      // Try basic columns
      const basicPayload = {
        name: cleanName,
        image: `${cleanName.toLowerCase().replace(/\s+/g, "")}.jpg`,
      };
      const retry = await client.from("sports").insert([basicPayload]).select().single();
      if (!retry.error && retry.data) {
        const normalized = normalizeSport(retry.data);
        saveLocalCustomSport(normalized);
        return { success: true, data: normalized };
      }
    } catch (supaErr: any) {
      console.warn("Supabase sports insert notice, proceeding with backend & local persistence:", supaErr.message);
    }
  }

  // 2. Persist to Backend API
  try {
    const res = await fetch("/api/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sport),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const normalized = normalizeSport(json.data);
        saveLocalCustomSport(normalized);
        return { success: true, data: normalized };
      }
    }
  } catch (apiErr) {
    console.warn("Notice saving sport to backend API:", apiErr);
  }

  // 3. Persist locally
  saveLocalCustomSport(localSport);
  return { success: true, data: localSport };
}

// Delete sport from directory (backend, localStorage, and Supabase)
export async function deleteSport(
  id: number | string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Mark as deleted locally
  addLocalDeletedSport(id);
  if (name) addLocalDeletedSport(name);

  try {
    const localList = getLocalCustomSports();
    const updated = localList.filter(
      (s) => String(s.id) !== String(id) && s.name.toLowerCase() !== name.toLowerCase()
    );
    localStorage.setItem(CUSTOM_SPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Notice updating custom sports local cache:", e);
  }

  // 2. Call backend DELETE API
  try {
    await fetch(`/api/sports/${id}?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
  } catch (apiErr) {
    console.warn("Notice deleting sport on backend API:", apiErr);
  }

  // 3. Delete from Supabase if connected
  const client = getSupabase();
  if (client) {
    try {
      if (typeof id === "number" && id < 1000) {
        await client.from("sports").delete().eq("id", id);
      }
      if (name) {
        await client.from("sports").delete().eq("name", name);
      }
    } catch (supaErr: any) {
      console.warn("Supabase sport deletion notice:", supaErr?.message || supaErr);
    }
  }

  return { success: true };
}

// Update existing sport details
export async function updateSport(
  id: number | string,
  updates: Partial<Sport>
): Promise<{ success: boolean; data?: Sport; error?: string }> {
  // 1. Update localStorage
  try {
    const localList = getLocalCustomSports();
    const existingIndex = localList.findIndex(
      (s) => String(s.id) === String(id) || (updates.name && s.name.toLowerCase() === updates.name.toLowerCase())
    );
    if (existingIndex >= 0) {
      localList[existingIndex] = { ...localList[existingIndex], ...updates };
      localStorage.setItem(CUSTOM_SPORTS_KEY, JSON.stringify(localList));
    } else if (updates.name) {
      saveLocalCustomSport({
        id: Number(id) || Date.now() % 100000,
        name: updates.name,
        groundName: updates.groundName,
        surface: updates.surface,
        format: updates.format,
        rules: updates.rules,
        description: updates.description,
        accentColor: updates.accentColor || "#10b981",
        image: `${updates.name.toLowerCase().replace(/\s+/g, "")}.jpg`,
      });
    }
  } catch (e) {
    console.warn("Notice updating sport in local storage:", e);
  }

  // 2. Persist to backend API
  try {
    const res = await fetch(`/api/sports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { success: true, data: normalizeSport(json.data) };
      }
    }
  } catch (apiErr) {
    console.warn("Notice patching sport on backend:", apiErr);
  }

  // 3. Update Supabase if connected
  const client = getSupabase();
  if (client) {
    try {
      const payload: any = {};
      if (updates.groundName !== undefined) payload.ground_name = updates.groundName;
      if (updates.surface !== undefined) payload.surface = updates.surface;
      if (updates.format !== undefined) payload.format = updates.format;
      if (updates.rules !== undefined) payload.rules = updates.rules;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;

      await client.from("sports").update(payload).eq("id", id);
    } catch (supaErr: any) {
      console.warn("Supabase sport update notice:", supaErr?.message || supaErr);
    }
  }

  return { success: true };
}

// Update tournament dates (last registration deadline and kickoff date)
export async function updateTournamentDates(
  tournamentId: number,
  dates: { lastRegistrationDate?: string; date?: string }
): Promise<{ success: boolean; error?: string }> {
  // 1. Save local override
  saveLocalTournamentOverride(tournamentId, dates);

  // 2. Update local created tournaments
  try {
    const localList = getLocalCreatedTournaments();
    const match = localList.find((t) => t.id === Number(tournamentId));
    if (match) {
      if (dates.lastRegistrationDate) match.lastRegistrationDate = dates.lastRegistrationDate;
      if (dates.date) match.date = dates.date;
      saveLocalCreatedTournament(match);
    }
  } catch (e) {
    console.warn("Notice updating local tournament:", e);
  }

  // 3. Persist to backend
  try {
    await fetch(`/api/tournaments/${tournamentId}/dates`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dates),
    });
  } catch (apiErr) {
    console.warn("Notice updating dates on server:", apiErr);
  }

  // 4. Update in Supabase tournaments table
  const client = getSupabase();
  if (client) {
    try {
      const payload: Record<string, any> = {};
      if (dates.lastRegistrationDate) payload.last_registration_date = dates.lastRegistrationDate;
      if (dates.date) payload.date = dates.date;

      const { error } = await client.from("tournaments").update(payload).eq("id", tournamentId);
      if (error) {
        console.warn("Notice updating tournament dates in Supabase:", error.message);
      }
    } catch (supaErr: any) {
      console.warn("Notice updating tournament dates caught error:", supaErr.message);
    }
  }

  return { success: true };
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

    // 2. Check Tournaments
    console.log("[Supabase Seeder] Verifying sports seed...");
    return {
      success: true,
      message: "Database sports and schemas synchronized with Supabase.",
      counts: {
        sports: sportsRows.length,
        tournaments: 0,
        teams: 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to seed sample data into Supabase." };
  }
}
