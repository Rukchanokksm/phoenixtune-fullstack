const { Client } = require('pg')
const fs   = require('fs')
const path = require('path')

const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_user_extended.sql',
]

const client = new Client({
  connectionString: 'postgresql://postgres.jixmjuqurzlqgpyxizhp:Peonix2539!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function run() {
  console.log('🔌 Connecting to Supabase...')
  await client.connect()
  console.log('✅ Connected!\n')

  for (const file of MIGRATIONS) {
    const fpath = path.join(__dirname, '..', 'supabase', 'migrations', file)
    const sql   = fs.readFileSync(fpath, 'utf8')
    process.stdout.write(`📦 Running ${file}...`)
    try {
      await client.query(sql)
      console.log(' ✅')
    } catch (e) {
      const msg = e.message ?? ''
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log(' ℹ️  (already applied)')
      } else {
        console.log(` ❌\n   ${msg}`)
      }
    }
  }

  console.log('\n🎉 All migrations done!')
  await client.end()
}

run().catch(async e => {
  console.error('Fatal:', e.message)
  await client.end().catch(() => {})
  process.exit(1)
})
