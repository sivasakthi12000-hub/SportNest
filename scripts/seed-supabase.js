/**
 * Supabase Seed Script
 * Run with:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-supabase.js
 * Or set them in .env and run:
 *   node scripts/seed-supabase.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required in .env or environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Starting Supabase Database Seeding...");

  // 1. Seed Sports
  const sports = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/sports.json"), "utf8"));
  console.log(`Uploading ${sports.length} sports...`);
  const { error: sportsError } = await supabase
    .from("sports")
    .upsert(sports.map(s => ({ id: s.id, name: s.name, image: s.image })));
  if (sportsError) {
    console.error("Failed to seed sports:", sportsError);
  } else {
    console.log("✅ Sports seeded successfully.");
  }

  // 2. Seed Tournaments
  const tournaments = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/tournaments.json"), "utf8"));
  console.log(`Uploading ${tournaments.length} tournaments...`);
  const tournamentRows = tournaments.map(t => ({
    id: t.id,
    name: t.name,
    sport_id: t.sportId,
    location: t.location,
    state: t.state,
    district: t.district,
    ground_name: t.groundName,
    date: t.date,
    last_registration_date: t.lastRegistrationDate,
    entry_fee: t.entryFee,
    prize_amount: t.prizeAmount,
    max_teams: t.maxTeams,
    registered_teams: t.registeredTeams,
    status: t.status,
    description: t.description,
  }));

  const { error: tourError } = await supabase.from("tournaments").upsert(tournamentRows);
  if (tourError) {
    console.error("Failed to seed tournaments:", tourError);
  } else {
    console.log("✅ Tournaments seeded successfully.");
  }

  // 3. Seed Teams in batches of 200
  const teams = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/teams.json"), "utf8"));
  console.log(`Uploading ${teams.length} teams in batches...`);
  const batchSize = 200;
  for (let i = 0; i < teams.length; i += batchSize) {
    const chunk = teams.slice(i, i + batchSize).map(m => ({
      id: m.id,
      name: m.name,
      tournament_id: m.tournamentId,
      group: m.group,
      members: m.members,
    }));

    const { error: teamErr } = await supabase.from("teams").upsert(chunk);
    if (teamErr) {
      console.error(`Error seeding teams batch ${i} - ${i + batchSize}:`, teamErr);
    } else {
      process.stdout.write(`.` );
    }
  }
  console.log("\n✅ All teams seeded successfully!");
  console.log("🎉 Seeding complete!");
}

seed().catch(err => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
