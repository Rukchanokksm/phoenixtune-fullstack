/**
 * seed-cars-fh6.js
 * -----------------
 * Seeds all FH6 cars from car_data.json into the Supabase `cars` table.
 * Uses @supabase/supabase-js (HTTPS) — no direct DB connection needed.
 *
 *   node scripts/seed-cars-fh6.js
 *
 * Idempotent — duplicate rows are skipped via upsert ignoreDuplicates.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  console.log("📄 Loaded .env.local");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Load car_data.json
// class values: D, C, B, A, S1, S2, R, Unknown
//   "Unknown" → null (cars with TBA class)
//   All others map directly to pi_class enum
// drivetrain is not in car_data.json → defaults to null
// ---------------------------------------------------------------------------
const carDataPath = path.join(__dirname, "..", "car_data.json");
const carData = JSON.parse(fs.readFileSync(carDataPath, "utf8"));

function mapClass(cls) {
  if (!cls || cls === "Unknown") return null;
  return cls; // D, C, B, A, S1, S2, R all map directly
}

async function main() {
  const { data: game, error: gameErr } = await supabase
    .from("games")
    .select("id")
    .eq("slug", "forza-horizon-6")
    .single();

  if (gameErr || !game) {
    console.error(
      "❌ forza-horizon-6 not found in games table. Run migrations first.",
    );
    console.error(gameErr?.message);
    process.exit(1);
  }
  console.log("✅ FH6 game_id:", game.id);

  const rows = carData.map((car) => ({
    game_id: game.id,
    make: car.manufacturer,
    model: car.model,
    year: car.year,
    pi_class: mapClass(car.class),
    drivetrain: null,
  }));

  console.log(`📦 Total cars to seed: ${rows.length}`);

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("cars").upsert(batch, {
      onConflict: "game_id,make,model,year",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(
        `\n❌ Batch ${Math.floor(i / BATCH) + 1} error:`,
        error.message,
      );
    } else {
      inserted += batch.length;
      process.stdout.write(".");
    }
  }

  console.log(`\n\n🎉 Done! Processed ${inserted}/${rows.length} cars`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
