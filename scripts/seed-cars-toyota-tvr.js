/**
 * seed-cars-toyota-tvr.js
 * node scripts/seed-cars-toyota-tvr.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const eq = t.indexOf("=");
      if (eq === -1) return;
      const k = t.slice(0, eq).trim();
      const v = t
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    });
}

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// FH5 car data — pi_class/drivetrain/weight/power based on stock FH5 values
const CARS = [
  // ── Toyota ──────────────────────────────────────────────────────────────────
  {
    make: "Toyota",
    model: "Camry TRD",
    year: 2023,
    pi_class: "A",
    drivetrain: "FWD",
    weight_kg: 1600,
    power_hp: 301,
  },
  {
    make: "Toyota",
    model: "GR86",
    year: 2022,
    pi_class: "A",
    drivetrain: "RWD",
    weight_kg: 1270,
    power_hp: 235,
  },
  {
    make: "Toyota",
    model: "GR Yaris",
    year: 2021,
    pi_class: "A",
    drivetrain: "AWD",
    weight_kg: 1280,
    power_hp: 268,
  },
  {
    make: "Toyota",
    model: "GR Supra",
    year: 2020,
    pi_class: "A",
    drivetrain: "RWD",
    weight_kg: 1570,
    power_hp: 382,
  },
  {
    make: "Toyota",
    model: "Tundra TRD Pro",
    year: 2020,
    pi_class: "B",
    drivetrain: "AWD",
    weight_kg: 2268,
    power_hp: 381,
  },
  {
    make: "Toyota",
    model: "4Runner TRD Pro",
    year: 2019,
    pi_class: "C",
    drivetrain: "AWD",
    weight_kg: 2100,
    power_hp: 270,
  },
  {
    make: "Toyota",
    model: "Tacoma TRD Pro",
    year: 2019,
    pi_class: "C",
    drivetrain: "AWD",
    weight_kg: 1950,
    power_hp: 278,
  },
  {
    make: "Toyota",
    model: "Land Cruiser Arctic Trucks AT37",
    year: 2016,
    pi_class: "B",
    drivetrain: "AWD",
    weight_kg: 2800,
    power_hp: 309,
  },
  {
    make: "Toyota",
    model: "86",
    year: 2013,
    pi_class: "B",
    drivetrain: "RWD",
    weight_kg: 1238,
    power_hp: 200,
  },
  {
    make: "Toyota",
    model: "Hilux Arctic Trucks AT38",
    year: 2007,
    pi_class: "C",
    drivetrain: "RWD",
    weight_kg: 2000,
    power_hp: 171,
  },
  {
    make: "Toyota",
    model: "Celica Sport Specialty II",
    year: 2003,
    pi_class: "C",
    drivetrain: "FWD",
    weight_kg: 1090,
    power_hp: 190,
  },
  {
    make: "Toyota",
    model: "Supra RZ",
    year: 1998,
    pi_class: "S1",
    drivetrain: "RWD",
    weight_kg: 1560,
    power_hp: 276,
  },
  {
    make: "Toyota",
    model: "Supra RZ 'Welcome Pack'",
    year: 1998,
    pi_class: "S1",
    drivetrain: "RWD",
    weight_kg: 1560,
    power_hp: 276,
  },
  {
    make: "Toyota",
    model: "Soarer 2.5 GT-T",
    year: 1997,
    pi_class: "A",
    drivetrain: "RWD",
    weight_kg: 1680,
    power_hp: 280,
  },
  {
    make: "Toyota",
    model: "MR2 GT",
    year: 1995,
    pi_class: "A",
    drivetrain: "RWD",
    weight_kg: 1230,
    power_hp: 245,
  },
  {
    make: "Toyota",
    model: "Celica GT-Four ST205",
    year: 1994,
    pi_class: "A",
    drivetrain: "AWD",
    weight_kg: 1350,
    power_hp: 242,
  },
  {
    make: "Toyota",
    model: "#1 T100 Baja Truck",
    year: 1993,
    pi_class: "B",
    drivetrain: "RWD",
    weight_kg: 1800,
    power_hp: 150,
  },
  {
    make: "Toyota",
    model: "Celica GT-Four RC ST185",
    year: 1992,
    pi_class: "A",
    drivetrain: "AWD",
    weight_kg: 1350,
    power_hp: 242,
  },
  {
    make: "Toyota",
    model: "Supra 2.0 GT",
    year: 1992,
    pi_class: "B",
    drivetrain: "RWD",
    weight_kg: 1400,
    power_hp: 168,
  },
  {
    make: "Toyota",
    model: "Chaser GT Twin Turbo",
    year: 1991,
    pi_class: "A",
    drivetrain: "RWD",
    weight_kg: 1600,
    power_hp: 276,
  },
  {
    make: "Toyota",
    model: "Sera",
    year: 1991,
    pi_class: "C",
    drivetrain: "FWD",
    weight_kg: 940,
    power_hp: 100,
  },
  {
    make: "Toyota",
    model: "MR2 SC",
    year: 1989,
    pi_class: "B",
    drivetrain: "RWD",
    weight_kg: 1150,
    power_hp: 145,
  },
  {
    make: "Toyota",
    model: "Sprinter Trueno GT Apex",
    year: 1985,
    pi_class: "C",
    drivetrain: "RWD",
    weight_kg: 850,
    power_hp: 128,
  },
  {
    make: "Toyota",
    model: "FJ40",
    year: 1979,
    pi_class: "D",
    drivetrain: "RWD",
    weight_kg: 1700,
    power_hp: 155,
  },
  {
    make: "Toyota",
    model: "Celica GT",
    year: 1974,
    pi_class: "C",
    drivetrain: "RWD",
    weight_kg: 1050,
    power_hp: 96,
  },
  {
    make: "Toyota",
    model: "2000GT",
    year: 1969,
    pi_class: "B",
    drivetrain: "RWD",
    weight_kg: 1060,
    power_hp: 148,
  },
  {
    make: "Toyota",
    model: "Sports 800",
    year: 1965,
    pi_class: "D",
    drivetrain: "RWD",
    weight_kg: 580,
    power_hp: 45,
  },
  // ── TVR ─────────────────────────────────────────────────────────────────────
  {
    make: "TVR",
    model: "Griffith",
    year: 2018,
    pi_class: "S1",
    drivetrain: "RWD",
    weight_kg: 1100,
    power_hp: 500,
  },
  {
    make: "TVR",
    model: "Sagaris",
    year: 2005,
    pi_class: "S1",
    drivetrain: "RWD",
    weight_kg: 1078,
    power_hp: 406,
  },
  {
    make: "TVR",
    model: "Cerbera Speed 12",
    year: 1998,
    pi_class: "X",
    drivetrain: "RWD",
    weight_kg: 1000,
    power_hp: 860,
  },
];

async function run() {
  const { data: game, error: gameErr } = await client
    .from("games")
    .select("id")
    .eq("slug", "forza-horizon-5")
    .single();
  if (gameErr || !game) {
    console.error("Game not found:", gameErr?.message);
    process.exit(1);
  }

  console.log(`Game ID: ${game.id}\nInserting ${CARS.length} cars...\n`);

  let ok = 0,
    skip = 0,
    fail = 0;
  for (const car of CARS) {
    const { error } = await client
      .from("cars")
      .upsert(
        { ...car, game_id: game.id },
        { onConflict: "game_id,make,model,year", ignoreDuplicates: true },
      );
    if (error) {
      console.error(
        `  ❌  ${car.year} ${car.make} ${car.model}: ${error.message}`,
      );
      fail++;
    } else {
      console.log(`  ✅  ${car.year} ${car.make} ${car.model}`);
      ok++;
    }
  }

  console.log(`\nDone — ${ok} inserted, ${skip} skipped, ${fail} failed`);
}

run().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
