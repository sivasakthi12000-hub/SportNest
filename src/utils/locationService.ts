/**
 * Location resolution helper
 * Retrieves states and districts dynamically, with Supabase integration.
 */
import { getSupabase } from "../lib/supabase";

export const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli (Trichy)",
    "Salem",
    "Tirunelveli",
    "Vellore",
    "Erode",
    "Tiruppur",
    "Dindigul",
    "Thanjavur",
    "Kanchipuram",
    "Chengalpattu",
    "Cuddalore",
    "Dharmapuri",
    "Kallakurichi",
    "Karur",
    "Krishnagiri",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Sivaganga",
    "Tenkasi",
    "Theni",
    "Thoothukudi",
    "Tirupathur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Villupuram",
    "Virudhunagar",
    "Ariyalur",
    "Kanyakumari",
  ],
  "Karnataka": [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Mangaluru (Dakshina Kannada)",
    "Hubballi-Dharwad",
    "Belagavi",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Ballari",
    "Davangere",
  ],
  "Kerala": [
    "Thiruvananthapuram",
    "Kochi (Ernakulam)",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kannur",
    "Alappuzha",
    "Palakkad",
    "Malappuram",
    "Kottayam",
  ],
  "Maharashtra": [
    "Mumbai City",
    "Mumbai Suburban",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad (Chhatrapati Sambhaji Nagar)",
    "Solapur",
    "Kolhapur",
  ],
  "Telangana": [
    "Hyderabad",
    "Rangareddy",
    "Medchal-Malkajgiri",
    "Warangal",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada (NTR)",
    "Guntur",
    "Tirupati",
    "Nellore",
    "Kurnool",
    "Kakinada",
  ],
  "Delhi NCR": [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "Central Delhi",
  ],
};

export async function getIndianLocationsFromSupabase(): Promise<Record<string, string[]>> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("tournaments")
        .select("state, district")
        .not("state", "is", null);

      if (!error && data && data.length > 0) {
        const result: Record<string, Set<string>> = {};
        data.forEach((row: any) => {
          const s = row.state?.trim();
          const d = row.district?.trim();
          if (s) {
            if (!result[s]) result[s] = new Set<string>();
            if (d) result[s].add(d);
          }
        });

        // Merge with existing base
        const merged: Record<string, string[]> = { ...INDIAN_STATES_DISTRICTS };
        Object.entries(result).forEach(([st, dists]) => {
          const existing = new Set(merged[st] || []);
          dists.forEach((d) => existing.add(d));
          merged[st] = Array.from(existing).sort();
        });
        return merged;
      }
    } catch {
      // Ignore
    }
  }
  return INDIAN_STATES_DISTRICTS;
}

export function getAvailableStates(): string[] {
  return Object.keys(INDIAN_STATES_DISTRICTS);
}

export function getDistrictsForState(stateName: string): string[] {
  if (!stateName) return [];
  return INDIAN_STATES_DISTRICTS[stateName] || [];
}
