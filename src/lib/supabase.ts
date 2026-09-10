import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Sanitizes the Supabase URL:
 * - Strips enclosing quotes and extraneous whitespace
 * - Strips any accidental `/rest/v1` or `/rest/v1/` suffixes (common mistake when copying from Supabase API dashboard)
 * - Removes trailing slashes
 * - Ensures valid https/http protocol
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  // Strip surrounding quotes
  url = url.replace(/^["']|["']$/g, "");
  // If the user copied the REST API endpoint (e.g. https://<id>.supabase.co/rest/v1 or /rest/v1/), strip /rest/v1
  url = url.replace(/\/rest\/v1\/?$/i, "");
  // Strip any trailing slashes
  url = url.replace(/\/+$/, "");
  return url;
}

export function cleanSupabaseKey(rawKey: string): string {
  if (!rawKey) return "";
  let key = rawKey.trim();
  key = key.replace(/^["']|["']$/g, "");
  return key;
}

export function isValidConfig(url: string, key: string): boolean {
  return Boolean(
    url &&
      key &&
      (url.startsWith("https://") || url.startsWith("http://")) &&
      url !== "https://your-project-id.supabase.co" &&
      key !== "your-anon-public-key"
  );
}

const STORAGE_URL_KEY = "arenasync_supabase_url";
const STORAGE_KEY_KEY = "arenasync_supabase_anon_key";

function resolveInitialCredentials(): { url: string; key: string; source: string } {
  // 1. Check localStorage first (user runtime configuration)
  try {
    if (typeof localStorage !== "undefined") {
      const localUrl = localStorage.getItem(STORAGE_URL_KEY) || localStorage.getItem("sportnest_supabase_url");
      const localKey = localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem("sportnest_supabase_anon_key");
      if (localUrl && localKey && isValidConfig(cleanSupabaseUrl(localUrl), cleanSupabaseKey(localKey))) {
        return { url: cleanSupabaseUrl(localUrl), key: cleanSupabaseKey(localKey), source: "localStorage" };
      }
    }
  } catch {
    // Ignore localStorage access errors
  }

  // 2. Check window.__ENV__ (server runtime injection)
  if (typeof window !== "undefined") {
    const winEnv = (window as any).__ENV__;
    if (winEnv) {
      const envUrl = winEnv.VITE_SUPABASE_URL || winEnv.SUPABASE_URL;
      const envKey = winEnv.VITE_SUPABASE_ANON_KEY || winEnv.SUPABASE_ANON_KEY;
      if (envUrl && envKey && isValidConfig(cleanSupabaseUrl(envUrl), cleanSupabaseKey(envKey))) {
        return { url: cleanSupabaseUrl(envUrl), key: cleanSupabaseKey(envKey), source: "window.__ENV__" };
      }
    }
  }

  // 3. Check import.meta.env (Vite build-time variables)
  const metaUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const metaKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
  if (metaUrl && metaKey && isValidConfig(cleanSupabaseUrl(metaUrl), cleanSupabaseKey(metaKey))) {
    return { url: cleanSupabaseUrl(metaUrl), key: cleanSupabaseKey(metaKey), source: "import.meta.env" };
  }

  return { url: "", key: "", source: "none" };
}

let activeCredentials = resolveInitialCredentials();
export let supabaseUrl = activeCredentials.url;
export let supabaseAnonKey = activeCredentials.key;
export let isSupabaseConfigured = isValidConfig(supabaseUrl, supabaseAnonKey);

let activeClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

type ConfigListener = (configured: boolean, client: SupabaseClient | null) => void;
const listeners = new Set<ConfigListener>();

export function getSupabase(): SupabaseClient | null {
  return activeClient;
}

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured && activeClient !== null;
}

export function getSupabaseSource(): string {
  return activeCredentials.source;
}

export function setSupabaseConfig(rawNewUrl: string, rawNewKey: string, persist = true): { success: boolean; error?: string } {
  const newUrl = cleanSupabaseUrl(rawNewUrl);
  const newKey = cleanSupabaseKey(rawNewKey);

  if (!isValidConfig(newUrl, newKey)) {
    return {
      success: false,
      error: "Invalid Supabase URL or Anon Key. URL must start with https:// and a valid anon key is required.",
    };
  }

  try {
    activeClient = createClient(newUrl, newKey);
    supabaseUrl = newUrl;
    supabaseAnonKey = newKey;
    isSupabaseConfigured = true;
    activeCredentials = { url: newUrl, key: newKey, source: persist ? "localStorage" : "api" };

    if (persist) {
      try {
        localStorage.setItem(STORAGE_URL_KEY, newUrl);
        localStorage.setItem(STORAGE_KEY_KEY, newKey);
      } catch (e) {
        console.warn("Could not persist credentials to localStorage:", e);
      }
    }

    listeners.forEach((listener) => {
      try {
        listener(true, activeClient);
      } catch (err) {
        console.error("Config listener error:", err);
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to initialize Supabase client." };
  }
}

export function clearSupabaseConfig(): void {
  activeClient = null;
  supabaseUrl = "";
  supabaseAnonKey = "";
  isSupabaseConfigured = false;
  activeCredentials = { url: "", key: "", source: "none" };

  try {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
    localStorage.removeItem("sportnest_supabase_url");
    localStorage.removeItem("sportnest_supabase_anon_key");
  } catch {}

  listeners.forEach((listener) => {
    try {
      listener(false, null);
    } catch (err) {
      console.error("Config listener error:", err);
    }
  });
}

export function onSupabaseConfigChange(listener: ConfigListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface SupabaseHealthReport {
  connected: boolean;
  configured: boolean;
  url: string;
  source: string;
  sportsCount: number;
  tournamentsCount: number;
  teamsCount: number;
  error?: string;
  tableErrors?: {
    sports?: string;
    tournaments?: string;
    teams?: string;
  };
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthReport> {
  const report: SupabaseHealthReport = {
    connected: false,
    configured: isSupabaseConfigured,
    url: supabaseUrl,
    source: activeCredentials.source,
    sportsCount: 0,
    tournamentsCount: 0,
    teamsCount: 0,
    tableErrors: {},
  };

  if (!isSupabaseConfigured || !activeClient) {
    report.error = "Supabase is not configured. Please supply a project URL and anon public key.";
    return report;
  }

  try {
    // 1. Test sports
    const sportsRes = await activeClient.from("sports").select("*", { count: "exact", head: true });
    if (sportsRes.error) {
      report.tableErrors!.sports = sportsRes.error.message;
    } else {
      report.sportsCount = sportsRes.count ?? 0;
    }

    // 2. Test tournaments
    const tourneysRes = await activeClient.from("tournaments").select("*", { count: "exact", head: true });
    if (tourneysRes.error) {
      report.tableErrors!.tournaments = tourneysRes.error.message;
    } else {
      report.tournamentsCount = tourneysRes.count ?? 0;
    }

    // 3. Test teams
    const teamsRes = await activeClient.from("teams").select("*", { count: "exact", head: true });
    if (teamsRes.error) {
      report.tableErrors!.teams = teamsRes.error.message;
    } else {
      report.teamsCount = teamsRes.count ?? 0;
    }

    const hasAnyError =
      Boolean(report.tableErrors!.sports) ||
      Boolean(report.tableErrors!.tournaments) ||
      Boolean(report.tableErrors!.teams);

    if (!hasAnyError) {
      report.connected = true;
    } else {
      report.connected = Boolean(
        !report.tableErrors!.sports ||
        !report.tableErrors!.tournaments ||
        !report.tableErrors!.teams
      );
      report.error =
        report.tableErrors!.tournaments ||
        report.tableErrors!.sports ||
        report.tableErrors!.teams ||
        "Database returned errors during health check.";
    }
  } catch (err: any) {
    report.connected = false;
    report.error = err?.message || "Failed to reach Supabase API endpoint.";
  }

  return report;
}

// Check server /api/config asynchronously if not yet configured
if (typeof window !== "undefined" && !isSupabaseConfigured) {
  fetch("/api/config")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.supabaseUrl && data.supabaseAnonKey) {
        const cleanedUrl = cleanSupabaseUrl(data.supabaseUrl);
        const cleanedKey = cleanSupabaseKey(data.supabaseAnonKey);
        if (isValidConfig(cleanedUrl, cleanedKey)) {
          console.log("[Supabase] Automatically configured from server /api/config");
          setSupabaseConfig(cleanedUrl, cleanedKey, false);
        }
      }
    })
    .catch(() => {
      // Ignored in environments where server /api/config is not present
    });
}

// Safe proxy for existing `supabase` imports so it never crashes if client is re-initialized
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (activeClient) {
      const val = (activeClient as any)[prop];
      if (typeof val === "function") {
        return val.bind(activeClient);
      }
      return val;
    }
    // Safe dummy fallback so code calling supabase.from(...) doesn't throw a fatal TypeError
    if (prop === "from") {
      return (table: string) => {
        console.warn(`[Supabase Proxy] Attempted to query table "${table}" before Supabase was configured.`);
        const dummyQuery: any = {
          select: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          insert: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          update: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          delete: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          upsert: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          eq: () => dummyQuery,
          order: () => dummyQuery,
          single: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
          maybeSingle: () => Promise.resolve({ data: null, error: { message: "Supabase connection is not configured." } }),
        };
        return dummyQuery;
      };
    }
    return undefined;
  },
});
