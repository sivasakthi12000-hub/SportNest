/**
 * Approvals Service
 * Manages pending team registrations and approval/rejection workflows.
 * Connects directly to persistent backend API and Supabase registrations table.
 */
import { getSupabase } from "../lib/supabase";
import { registerTeam } from "./dataService";

export interface PendingRegistration {
  id: string;
  teamName: string;
  tournamentId: number;
  tournamentName: string;
  sportName: string;
  captainName: string;
  contactPhone: string;
  email: string;
  memberCount: number;
  entryFee: number;
  paymentStatus: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  notes?: string;
}

const STORAGE_KEY = "sportsnest_pending_approvals";

function getStoredApprovals(): PendingRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveStoredApprovals(list: PendingRegistration[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export async function getPendingApprovals(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}): Promise<{
  registrations: PendingRegistration[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}> {
  // 1. Try backend API with server-side pagination
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));
    if (options?.search) params.set("search", options.search);
    if (options?.status) params.set("status", options.status);

    const res = await fetch(`/api/approvals?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.registrations) {
        saveStoredApprovals(data.registrations);
        return {
          registrations: data.registrations,
          total: data.total || data.registrations.length,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        };
      }
    }
  } catch (err) {
    console.warn("Backend approvals query notice:", err);
  }

  // 2. Try Supabase
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: String(d.id),
          teamName: d.team_name || d.name || "Pending Squad",
          tournamentId: Number(d.tournament_id || 1),
          tournamentName: d.tournament_name || "Official Tournament",
          sportName: d.sport_name || "Sports",
          captainName: d.captain_name || d.contact_person || "Captain",
          contactPhone: d.phone || d.contact_phone || "+91 98000 00000",
          email: d.email || "team@sportsnest.org",
          memberCount: Number(d.members_count || d.member_count || 11),
          entryFee: Number(d.entry_fee || 0),
          paymentStatus: d.payment_status || "Verified Paid",
          status: d.status || "pending",
          appliedAt: d.created_at || new Date().toISOString(),
          notes: d.notes,
        }));
        return { registrations: mapped, total: mapped.length };
      }
    } catch {
      // Gracefully fall through to synced local store
    }
  }

  const local = getStoredApprovals();
  return { registrations: local, total: local.length };
}

export async function submitRegistration(
  reg: Partial<PendingRegistration>
): Promise<{ success: boolean; registration?: PendingRegistration; error?: string }> {
  try {
    const res = await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, registration: data.registration };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to submit registration" };
}

export async function updateRegistration(
  id: string,
  updates: Partial<PendingRegistration>
): Promise<{ success: boolean; registration?: PendingRegistration; error?: string }> {
  try {
    const res = await fetch(`/api/approvals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, registration: data.registration };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to update registration" };
}

export async function approveRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/approvals/${id}/approve`, { method: "POST" });
    if (res.ok) {
      return { success: true };
    }
  } catch (err: any) {
    console.warn("Backend approve notice:", err);
  }

  const list = getStoredApprovals();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false, error: "Registration not found" };

  target.status = "approved";
  saveStoredApprovals(list);

  try {
    await registerTeam({
      name: target.teamName,
      tournamentId: target.tournamentId,
      tournamentName: target.tournamentName,
      group: "A",
      members: target.memberCount,
    });
  } catch (err) {
    console.warn("Could not register team in Supabase:", err);
  }

  const client = getSupabase();
  if (client) {
    try {
      await client.from("registrations").update({ status: "approved" }).eq("id", id);
    } catch {
      // Table may not exist; local state is preserved
    }
  }

  return { success: true };
}

export async function rejectRegistration(
  id: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/approvals/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      return { success: true };
    }
  } catch (err: any) {
    console.warn("Backend reject notice:", err);
  }

  const list = getStoredApprovals();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false, error: "Registration not found" };

  target.status = "rejected";
  if (reason) target.notes = `Rejected: ${reason}`;
  saveStoredApprovals(list);

  const client = getSupabase();
  if (client) {
    try {
      await client.from("registrations").update({ status: "rejected" }).eq("id", id);
    } catch {
      // Table may not exist; local state is preserved
    }
  }

  return { success: true };
}

export async function deleteRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/approvals/${id}`, { method: "DELETE" });
    if (res.ok) return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const list = getStoredApprovals().filter((item) => item.id !== id);
  saveStoredApprovals(list);
  return { success: true };
}

export async function getPendingApprovalsCount(): Promise<number> {
  const result = await getPendingApprovals({ status: "pending" });
  return result.total || 0;
}
