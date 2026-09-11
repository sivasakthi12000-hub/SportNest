/**
 * Matches Service
 * Provides live and scheduled matches for today with real-time scorelines,
 * arena grounds, and dispute statuses.
 */
import { Tournament } from "./dataService";

export interface TeamCombatant {
  name: string;
  score: string;
  detail?: string;
  logo?: string;
  crestType?: "shield-lightning" | "lion-crown" | "eagle-wings" | "fire-ball" | "tiger-claw" | "falcon-blade";
  accentColor?: string;
  secondaryColor?: string;
}

export interface LiveMatch {
  id: string;
  matchNumber: number;
  tournamentId: number;
  tournamentName: string;
  sportName: string;
  sportIcon: string;
  round: string;
  teamA: TeamCombatant;
  teamB: TeamCombatant;
  status: "live" | "today" | "completed" | "disputed";
  statusLabel: string;
  timeDisplay: string;
  matchTimePill?: string; // e.g. "17H30" or "LIVE"
  groundName: string;
  location: string;
  hasDispute?: boolean;
  disputeNotes?: string;
}

export function generateTodayMatches(tournaments: Tournament[]): LiveMatch[] {
  const list: LiveMatch[] = [
    {
      id: "M-401",
      matchNumber: 1,
      tournamentId: 1,
      tournamentName: "Chennai Super Cup Soccer Championship",
      sportName: "Soccer",
      sportIcon: "⚽",
      round: "Quarter-Final",
      teamA: {
        name: "SUPER XI",
        score: "2",
        detail: "45', 71'",
        crestType: "shield-lightning",
        accentColor: "#8b5cf6",
        secondaryColor: "#fbbf24",
      },
      teamB: {
        name: "ROYAL LIONS",
        score: "1",
        detail: "58'",
        crestType: "lion-crown",
        accentColor: "#f59e0b",
        secondaryColor: "#dc2626",
      },
      status: "live",
      statusLabel: "Live 78'",
      timeDisplay: "78th Min In-Play",
      matchTimePill: "17H30",
      groundName: "Jawaharlal Nehru Stadium",
      location: "Chennai",
      hasDispute: false,
    },
    {
      id: "M-402",
      matchNumber: 2,
      tournamentId: 4,
      tournamentName: "Tamil Nadu Premier T20 Cricket Trophy",
      sportName: "Cricket",
      sportIcon: "🏏",
      round: "Super 8 Match",
      teamA: {
        name: "CHEPAUK WARRIORS",
        score: "148/4",
        detail: "(16.4 ov)",
        crestType: "fire-ball",
        accentColor: "#3b82f6",
        secondaryColor: "#f97316",
      },
      teamB: {
        name: "COIMBATORE BLASTERS",
        score: "162/7",
        detail: "(20.0 ov)",
        crestType: "tiger-claw",
        accentColor: "#ef4444",
        secondaryColor: "#10b981",
      },
      status: "live",
      statusLabel: "Live Chase",
      timeDisplay: "Need 15 runs in 20 balls",
      matchTimePill: "19H00",
      groundName: "M.A. Chidambaram Stadium",
      location: "Chennai",
      hasDispute: false,
    },
    {
      id: "M-403",
      matchNumber: 3,
      tournamentId: 5,
      tournamentName: "Tamil Nadu State Pro Kabaddi Trophy",
      sportName: "Kabaddi",
      sportIcon: "🤼",
      round: "Semi-Final 1",
      teamA: {
        name: "MADURAI VEERAN",
        score: "34",
        detail: "2 All-Outs",
        crestType: "eagle-wings",
        accentColor: "#059669",
        secondaryColor: "#eab308",
      },
      teamB: {
        name: "THANJAVUR CHOLAS",
        score: "32",
        detail: "Super Raid",
        crestType: "falcon-blade",
        accentColor: "#d97706",
        secondaryColor: "#4f46e5",
      },
      status: "live",
      statusLabel: "Live 2nd Half",
      timeDisplay: "Last 4 Minutes",
      matchTimePill: "18H15",
      groundName: "MGR Indoor Sports Complex",
      location: "Madurai",
      hasDispute: true,
      disputeNotes: "Bonus line review pending from referee table.",
    },
    {
      id: "M-404",
      matchNumber: 4,
      tournamentId: 3,
      tournamentName: "SDAT Chennai Open Tennis Trophy",
      sportName: "Tennis",
      sportIcon: "🎾",
      round: "Semi-Final",
      teamA: {
        name: "RAMANATHAN XI",
        score: "6, 4",
        detail: "Set 3: 3-2",
        crestType: "shield-lightning",
        accentColor: "#0284c7",
        secondaryColor: "#38bdf8",
      },
      teamB: {
        name: "MUKUND STARS",
        score: "3, 6",
        detail: "Set 3: 2-3",
        crestType: "lion-crown",
        accentColor: "#7c3aed",
        secondaryColor: "#f43f5e",
      },
      status: "today",
      statusLabel: "Scheduled Today",
      timeDisplay: "Today, 4:30 PM IST",
      matchTimePill: "16H30",
      groundName: "SDAT Tennis Stadium (Center Court)",
      location: "Chennai",
      hasDispute: false,
    },
    {
      id: "M-405",
      matchNumber: 5,
      tournamentId: 6,
      tournamentName: "Erode District Floodlight Volleyball Open",
      sportName: "Volleyball",
      sportIcon: "🏐",
      round: "Group B Decider",
      teamA: {
        name: "KONGU SPIKERS",
        score: "0",
        detail: "Upcoming",
        crestType: "fire-ball",
        accentColor: "#10b981",
        secondaryColor: "#047857",
      },
      teamB: {
        name: "SALEM HEIGHTS",
        score: "0",
        detail: "Upcoming",
        crestType: "eagle-wings",
        accentColor: "#6366f1",
        secondaryColor: "#a855f7",
      },
      status: "today",
      statusLabel: "Scheduled Today",
      timeDisplay: "Today, 6:00 PM IST",
      matchTimePill: "18H00",
      groundName: "VOC Park Floodlight Court",
      location: "Erode",
      hasDispute: false,
    },
    {
      id: "M-406",
      matchNumber: 6,
      tournamentId: 8,
      tournamentName: "Salem Open Badminton Grand Prix",
      sportName: "Badminton",
      sportIcon: "🏸",
      round: "Men's Singles Finals",
      teamA: {
        name: "PRANEETH ACADEMY",
        score: "21, 21",
        detail: "Winner",
        crestType: "falcon-blade",
        accentColor: "#f59e0b",
        secondaryColor: "#ea580c",
      },
      teamB: {
        name: "SRIKANTH CLUB",
        score: "18, 19",
        detail: "Runner",
        crestType: "shield-lightning",
        accentColor: "#0ea5e9",
        secondaryColor: "#6366f1",
      },
      status: "completed",
      statusLabel: "Completed",
      timeDisplay: "Finished Today (11:30 AM)",
      matchTimePill: "11H30",
      groundName: "Salem District Indoor Stadium",
      location: "Salem",
      hasDispute: false,
    },
  ];

  return list;
}
