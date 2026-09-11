/**
 * Approvals Service
 * Manages pending team registrations and approval/rejection workflows.
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
  paymentStatus: "Verified Paid" | "Pending Verification" | "Cash on Venue";
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  notes?: string;
}

const STORAGE_KEY = "sportsnest_pending_approvals";

const DEFAULT_PENDING_REGISTRATIONS: PendingRegistration[] = [
  {
    id: "APP-101",
    teamName: "Kovai Thunderbolts",
    tournamentId: 1,
    tournamentName: "Chennai Super Cup Soccer Championship",
    sportName: "Soccer",
    captainName: "Karthik Raja",
    contactPhone: "+91 98421 55670",
    email: "karthik.raja@gmail.com",
    memberCount: 11,
    entryFee: 1500,
    paymentStatus: "Verified Paid",
    status: "pending",
    appliedAt: "2026-09-11T08:30:00.000Z",
    notes: "State-level qualified team with verified Aadhaar credentials.",
  },
  {
    id: "APP-102",
    teamName: "Madurai Veeran Kabaddi Club",
    tournamentId: 5,
    tournamentName: "Tamil Nadu State Pro Kabaddi Trophy",
    sportName: "Kabaddi",
    captainName: "M. Saravanan",
    contactPhone: "+91 94432 78910",
    email: "saravanan.kabaddi@gmail.com",
    memberCount: 7,
    entryFee: 800,
    paymentStatus: "Verified Paid",
    status: "pending",
    appliedAt: "2026-09-11T09:15:00.000Z",
    notes: "Division 1 champions from southern zone.",
  },
  {
    id: "APP-103",
    teamName: "Kongu Spike Strikers",
    tournamentId: 6,
    tournamentName: "Erode District Floodlight Volleyball Open",
    sportName: "Volleyball",
    captainName: "Pradeep Kumar",
    contactPhone: "+91 97880 12345",
    email: "pradeep.spike@gmail.com",
    memberCount: 6,
    entryFee: 600,
    paymentStatus: "Pending Verification",
    status: "pending",
    appliedAt: "2026-09-10T18:45:00.000Z",
    notes: "UTR transaction confirmation attached.",
  },
  {
    id: "APP-104",
    teamName: "Salem Smashers Badminton Squad",
    tournamentId: 8,
    tournamentName: "Salem Open Badminton Grand Prix",
    sportName: "Badminton",
    captainName: "Ananya Balan",
    contactPhone: "+91 99520 87654",
    email: "ananya.balan@outlook.com",
    memberCount: 4,
    entryFee: 1000,
    paymentStatus: "Verified Paid",
    status: "pending",
    appliedAt: "2026-09-10T16:20:00.000Z",
    notes: "Includes 2 seeded junior ranking players.",
  },
];

function getStoredApprovals(): PendingRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  return DEFAULT_PENDING_REGISTRATIONS;
}

function saveStoredApprovals(list: PendingRegistration[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export async function getPendingApprovals(): Promise<PendingRegistration[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
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
      }
    } catch {
      // Gracefully fall through to synced local store
    }
  }
  return getStoredApprovals();
}

export async function approveRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const list = getStoredApprovals();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false, error: "Registration not found" };

  target.status = "approved";
  saveStoredApprovals(list);

  // Attempt to register in Supabase teams table
  try {
    await registerTeam({
      name: target.teamName,
      tournamentId: target.tournamentId,
      group: "A",
      members: target.memberCount,
    });
  } catch (err) {
    console.warn("Could not register team in Supabase:", err);
  }

  const client = getSupabase();
  if (client) {
    try {
      await client
        .from("registrations")
        .update({ status: "approved" })
        .eq("id", id);
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
  const list = getStoredApprovals();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false, error: "Registration not found" };

  target.status = "rejected";
  if (reason) target.notes = `Rejected: ${reason}`;
  saveStoredApprovals(list);

  const client = getSupabase();
  if (client) {
    try {
      await client
        .from("registrations")
        .update({ status: "rejected" })
        .eq("id", id);
    } catch {
      // Table may not exist; local state is preserved
    }
  }

  return { success: true };
}

export async function getPendingApprovalsCount(): Promise<number> {
  const items = await getPendingApprovals();
  return items.filter((i) => i.status === "pending").length;
}
