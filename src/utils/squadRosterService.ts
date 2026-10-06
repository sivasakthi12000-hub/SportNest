/**
 * Squad Roster Service
 *
 * Provides realistic, sport-specific squad rosters and player profiles
 * with positions, jersey numbers, physiological stats, and performance metrics
 * matching modern 3D locker room broadcasts.
 */

export const SquadPlayer = {};

export interface SquadPlayer {
  id: string | number;
  name: string;
  jerseyName: string; // Big surname displayed on back of kit
  number: number;
  role: string;
  category: "goalkeeper" | "defender" | "midfielder" | "forward" | "allrounder" | "other";
  positionDetail: string;
  age: number;
  dob: string;
  height: string;
  preferredFootOrHand: string;
  hometown: string;
  club: string;
  isCaptain?: boolean;
  isGoalkeeper?: boolean;
  status: "Starting Lineup" | "Substitute" | "Key Playmaker" | "Captain";
  stats: {
    matches: number;
    primaryLabel: string;
    primaryValue: string | number;
    secondaryLabel: string;
    secondaryValue: string | number;
    rating: number; // 6.0 - 9.9
  };
}

const ROSTER_CACHE_KEY_PREFIX = "sportsnest_team_roster_";

// Indian & International player name pools for realistic squad synthesis
const FIRST_NAMES = [
  "Rizky", "Kevin", "Shayne", "Elkan", "Dean", "Nathan", "Arjun", "Kavish",
  "Rohit", "Vikram", "Pranav", "Dinesh", "Siddharth", "Aman", "Farhan",
  "Aditya", "Manish", "Gautam", "Tarun", "Naveen", "Surya", "Harish", "Ashwin"
];

const LAST_NAMES = [
  "Pratama", "Diks", "Pattynama", "Baggott", "James", "Tjoe-A-On", "Sharma", "Kumar",
  "Verma", "Reddy", "Patel", "Singh", "Nair", "Sundaram", "Choudhury",
  "Rao", "Pandey", "Mehta", "Iyer", "Gill", "Sen", "Pillai", "Das"
];

const CITIES = [
  "Chennai, TN", "Bengaluru, KA", "Hyderabad, TS", "Mumbai, MH", "Kochi, KL",
  "Kolkata, WB", "Delhi, DL", "Chandigarh, PB", "Pune, MH", "Coimbatore, TN",
  "Madurai, TN", "Ahmedabad, GJ", "Jaipur, RJ", "Goa, GA"
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Builds sport-specific squad configuration
 */
export function getSportRosterTemplate(sportName: string = "Soccer") {
  const s = sportName.toLowerCase();

  if (s.includes("cricket")) {
    return {
      categories: [
        { key: "all", label: "ALL SQUAD" },
        { key: "batter", label: "BATSMEN" },
        { key: "allrounder", label: "ALL-ROUNDERS" },
        { key: "wicketkeeper", label: "WICKET-KEEPERS" },
        { key: "bowler", label: "BOWLERS" },
      ],
      primaryStat: "Runs",
      secondaryStat: "Wickets / SR",
      defaultPositions: [
        { role: "Opening Batsman", category: "batter", isGk: false },
        { role: "Top-Order Batter", category: "batter", isGk: false },
        { role: "Wicket-Keeper Batter", category: "wicketkeeper", isGk: true },
        { role: "Middle-Order Batsman", category: "batter", isGk: false },
        { role: "Batting All-Rounder", category: "allrounder", isGk: false },
        { role: "Bowling All-Rounder", category: "allrounder", isGk: false },
        { role: "Spin Bowler", category: "bowler", isGk: false },
        { role: "Fast Bowler (Pacer)", category: "bowler", isGk: false },
        { role: "Right-Arm Fast Pacer", category: "bowler", isGk: false },
        { role: "Left-Arm Orthodox", category: "bowler", isGk: false },
        { role: "Death-Over Specialist", category: "bowler", isGk: false },
      ],
    };
  }

  if (s.includes("kabaddi")) {
    return {
      categories: [
        { key: "all", label: "ALL SQUAD" },
        { key: "raider", label: "RAIDERS" },
        { key: "defender", label: "DEFENDERS" },
        { key: "allrounder", label: "ALL-ROUNDERS" },
      ],
      primaryStat: "Raid Pts",
      secondaryStat: "Tackle Pts",
      defaultPositions: [
        { role: "Lead Raider", category: "raider", isGk: false },
        { role: "Right Corner Defender", category: "defender", isGk: true },
        { role: "Left Corner Defender", category: "defender", isGk: true },
        { role: "Right Cover Defender", category: "defender", isGk: false },
        { role: "Left Cover Defender", category: "defender", isGk: false },
        { role: "Support Raider", category: "raider", isGk: false },
        { role: "All-Rounder Playmaker", category: "allrounder", isGk: false },
      ],
    };
  }

  if (s.includes("basket")) {
    return {
      categories: [
        { key: "all", label: "ALL SQUAD" },
        { key: "guard", label: "GUARDS" },
        { key: "forward", label: "FORWARDS" },
        { key: "center", label: "CENTERS" },
      ],
      primaryStat: "PPG",
      secondaryStat: "RPG / APG",
      defaultPositions: [
        { role: "Point Guard (PG)", category: "guard", isGk: false },
        { role: "Shooting Guard (SG)", category: "guard", isGk: false },
        { role: "Small Forward (SF)", category: "forward", isGk: false },
        { role: "Power Forward (PF)", category: "forward", isGk: false },
        { role: "Center (C)", category: "center", isGk: true },
      ],
    };
  }

  // Default: Football / Soccer / Multi-Sport
  return {
    categories: [
      { key: "all", label: "ALL PLAYERS" },
      { key: "goalkeeper", label: "GOALKEEPERS" },
      { key: "defender", label: "DEFENDERS" },
      { key: "midfielder", label: "MIDFIELDERS" },
      { key: "forward", label: "FORWARDS" },
    ],
    primaryStat: "Goals",
    secondaryStat: "Assists / Caps",
    defaultPositions: [
      { role: "Goalkeeper (GK)", category: "goalkeeper", isGk: true },
      { role: "Center Back (CB)", category: "defender", isGk: false },
      { role: "Right Back (RB)", category: "defender", isGk: false },
      { role: "Left Back (LB)", category: "defender", isGk: false },
      { role: "Center Back (CB)", category: "defender", isGk: false },
      { role: "Defensive Midfielder (CDM)", category: "midfielder", isGk: false },
      { role: "Central Midfielder (CM)", category: "midfielder", isGk: false },
      { role: "Attacking Midfielder (CAM)", category: "midfielder", isGk: false },
      { role: "Right Winger (RW)", category: "forward", isGk: false },
      { role: "Left Winger (LW)", category: "forward", isGk: false },
      { role: "Center Forward / Striker (ST)", category: "forward", isGk: false },
    ],
  };
}

/**
 * Generates or retrieves rich squad roster for a team
 */
export function getTeamRoster(team: any, sportName: string = "Soccer"): SquadPlayer[] {
  if (!team) return [];

  // 1. Check local storage overrides for user-edited rosters
  try {
    const cached = localStorage.getItem(`${ROSTER_CACHE_KEY_PREFIX}${team.id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // 2. Check if team already has explicitly defined players array in database
  const explicitPlayers: any[] = Array.isArray(team.roster)
    ? team.roster
    : Array.isArray(team.players)
    ? team.players
    : [];

  const teamSeed = Math.abs(Number(team.id) || 1);
  const template = getSportRosterTemplate(sportName);
  const targetCount = Math.max(
    explicitPlayers.length > 0 ? explicitPlayers.length : 11,
    Number(team.members) || 11
  );

  const players: SquadPlayer[] = [];

  for (let i = 0; i < targetCount; i++) {
    const seed = teamSeed * 100 + i * 7;
    const posTemplate =
      template.defaultPositions[i % template.defaultPositions.length];

    // If explicit player info is present
    const explicit = explicitPlayers[i];
    let fullName = "";
    let jerseyNum = i + 1;

    if (explicit) {
      if (typeof explicit === "string") {
        fullName = explicit;
      } else {
        fullName = explicit.name || `Player ${i + 1}`;
        jerseyNum = Number(explicit.jersey || explicit.number || i + 1);
      }
    } else {
      const fIdx = Math.floor(pseudoRandom(seed) * FIRST_NAMES.length);
      const lIdx = Math.floor(pseudoRandom(seed + 1) * LAST_NAMES.length);
      fullName = `${FIRST_NAMES[fIdx]} ${LAST_NAMES[lIdx]}`;

      // Assign iconic squad numbers
      const squadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16, 17, 20, 21, 22, 23, 27, 33];
      jerseyNum = squadNumbers[i % squadNumbers.length];
    }

    const nameParts = fullName.trim().split(" ");
    const surname = nameParts[nameParts.length - 1].toUpperCase();

    const age = 19 + Math.floor(pseudoRandom(seed + 2) * 14);
    const birthYear = 2026 - age;
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
      Math.floor(pseudoRandom(seed + 3) * 12)
    ];
    const day = 1 + Math.floor(pseudoRandom(seed + 4) * 28);
    const dob = `${day} ${month} ${birthYear}`;

    const height = `${172 + Math.floor(pseudoRandom(seed + 5) * 20)} cm`;
    const preferredFoot = pseudoRandom(seed + 6) > 0.3 ? "Right" : "Left";
    const city = CITIES[Math.floor(pseudoRandom(seed + 7) * CITIES.length)];

    const matches = 12 + Math.floor(pseudoRandom(seed + 8) * 45);
    const rating = +(7.2 + pseudoRandom(seed + 9) * 2.3).toFixed(1);

    const isGk = posTemplate.isGk || i === 0;
    const isCapt = i === 1 || (team.captain && team.captain.toLowerCase().includes(surname.toLowerCase()));

    let status: SquadPlayer["status"] = i < 11 ? "Starting Lineup" : "Substitute";
    if (isCapt) status = "Captain";
    else if (rating >= 8.8) status = "Key Playmaker";

    players.push({
      id: explicit?.id || `p_${team.id}_${i + 1}`,
      name: fullName,
      jerseyName: surname,
      number: jerseyNum,
      role: explicit?.position || posTemplate.role,
      category: (posTemplate.category as any) || "other",
      positionDetail: posTemplate.role,
      age,
      dob,
      height,
      preferredFootOrHand: `${preferredFoot} Foot`,
      hometown: city,
      club: team.name || "SportsNest",
      isCaptain: Boolean(isCapt),
      isGoalkeeper: isGk,
      status,
      stats: {
        matches,
        primaryLabel: template.primaryStat,
        primaryValue: isGk ? Math.floor(matches * 0.4) : Math.floor(matches * 0.35 + pseudoRandom(seed + 10) * 8),
        secondaryLabel: template.secondaryStat,
        secondaryValue: isGk ? "Clean Sheets" : Math.floor(matches * 0.25),
        rating,
      },
    });
  }

  return players;
}

/**
 * Persists a customized squad roster for a team
 */
export function saveTeamCustomRoster(teamId: number, roster: SquadPlayer[]) {
  try {
    localStorage.setItem(`${ROSTER_CACHE_KEY_PREFIX}${teamId}`, JSON.stringify(roster));
  } catch (err) {
    console.warn("Failed to persist custom team roster:", err);
  }
}
