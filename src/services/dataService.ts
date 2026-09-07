import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface Sport {
  id: number;
  name: string;
  image: string;
}

export interface Tournament {
  id: number;
  name: string;
  sportId: number;
  location: string;
  state: string;
  district: string;
  groundName: string;
  date: string;
  lastRegistrationDate: string;
  entryFee: number;
  prizeAmount: number;
  maxTeams: number;
  registeredTeams: number;
  status: string;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  tournamentId: number;
  group: string;
  members: number;
}

export function normalizeTournament(t: any): Tournament {
  return {
    id: Number(t.id),
    name: t.name || "",
    sportId: Number(t.sportId ?? t.sport_id ?? 1),
    location: t.location || "",
    state: t.state || "",
    district: t.district || "",
    groundName: t.groundName ?? t.ground_name ?? "",
    date: t.date || "",
    lastRegistrationDate: t.lastRegistrationDate ?? t.last_registration_date ?? "",
    entryFee: Number(t.entryFee ?? t.entry_fee ?? 0),
    prizeAmount: Number(t.prizeAmount ?? t.prize_amount ?? 0),
    maxTeams: Number(t.maxTeams ?? t.max_teams ?? 16),
    registeredTeams: Number(t.registeredTeams ?? t.registered_teams ?? 0),
    status: t.status || "upcoming",
    description: t.description || "",
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

// Fetch all sports directly from Supabase
export async function getSports(): Promise<Sport[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) {
        return data as Sport[];
      }
      if (error) {
        console.error("Supabase sports query error:", error);
      }
    } catch (err) {
      console.error("Error fetching sports from Supabase:", err);
    }
  }
  return [];
}

// Fetch all tournaments directly from Supabase
export async function getTournaments(): Promise<Tournament[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) {
        return data.map(normalizeTournament);
      }
      if (error) {
        console.error("Supabase tournaments query error:", error);
      }
    } catch (err) {
      console.error("Error fetching tournaments from Supabase:", err);
    }
  }
  return [];
}

// Fetch tournament by ID directly from Supabase
export async function getTournamentById(id: number): Promise<Tournament | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return normalizeTournament(data);
      }
      if (error) {
        console.error("Supabase tournament by id error:", error);
      }
    } catch (err) {
      console.error("Error fetching tournament from Supabase:", err);
    }
  }
  return null;
}

// Fetch teams for a tournament directly from Supabase
export async function getTeamsByTournamentId(tournamentId: number): Promise<Team[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("id", { ascending: true });
      if (!error && data) {
        return data.map(normalizeTeam);
      }
      if (error) {
        console.error("Supabase teams query error:", error);
      }
    } catch (err) {
      console.error("Error fetching teams from Supabase:", err);
    }
  }
  return [];
}

// Fetch team by ID directly from Supabase
export async function getTeamById(id: number): Promise<Team | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return normalizeTeam(data);
      }
      if (error) {
        console.error("Supabase team by id error:", error);
      }
    } catch (err) {
      console.error("Error fetching team from Supabase:", err);
    }
  }
  return null;
}

// Create tournament in Supabase
export async function createTournament(tournament: Partial<Tournament>): Promise<{ success: boolean; data?: any; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        name: tournament.name,
        sport_id: tournament.sportId,
        location: tournament.location,
        state: tournament.state,
        district: tournament.district,
        ground_name: tournament.groundName,
        date: tournament.date,
        last_registration_date: tournament.lastRegistrationDate,
        entry_fee: tournament.entryFee,
        prize_amount: tournament.prizeAmount,
        max_teams: tournament.maxTeams,
        registered_teams: 0,
        status: "upcoming",
        description: tournament.description,
      };

      const { data, error } = await supabase.from("tournaments").insert([payload]).select().single();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: normalizeTournament(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}

// Fetch total teams count in database
export async function getTotalTeamsCount(): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { count, error } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        return count;
      }
    } catch (err) {
      console.error("Error fetching total teams count:", err);
    }
  }
  return 0;
}

// Register team in Supabase
export async function registerTeam(team: { name: string; tournamentId: number; group?: string; members?: number }): Promise<{ success: boolean; data?: any; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        name: team.name,
        tournament_id: team.tournamentId,
        group: team.group || "A",
        members: team.members || 11,
      };
      const { data, error } = await supabase.from("teams").insert([payload]).select().single();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: normalizeTeam(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}
