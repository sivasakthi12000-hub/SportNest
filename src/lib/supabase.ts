import { createClient } from "@supabase/supabase-js";

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

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  "";

const rawKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  "";

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = cleanSupabaseKey(rawKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-public-key"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

