/**
 * seed-cars-fh5.js
 * -----------------
 * Seeds all FH5 cars into the Supabase `cars` table.
 * Uses @supabase/supabase-js (HTTPS) — no direct DB connection needed.
 *
 *   node scripts/seed-cars-fh5.js
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
// Car data — brand + models list for FH5
// Format: { brand, brandId, models: [{ year, model, drivetrain? }] }
// drivetrain: 'AWD' | 'RWD' | 'FWD' | null (null = unknown)
// ---------------------------------------------------------------------------
const FH5_CARS = [
  {
    brand: "Abarth",
    brandId: "abarth",
    models: [
      { year: 2017, model: "124 Spider", drivetrain: "RWD" },
      { year: 2016, model: "124 Spider", drivetrain: "RWD" },
      { year: 1980, model: "131 Abarth", drivetrain: "RWD" },
      { year: 1968, model: "595 esseesse", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Acura",
    brandId: "acura",
    models: [
      { year: 2017, model: "NSX", drivetrain: "AWD" },
      { year: 2002, model: "RSX Type-S", drivetrain: "FWD" },
      { year: 2001, model: "Integra Type R", drivetrain: "FWD" },
    ],
  },
  {
    brand: "Alfa Romeo",
    brandId: "alfa-romeo",
    models: [
      { year: 2019, model: "Giulia GTA", drivetrain: "RWD" },
      { year: 2018, model: "Stelvio QV", drivetrain: "AWD" },
      { year: 2017, model: "Giulia QV", drivetrain: "RWD" },
      { year: 2016, model: "4C Spider", drivetrain: "RWD" },
      { year: 2014, model: "4C", drivetrain: "RWD" },
      { year: 1965, model: "Giulia Sprint GTA", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Alpine",
    brandId: "alpine",
    models: [
      { year: 2017, model: "A110", drivetrain: "RWD" },
      { year: 1973, model: "A110 1600s", drivetrain: "RWD" },
    ],
  },
  {
    brand: "AMC",
    brandId: "amc",
    models: [
      { year: 1971, model: "Javelin AMX", drivetrain: "RWD" },
      { year: 1970, model: "Rebel 'The Machine'", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Ariel",
    brandId: "ariel",
    models: [
      { year: 2016, model: "Nomad", drivetrain: "AWD" },
      { year: 2013, model: "Atom 500 V8", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Ascari",
    brandId: "ascari",
    models: [{ year: 2012, model: "KZ1R", drivetrain: "RWD" }],
  },
  {
    brand: "Aston Martin",
    brandId: "aston-martin",
    models: [
      { year: 2023, model: "DBS", drivetrain: "RWD" },
      { year: 2022, model: "Valkyrie AMR Pro", drivetrain: "RWD" },
      { year: 2022, model: "Valkyrie", drivetrain: "RWD" },
      { year: 2021, model: "Vantage V12", drivetrain: "RWD" },
      { year: 2019, model: "Vantage", drivetrain: "RWD" },
      { year: 2019, model: "DBS Superleggera", drivetrain: "RWD" },
      { year: 2017, model: "Vulcan AMR Pro", drivetrain: "RWD" },
      { year: 2017, model: "DB11", drivetrain: "RWD" },
      { year: 2010, model: "One-77", drivetrain: "RWD" },
      { year: 1964, model: "DB5", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Audi",
    brandId: "audi",
    models: [
      { year: 2021, model: "RS 7 Sportback", drivetrain: "AWD" },
      { year: 2021, model: "RS e-tron GT", drivetrain: "AWD" },
      { year: 2020, model: "RS Q8", drivetrain: "AWD" },
      { year: 2018, model: "RS 4 Avant", drivetrain: "AWD" },
      { year: 2018, model: "TT RS", drivetrain: "AWD" },
      { year: 2015, model: "R8 V10 plus", drivetrain: "AWD" },
      { year: 1983, model: "Sport quattro", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Bentley",
    brandId: "bentley",
    models: [
      { year: 2022, model: "Mulliner Bacalar", drivetrain: "AWD" },
      { year: 2020, model: "Continental GT Speed", drivetrain: "AWD" },
      { year: 2017, model: "Bentayga", drivetrain: "AWD" },
      { year: 2003, model: "Speed 8", drivetrain: "AWD" },
      { year: 1992, model: "Turbo R", drivetrain: "RWD" },
    ],
  },
  {
    brand: "BMW",
    brandId: "bmw",
    models: [
      { year: 2022, model: "M5 CS", drivetrain: "AWD" },
      { year: 2022, model: "M3 Competition", drivetrain: "AWD" },
      { year: 2021, model: "M4 Competition", drivetrain: "RWD" },
      { year: 2021, model: "iX M60", drivetrain: "AWD" },
      { year: 2019, model: "M2 Competition", drivetrain: "RWD" },
      { year: 2019, model: "X5 M", drivetrain: "AWD" },
      { year: 2018, model: "M5", drivetrain: "AWD" },
      { year: 2016, model: "M4 GTS", drivetrain: "RWD" },
      { year: 2015, model: "i8", drivetrain: "AWD" },
      { year: 2012, model: "M5", drivetrain: "RWD" },
      { year: 2011, model: "1 Series M Coupe", drivetrain: "RWD" },
      { year: 2008, model: "M3", drivetrain: "RWD" },
      { year: 2003, model: "M3", drivetrain: "RWD" },
      { year: 1997, model: "M3", drivetrain: "RWD" },
      { year: 1992, model: "M3", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Bugatti",
    brandId: "bugatti",
    models: [
      { year: 2019, model: "Divo", drivetrain: "AWD" },
      { year: 2017, model: "Chiron", drivetrain: "AWD" },
      { year: 2013, model: "Veyron Super Sport", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Cadillac",
    brandId: "cadillac",
    models: [
      { year: 2022, model: "CT5-V Blackwing", drivetrain: "RWD" },
      { year: 2019, model: "ATS-V Coupe", drivetrain: "RWD" },
      { year: 2016, model: "CTS-V", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Chevrolet",
    brandId: "chevrolet",
    models: [
      { year: 2020, model: "Corvette Stingray", drivetrain: "RWD" },
      { year: 2019, model: "Corvette ZR1", drivetrain: "RWD" },
      { year: 2018, model: "Camaro ZL1 1LE", drivetrain: "RWD" },
      { year: 2014, model: "Corvette Stingray", drivetrain: "RWD" },
      { year: 2012, model: "Camaro ZL1", drivetrain: "RWD" },
      { year: 1970, model: "Chevelle SS", drivetrain: "RWD" },
      { year: 1969, model: "Camaro Super Sport", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Dodge",
    brandId: "dodge",
    models: [
      {
        year: 2021,
        model: "Challenger SRT Super Stock",
        drivetrain: "RWD",
      },
      { year: 2018, model: "Challenger SRT Demon", drivetrain: "RWD" },
      { year: 2012, model: "Charger SRT8", drivetrain: "RWD" },
      { year: 2008, model: "Viper SRT10 ACR", drivetrain: "RWD" },
      { year: 1970, model: "Challenger R/T", drivetrain: "RWD" },
      { year: 1970, model: "Coronet Super Bee", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Ferrari",
    brandId: "ferrari",
    models: [
      { year: 2021, model: "SF90 Stradale", drivetrain: "AWD" },
      { year: 2021, model: "812 Competizione", drivetrain: "RWD" },
      { year: 2020, model: "Roma", drivetrain: "RWD" },
      { year: 2019, model: "F8 Tributo", drivetrain: "RWD" },
      { year: 2017, model: "812 Superfast", drivetrain: "RWD" },
      { year: 2015, model: "California T", drivetrain: "RWD" },
      { year: 2014, model: "LaFerrari", drivetrain: "RWD" },
      { year: 2013, model: "458 Speciale", drivetrain: "RWD" },
      { year: 2012, model: "F12 Berlinetta", drivetrain: "RWD" },
      { year: 2011, model: "FF", drivetrain: "AWD" },
      { year: 2010, model: "599XX", drivetrain: "RWD" },
      { year: 2009, model: "458 Italia", drivetrain: "RWD" },
      { year: 2002, model: "Enzo", drivetrain: "RWD" },
      { year: 1995, model: "F50", drivetrain: "RWD" },
      { year: 1995, model: "512M", drivetrain: "RWD" },
      { year: 1992, model: "512 TR", drivetrain: "RWD" },
      { year: 1969, model: "365 GTB/4", drivetrain: "RWD" },
      { year: 1962, model: "250 GTO", drivetrain: "RWD" },
      { year: 1957, model: "250 California", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Ford",
    brandId: "ford",
    models: [
      { year: 2022, model: "Bronco Raptor", drivetrain: "AWD" },
      { year: 2022, model: "F-150 Raptor R", drivetrain: "AWD" },
      { year: 2021, model: "Mustang Mach-E GT", drivetrain: "AWD" },
      { year: 2020, model: "Mustang Shelby GT500", drivetrain: "RWD" },
      { year: 2017, model: "GT", drivetrain: "RWD" },
      { year: 2016, model: "Focus RS", drivetrain: "AWD" },
      { year: 2015, model: "Mustang GT", drivetrain: "RWD" },
      { year: 2014, model: "Fiesta ST", drivetrain: "FWD" },
      { year: 2013, model: "F-150 SVT Raptor", drivetrain: "AWD" },
      { year: 2010, model: "Shelby GT500", drivetrain: "RWD" },
      { year: 2006, model: "GT", drivetrain: "RWD" },
      { year: 1993, model: "Mustang SVT Cobra R", drivetrain: "RWD" },
      { year: 1969, model: "Mustang Boss 302", drivetrain: "RWD" },
      { year: 1965, model: "Mustang Coupe", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Honda",
    brandId: "honda",
    models: [
      { year: 2021, model: "Civic Type R", drivetrain: "FWD" },
      { year: 2017, model: "NSX", drivetrain: "AWD" },
      { year: 2016, model: "Civic Coupe", drivetrain: "FWD" },
      { year: 2005, model: "NSX-R", drivetrain: "RWD" },
      { year: 1992, model: "NSX-R", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Koenigsegg",
    brandId: "koenigsegg",
    models: [
      { year: 2021, model: "Jesko", drivetrain: "RWD" },
      { year: 2019, model: "Jesko Absolut", drivetrain: "RWD" },
      { year: 2014, model: "One:1", drivetrain: "RWD" },
      { year: 2011, model: "Agera", drivetrain: "RWD" },
      { year: 2002, model: "CC8S", drivetrain: "RWD" },
    ],
  },
  {
    brand: "KTM",
    brandId: "ktm",
    models: [
      { year: 2021, model: "X-Bow GT4", drivetrain: "RWD" },
      { year: 2016, model: "X-Bow R", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Lamborghini",
    brandId: "lamborghini",
    models: [
      { year: 2021, model: "Countach LPI 800-4", drivetrain: "AWD" },
      { year: 2020, model: "Huracan EVO", drivetrain: "AWD" },
      { year: 2019, model: "Urus", drivetrain: "AWD" },
      { year: 2018, model: "Aventador SVJ", drivetrain: "AWD" },
      { year: 2018, model: "Huracan Performante", drivetrain: "AWD" },
      { year: 2016, model: "Centenario", drivetrain: "AWD" },
      { year: 2014, model: "Huracan LP 610-4", drivetrain: "AWD" },
      { year: 2013, model: "Veneno", drivetrain: "AWD" },
      { year: 2012, model: "Aventador J", drivetrain: "AWD" },
      { year: 1988, model: "Countach LP5000 QV", drivetrain: "RWD" },
      { year: 1967, model: "Miura P400", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Land Rover",
    brandId: "land-rover",
    models: [
      { year: 2020, model: "Defender 110", drivetrain: "AWD" },
      { year: 2014, model: "Range Rover Sport SVR", drivetrain: "AWD" },
      { year: 1997, model: "Defender 90", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Lexus",
    brandId: "lexus",
    models: [
      { year: 2021, model: "LC 500", drivetrain: "RWD" },
      { year: 2015, model: "RC F", drivetrain: "RWD" },
      { year: 2010, model: "LFA", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Lotus",
    brandId: "lotus",
    models: [
      { year: 2023, model: "Emira", drivetrain: "RWD" },
      { year: 2020, model: "Evija", drivetrain: "AWD" },
      { year: 2016, model: "3-Eleven", drivetrain: "RWD" },
      { year: 2012, model: "Exige S", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Maserati",
    brandId: "maserati",
    models: [
      { year: 2021, model: "MC20", drivetrain: "RWD" },
      { year: 2018, model: "GranTurismo Sport", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Mazda",
    brandId: "mazda",
    models: [
      { year: 2020, model: "MX-5 Miata RF", drivetrain: "RWD" },
      { year: 2011, model: "RX-8 R3", drivetrain: "RWD" },
      { year: 1997, model: "RX-7", drivetrain: "RWD" },
      { year: 1990, model: "Miata MX-5", drivetrain: "RWD" },
    ],
  },
  {
    brand: "McLaren",
    brandId: "mclaren",
    models: [
      { year: 2020, model: "Speedtail", drivetrain: "RWD" },
      { year: 2019, model: "Senna", drivetrain: "RWD" },
      { year: 2018, model: "720S", drivetrain: "RWD" },
      { year: 2016, model: "675LT", drivetrain: "RWD" },
      { year: 2015, model: "650S Spider", drivetrain: "RWD" },
      { year: 2014, model: "765LT", drivetrain: "RWD" },
      { year: 2013, model: "P1", drivetrain: "RWD" },
      { year: 2012, model: "MP4-12C", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Mercedes-AMG",
    brandId: "mercedes-amg",
    models: [
      { year: 2021, model: "AMG ONE", drivetrain: "AWD" },
      { year: 2020, model: "AMG E 63 S", drivetrain: "AWD" },
      { year: 2020, model: "AMG GT Black Series", drivetrain: "RWD" },
      { year: 2018, model: "AMG GT S", drivetrain: "RWD" },
      { year: 2016, model: "AMG C 63 S Coupe", drivetrain: "RWD" },
      { year: 2013, model: "SLS AMG Black Series", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Mitsubishi",
    brandId: "mitsubishi",
    models: [
      { year: 2006, model: "Lancer Evolution IX MR", drivetrain: "AWD" },
      { year: 2004, model: "Lancer Evolution VIII", drivetrain: "AWD" },
      { year: 1992, model: "Galant VR-4", drivetrain: "AWD" },
      { year: 1992, model: "Eclipse GSX", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Nissan",
    brandId: "nissan",
    models: [
      { year: 2023, model: "Z", drivetrain: "RWD" },
      { year: 2020, model: "GT-R Nismo", drivetrain: "AWD" },
      { year: 2017, model: "GT-R", drivetrain: "AWD" },
      { year: 2003, model: "Fairlady Z", drivetrain: "RWD" },
      { year: 1999, model: "Skyline GT-R V-Spec", drivetrain: "AWD" },
      { year: 1993, model: "Skyline GT-R V-Spec", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Pagani",
    brandId: "pagani",
    models: [
      { year: 2017, model: "Huayra BC", drivetrain: "RWD" },
      { year: 2012, model: "Huayra", drivetrain: "RWD" },
      { year: 2009, model: "Zonda Cinque Roadster", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Porsche",
    brandId: "porsche",
    models: [
      { year: 2021, model: "911 GT3", drivetrain: "RWD" },
      { year: 2021, model: "Taycan Turbo S", drivetrain: "AWD" },
      { year: 2019, model: "911 Carrera S", drivetrain: "RWD" },
      { year: 2018, model: "Cayenne Turbo", drivetrain: "AWD" },
      { year: 2016, model: "918 Spyder", drivetrain: "AWD" },
      { year: 2014, model: "918 Spyder", drivetrain: "AWD" },
      { year: 2012, model: "911 GT2 RS", drivetrain: "RWD" },
      { year: 2010, model: "918 RSR", drivetrain: "RWD" },
      { year: 2004, model: "Carrera GT", drivetrain: "RWD" },
      { year: 1998, model: "911 GT1 Strassenversion", drivetrain: "RWD" },
      { year: 1989, model: "944 Turbo", drivetrain: "RWD" },
      { year: 1973, model: "911 Carrera RS", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Renault",
    brandId: "renault",
    models: [
      { year: 2012, model: "Megane RS 250", drivetrain: "FWD" },
      { year: 2010, model: "Clio R.S.", drivetrain: "FWD" },
      { year: 2003, model: "Clio V6", drivetrain: "RWD" },
    ],
  },
  {
    brand: "Rimac",
    brandId: "rimac",
    models: [
      { year: 2021, model: "Nevera", drivetrain: "AWD" },
      { year: 2018, model: "C_Two", drivetrain: "AWD" },
    ],
  },
  {
    brand: "Subaru",
    brandId: "subaru",
    models: [
      { year: 2022, model: "WRX", drivetrain: "AWD" },
      { year: 2022, model: "BRZ", drivetrain: "RWD" },
      { year: 2005, model: "Impreza WRX STi", drivetrain: "AWD" },
      { year: 1998, model: "Impreza 22B STi", drivetrain: "AWD" },
      { year: 1992, model: "Legacy RS", drivetrain: "AWD" },
    ],
  },
];

// ---------------------------------------------------------------------------
async function main() {
  // Get FH5 game_id
  const { data: game, error: gameErr } = await supabase
    .from("games")
    .select("id")
    .eq("slug", "forza-horizon-5")
    .single();

  if (gameErr || !game) {
    console.error(
      "❌ forza-horizon-5 not found in games table. Run migrations first.",
    );
    console.error(gameErr?.message);
    process.exit(1);
  }
  console.log("✅ FH5 game_id:", game.id);

  // Flatten all cars into rows
  const rows = [];
  for (const { brand, models } of FH5_CARS) {
    for (const { year, model, drivetrain } of models) {
      rows.push({
        game_id: game.id,
        make: brand,
        model: model,
        year: year,
        pi_class: "A",
        drivetrain: drivetrain ?? "RWD",
      });
    }
  }
  console.log(`📦 Total cars to seed: ${rows.length}`);

  // Upsert in batches of 50
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
