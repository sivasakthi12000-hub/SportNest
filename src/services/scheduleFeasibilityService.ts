/**
 * Tournament Format Feasibility & Schedule Generator Service
 *
 * Implements real-time mathematical feasibility analysis and fixture scheduling
 * across all major tournament formats:
 * - Single Elimination (Knockout)
 * - Round Robin
 * - Group Stage + Knockout
 * - Double Elimination
 */

export type TournamentFormatType =
  | "Single Elimination (Knockout)"
  | "Round Robin"
  | "Group Stage + Knockout"
  | "Double Elimination";

export interface FeasibilityInputs {
  teams: number;
  venues: number;
  durationDays: number;
  matchDurationMinutes: number;
  playableHoursPerDay: number;
  format: TournamentFormatType;
  numGroups?: number;
  advancingPerGroup?: number;
}

export interface FormatComparisonItem {
  format: TournamentFormatType;
  requiredMatches: number;
  isFeasible: boolean;
  difference: number; // positive = surplus, negative = deficit
}

export interface FeasibilityResult {
  capacity: number; // matches possible
  requiredMatches: number; // matches required
  isFeasible: boolean;
  deficit: number; // matches short (0 if feasible)
  utilizationPercent: number;
  matchesPerVenuePerDay: number;
  totalVenues: number;
  durationDays: number;
  format: TournamentFormatType;
  suggestions: string[];
  comparisons: FormatComparisonItem[];
}

export interface ScheduledMatchFixture {
  id: string;
  matchNumber: number;
  roundName: string;
  stage: "group" | "knockout" | "winners" | "losers" | "final" | "round_robin";
  groupName?: string;
  dayIndex: number; // 1-based
  dateStr?: string;
  timeSlot: string; // e.g. "09:00 AM - 10:00 AM"
  venueName: string; // e.g. "Court 1" or "Pitch A"
  teamA: { id?: string | number; name: string; seed?: number };
  teamB: { id?: string | number; name: string; seed?: number };
  status: "scheduled" | "live" | "completed";
}

export interface GeneratedScheduleResult {
  format: TournamentFormatType;
  totalMatches: number;
  fixtures: ScheduledMatchFixture[];
  groups?: Record<string, Array<{ id?: string | number; name: string }>>;
  knockoutRounds?: string[];
}

/**
 * Calculate capacity:
 * venues * playable_hours_per_day * (60 / match_duration_minutes) * duration_days
 */
export function calculateMatchesCapacity(
  venues: number,
  playableHoursPerDay: number,
  matchDurationMinutes: number,
  durationDays: number
): { capacity: number; matchesPerVenuePerDay: number } {
  const safeVenues = Math.max(1, Number(venues) || 1);
  const safeHours = Math.max(1, Math.min(24, Number(playableHoursPerDay) || 9));
  const safeDuration = Math.max(15, Number(matchDurationMinutes) || 60);
  const safeDays = Math.max(1, Number(durationDays) || 1);

  const matchesPerVenuePerDay = Math.floor((safeHours * 60) / safeDuration);
  const capacity = safeVenues * matchesPerVenuePerDay * safeDays;

  return { capacity, matchesPerVenuePerDay };
}

/**
 * Calculate required matches for a specific format
 */
export function calculateRequiredMatchesForFormat(
  format: TournamentFormatType,
  teams: number,
  numGroups = 4,
  advancingPerGroup = 2
): number {
  const safeTeams = Math.max(2, Number(teams) || 2);

  switch (format) {
    case "Single Elimination (Knockout)":
      return Math.max(1, safeTeams - 1);

    case "Round Robin":
      return Math.max(1, Math.round((safeTeams * (safeTeams - 1)) / 2));

    case "Double Elimination":
      // Standard double elimination requires 2*(N-1) matches (plus potentially 1 grand final reset)
      return Math.max(2, 2 * (safeTeams - 1));

    case "Group Stage + Knockout": {
      const groupsCount = Math.max(2, Math.min(safeTeams, Number(numGroups) || 4));
      const advancing = Math.max(1, Number(advancingPerGroup) || 2);

      // Distribute teams evenly across groups
      const baseGroupSize = Math.floor(safeTeams / groupsCount);
      const remainder = safeTeams % groupsCount;

      let groupMatches = 0;
      for (let i = 0; i < groupsCount; i++) {
        const size = i < remainder ? baseGroupSize + 1 : baseGroupSize;
        if (size >= 2) {
          groupMatches += Math.round((size * (size - 1)) / 2);
        }
      }

      const totalAdvancing = Math.min(safeTeams, groupsCount * advancing);
      const knockoutMatches = Math.max(1, totalAdvancing - 1);

      return groupMatches + knockoutMatches;
    }

    default:
      return Math.max(1, safeTeams - 1);
  }
}

/**
 * Comprehensive Feasibility Analysis with alternative format recommendations
 */
export function analyzeScheduleFeasibility(inputs: FeasibilityInputs): FeasibilityResult {
  const { capacity, matchesPerVenuePerDay } = calculateMatchesCapacity(
    inputs.venues,
    inputs.playableHoursPerDay,
    inputs.matchDurationMinutes,
    inputs.durationDays
  );

  const requiredMatches = calculateRequiredMatchesForFormat(
    inputs.format,
    inputs.teams,
    inputs.numGroups,
    inputs.advancingPerGroup
  );

  const isFeasible = requiredMatches <= capacity;
  const deficit = Math.max(0, requiredMatches - capacity);
  const utilizationPercent = capacity > 0 ? Math.round((requiredMatches / capacity) * 100) : 100;

  // Compare all formats under the same capacity
  const allFormats: TournamentFormatType[] = [
    "Single Elimination (Knockout)",
    "Double Elimination",
    "Group Stage + Knockout",
    "Round Robin",
  ];

  const comparisons: FormatComparisonItem[] = allFormats.map((fmt) => {
    const req = calculateRequiredMatchesForFormat(
      fmt,
      inputs.teams,
      inputs.numGroups,
      inputs.advancingPerGroup
    );
    return {
      format: fmt,
      requiredMatches: req,
      isFeasible: req <= capacity,
      difference: capacity - req,
    };
  });

  // Actionable suggestions if schedule fails
  const suggestions: string[] = [];

  if (!isFeasible) {
    // 1. Alternate feasible format suggestion
    const feasibleAlternatives = comparisons.filter((c) => c.isFeasible && c.format !== inputs.format);
    if (feasibleAlternatives.length > 0) {
      const best = feasibleAlternatives[0];
      suggestions.push(
        `Switch to ${best.format} (requires only ${best.requiredMatches} matches, fits easily in your ${capacity} match capacity).`
      );
    }

    // 2. Venues suggestion
    const matchesPerDayTotal = matchesPerVenuePerDay * inputs.durationDays;
    if (matchesPerDayTotal > 0) {
      const minVenuesNeeded = Math.ceil(requiredMatches / matchesPerDayTotal);
      if (minVenuesNeeded > inputs.venues) {
        suggestions.push(
          `Increase venues from ${inputs.venues} to ${minVenuesNeeded} courts/pitches to keep this format and team count.`
        );
      }
    }

    // 3. Days suggestion
    const matchesPerDayAllVenues = matchesPerVenuePerDay * inputs.venues;
    if (matchesPerDayAllVenues > 0) {
      const minDaysNeeded = Math.ceil(requiredMatches / matchesPerDayAllVenues);
      if (minDaysNeeded > inputs.durationDays) {
        suggestions.push(
          `Extend tournament duration from ${inputs.durationDays} to ${minDaysNeeded} days to complete all ${requiredMatches} matches.`
        );
      }
    }

    // 4. Reduce teams suggestion
    if (inputs.format === "Round Robin" && inputs.teams > 4) {
      // Find max teams for round robin: N*(N-1)/2 <= capacity => N^2 - N - 2C <= 0
      const maxRRTeams = Math.floor((1 + Math.sqrt(1 + 8 * capacity)) / 2);
      if (maxRRTeams >= 2) {
        suggestions.push(
          `Reduce teams to ${maxRRTeams} to host a full Round Robin within ${capacity} matches.`
        );
      }
    } else if (inputs.format === "Single Elimination (Knockout)") {
      const maxKnockoutTeams = capacity + 1;
      suggestions.push(`Adjust teams to ${maxKnockoutTeams} or fewer.`);
    }
  }

  return {
    capacity,
    requiredMatches,
    isFeasible,
    deficit,
    utilizationPercent,
    matchesPerVenuePerDay,
    totalVenues: inputs.venues,
    durationDays: inputs.durationDays,
    format: inputs.format,
    suggestions,
    comparisons,
  };
}

/**
 * Auto-generate realistic match schedule & fixtures
 */
export function generateTournamentSchedule(
  inputs: FeasibilityInputs,
  confirmedTeams: Array<{ id: string | number; name: string }>,
  startDateStr?: string
): GeneratedScheduleResult {
  const teamsList =
    confirmedTeams.length >= 2
      ? confirmedTeams
      : Array.from({ length: inputs.teams }, (_, i) => ({
          id: `T-${i + 1}`,
          name: `Team ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ""}`,
        }));

  const fixtures: ScheduledMatchFixture[] = [];
  const venues = Array.from({ length: inputs.venues }, (_, i) => `Court / Pitch ${i + 1}`);
  const matchDuration = inputs.matchDurationMinutes || 60;
  const startHour = 9; // 9:00 AM

  // Time slot calculation helper
  const getTimeSlot = (matchIndex: number) => {
    const matchesPerDay = Math.floor((inputs.playableHoursPerDay * 60) / matchDuration);
    const day = Math.floor(matchIndex / (matchesPerDay * inputs.venues)) + 1;
    const slotInDay = Math.floor((matchIndex % (matchesPerDay * inputs.venues)) / inputs.venues);
    const venue = venues[matchIndex % inputs.venues];

    const totalMinutes = slotInDay * matchDuration;
    const startH = startHour + Math.floor(totalMinutes / 60);
    const startM = totalMinutes % 60;
    const endMinutes = totalMinutes + matchDuration;
    const endH = startHour + Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    const fmtTime = (h: number, m: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:${pad(m)} ${period}`;
    };

    let dateDisplay = `Day ${day}`;
    if (startDateStr) {
      try {
        const d = new Date(startDateStr);
        d.setDate(d.getDate() + (day - 1));
        dateDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {}
    }

    return {
      day,
      dateDisplay,
      venue,
      timeSlot: `${fmtTime(startH, startM)} - ${fmtTime(endH, endM)}`,
    };
  };

  // Format 1: Single Elimination
  if (inputs.format === "Single Elimination (Knockout)") {
    const totalRounds = Math.ceil(Math.log2(teamsList.length));
    const roundLabels = ["Final", "Semifinals", "Quarterfinals", "Round of 16", "Round of 32", "Round of 64"];

    let matchCount = 0;
    let currentTeams = [...teamsList];

    for (let r = 0; r < totalRounds; r++) {
      const roundMatchesCount = Math.floor(currentTeams.length / 2);
      const roundLabel =
        r === totalRounds - 1
          ? "Championship Final 🏆"
          : r === totalRounds - 2
          ? "Semifinals"
          : r === totalRounds - 3
          ? "Quarterfinals"
          : `Round of ${Math.pow(2, totalRounds - r)}`;

      const nextRoundTeams: Array<{ id: string | number; name: string }> = [];

      for (let m = 0; m < roundMatchesCount; m++) {
        const slot = getTimeSlot(matchCount);
        const t1 = currentTeams[m * 2];
        const t2 = currentTeams[m * 2 + 1] || { id: "T-BYE", name: "BYE" };

        fixtures.push({
          id: `M-${matchCount + 1}`,
          matchNumber: matchCount + 1,
          roundName: roundLabel,
          stage: r === totalRounds - 1 ? "final" : "knockout",
          dayIndex: slot.day,
          dateStr: slot.dateDisplay,
          timeSlot: slot.timeSlot,
          venueName: slot.venue,
          teamA: t1,
          teamB: t2,
          status: "scheduled",
        });

        nextRoundTeams.push({
          id: `W-M${matchCount + 1}`,
          name: `Winner Match ${matchCount + 1}`,
        });

        matchCount++;
      }

      currentTeams = nextRoundTeams;
    }

    return {
      format: inputs.format,
      totalMatches: fixtures.length,
      fixtures,
      knockoutRounds: roundLabels.slice(0, totalRounds).reverse(),
    };
  }

  // Format 2: Round Robin
  if (inputs.format === "Round Robin") {
    let matchCount = 0;
    const n = teamsList.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const slot = getTimeSlot(matchCount);
        fixtures.push({
          id: `RR-${matchCount + 1}`,
          matchNumber: matchCount + 1,
          roundName: `Round Robin • Match ${matchCount + 1}`,
          stage: "round_robin",
          dayIndex: slot.day,
          dateStr: slot.dateDisplay,
          timeSlot: slot.timeSlot,
          venueName: slot.venue,
          teamA: teamsList[i],
          teamB: teamsList[j],
          status: "scheduled",
        });
        matchCount++;
      }
    }

    return {
      format: inputs.format,
      totalMatches: fixtures.length,
      fixtures,
    };
  }

  // Format 3: Group Stage + Knockout
  if (inputs.format === "Group Stage + Knockout") {
    const groupsCount = Math.max(2, inputs.numGroups || 4);
    const groups: Record<string, Array<{ id: string | number; name: string }>> = {};

    for (let g = 0; g < groupsCount; g++) {
      const gLetter = String.fromCharCode(65 + g);
      groups[`Group ${gLetter}`] = [];
    }

    teamsList.forEach((team, idx) => {
      const gLetter = String.fromCharCode(65 + (idx % groupsCount));
      groups[`Group ${gLetter}`].push(team);
    });

    let matchCount = 0;

    // 1. Group Fixtures
    Object.entries(groups).forEach(([groupName, gTeams]) => {
      for (let i = 0; i < gTeams.length; i++) {
        for (let j = i + 1; j < gTeams.length; j++) {
          const slot = getTimeSlot(matchCount);
          fixtures.push({
            id: `GRP-${matchCount + 1}`,
            matchNumber: matchCount + 1,
            roundName: `${groupName} Fixture`,
            groupName,
            stage: "group",
            dayIndex: slot.day,
            dateStr: slot.dateDisplay,
            timeSlot: slot.timeSlot,
            venueName: slot.venue,
            teamA: gTeams[i],
            teamB: gTeams[j],
            status: "scheduled",
          });
          matchCount++;
        }
      }
    });

    // 2. Knockout Stage for Advancing Teams
    const advancing = Math.max(1, inputs.advancingPerGroup || 2);
    const knockoutTeamsCount = groupsCount * advancing;
    const knockoutRounds = Math.ceil(Math.log2(knockoutTeamsCount));

    for (let r = 0; r < knockoutRounds; r++) {
      const roundMatches = Math.pow(2, knockoutRounds - r - 1);
      const roundLabel =
        r === knockoutRounds - 1
          ? "Grand Final 🏆"
          : r === knockoutRounds - 2
          ? "Semifinals"
          : "Quarterfinals";

      for (let m = 0; m < roundMatches; m++) {
        const slot = getTimeSlot(matchCount);
        fixtures.push({
          id: `KO-${matchCount + 1}`,
          matchNumber: matchCount + 1,
          roundName: roundLabel,
          stage: r === knockoutRounds - 1 ? "final" : "knockout",
          dayIndex: slot.day,
          dateStr: slot.dateDisplay,
          timeSlot: slot.timeSlot,
          venueName: slot.venue,
          teamA: { name: `Group Qualifier ${m * 2 + 1}` },
          teamB: { name: `Group Qualifier ${m * 2 + 2}` },
          status: "scheduled",
        });
        matchCount++;
      }
    }

    return {
      format: inputs.format,
      totalMatches: fixtures.length,
      fixtures,
      groups,
    };
  }

  // Format 4: Double Elimination (Winners + Losers Bracket)
  let matchCount = 0;
  const n = teamsList.length;
  const totalRounds = Math.ceil(Math.log2(n));

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = Math.max(1, Math.floor(n / Math.pow(2, r + 1)));
    for (let m = 0; m < roundMatches; m++) {
      const slot = getTimeSlot(matchCount);
      fixtures.push({
        id: `DE-W-${matchCount + 1}`,
        matchNumber: matchCount + 1,
        roundName: `Winners Round ${r + 1}`,
        stage: "winners",
        dayIndex: slot.day,
        dateStr: slot.dateDisplay,
        timeSlot: slot.timeSlot,
        venueName: slot.venue,
        teamA: teamsList[m * 2] || { name: `Winner ${m * 2 + 1}` },
        teamB: teamsList[m * 2 + 1] || { name: `Winner ${m * 2 + 2}` },
        status: "scheduled",
      });
      matchCount++;
    }
  }

  // Losers Bracket
  const losersMatchesCount = Math.max(1, n - 2);
  for (let m = 0; m < losersMatchesCount; m++) {
    const slot = getTimeSlot(matchCount);
    fixtures.push({
      id: `DE-L-${matchCount + 1}`,
      matchNumber: matchCount + 1,
      roundName: `Elimination Round ${Math.floor(m / 2) + 1}`,
      stage: "losers",
      dayIndex: slot.day,
      dateStr: slot.dateDisplay,
      timeSlot: slot.timeSlot,
      venueName: slot.venue,
      teamA: { name: `Challenger ${m + 1}` },
      teamB: { name: `Repechage ${m + 2}` },
      status: "scheduled",
    });
    matchCount++;
  }

  // Grand Final
  const finalSlot = getTimeSlot(matchCount);
  fixtures.push({
    id: `DE-FINAL-${matchCount + 1}`,
    matchNumber: matchCount + 1,
    roundName: "Grand Final Championship 🏆",
    stage: "final",
    dayIndex: finalSlot.day,
    dateStr: finalSlot.dateDisplay,
    timeSlot: finalSlot.timeSlot,
    venueName: finalSlot.venue,
    teamA: { name: "Winners Bracket Champion" },
    teamB: { name: "Losers Bracket Champion" },
    status: "scheduled",
  });

  return {
    format: inputs.format,
    totalMatches: fixtures.length,
    fixtures,
  };
}
