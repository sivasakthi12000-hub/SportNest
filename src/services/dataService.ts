import { supabase, isSupabaseConfigured } from "../lib/supabase";

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
        return data.map(normalizeSport);
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

      // Increment registered_teams count on tournament
      try {
        const { data: tourney } = await supabase
          .from("tournaments")
          .select("registered_teams")
          .eq("id", team.tournamentId)
          .single();
        if (tourney) {
          await supabase
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
  if (isSupabaseConfigured && supabase) {
    try {
      // First try join query
      const { data, error } = await supabase
        .from("teams")
        .select("*, tournaments(id, name)")
        .order("id", { ascending: false });

      if (!error && data) {
        return data.map((t: any) => ({
          ...normalizeTeam(t),
          tournamentName: t.tournaments?.name || `Tournament #${t.tournament_id || t.tournamentId}`,
          createdAt: t.created_at || "",
        }));
      }

      // Fallback query if foreign key join is restricted
      const { data: simpleTeams } = await supabase
        .from("teams")
        .select("*")
        .order("id", { ascending: false });

      if (simpleTeams) {
        return simpleTeams.map(normalizeTeam);
      }
    } catch (err) {
      console.error("Error fetching all teams from Supabase:", err);
    }
  }
  return [];
}

// Delete a tournament from Supabase
export async function deleteTournament(id: number): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("teams").delete().eq("tournament_id", id);
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
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
  if (isSupabaseConfigured && supabase) {
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
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.lastRegistrationDate !== undefined) payload.last_registration_date = updates.lastRegistrationDate;

      const { error } = await supabase.from("tournaments").update(payload).eq("id", id);
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) return { success: false, error: error.message };

      if (tournamentId) {
        try {
          const { data: tourney } = await supabase
            .from("tournaments")
            .select("registered_teams")
            .eq("id", tournamentId)
            .single();
          if (tourney && (tourney.registered_teams || 0) > 0) {
            await supabase
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

// Create sport in Supabase
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
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        name: sport.name,
        ground_name: sport.groundName || "",
        surface: sport.surface || "",
        format: sport.format || "",
        rules: sport.rules || "",
        description: sport.description || "",
        accent_color: sport.accentColor || "#10b981",
      };
      const { data, error } = await supabase.from("sports").insert([payload]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: normalizeSport(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Supabase connection is not configured." };
}
