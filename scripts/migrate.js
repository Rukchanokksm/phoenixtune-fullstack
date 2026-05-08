const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

// Load .env.local without needing dotenv package
const envPath = path.join(__dirname, "..", ".env.local")
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n")
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eqIdx = trimmed.indexOf("=")
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed
            .slice(eqIdx + 1)
            .trim()
            .replace(/^["']|["']$/g, "")
        if (!process.env[key]) process.env[key] = val
    }
    console.log("📄 Loaded .env.local")
}

const MIGRATIONS = [
    "001_initial_schema.sql",
    "002_user_extended.sql",
    "003_fix_trigger.sql",
    "004_cars_indexes.sql",
]

// Direct connection — avoids URL encoding issues, username is just "postgres"
const client = new Client({
    host: "db.jixmjuqurzlqgpyxizhp.supabase.co",
    port: 5432,
    user: "postgres",
    password: process.env.SUPABASE_DB_PASSWORD || "Peonix2539!",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
})

async function run() {
    console.log("🔌 Connecting to Supabase...")
    await client.connect()
    console.log("✅ Connected!\n")

    for (const file of MIGRATIONS) {
        const fpath = path.join(__dirname, "..", "supabase", "migrations", file)
        const sql = fs.readFileSync(fpath, "utf8")
        process.stdout.write(`📦 Running ${file}...`)
        try {
            await client.query(sql)
            console.log(" ✅")
        } catch (e) {
            const msg = e.message ?? ""
            if (msg.includes("already exists") || msg.includes("duplicate")) {
                console.log(" ℹ️  (already applied)")
            } else {
                console.log(` ❌\n   ${msg}`)
            }
        }
    }

    console.log("\n🎉 All migrations done!")
    await client.end()
}

run().catch(async (e) => {
    console.error("Fatal:", e.message)
    await client.end().catch(() => {})
    process.exit(1)
})
