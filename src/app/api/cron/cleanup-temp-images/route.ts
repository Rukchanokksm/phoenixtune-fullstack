import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const BUCKET         = 'forum-images'
const MAX_AGE_MS     = 24 * 60 * 60 * 1000   // 24 hours
const CRON_SECRET    = process.env.CRON_SECRET

// Called daily by Vercel Cron (see vercel.json).
// Deletes all files under temps/ that are older than 24 hours.
export async function GET(req: NextRequest) {
  // Protect with CRON_SECRET so the endpoint cannot be triggered by anyone
  const auth = req.headers.get('authorization')
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()
    const cutoff      = new Date(Date.now() - MAX_AGE_MS)

    // list() returns only immediate children of the folder (non-recursive).
    // Temp files are flat under temps/ so this covers everything.
    const { data: files, error: listErr } = await adminClient.storage
      .from(BUCKET)
      .list('temps', { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } })

    if (listErr) throw listErr
    if (!files?.length) return NextResponse.json({ deleted: 0 })

    const expired = files
      .filter(f => f.created_at && new Date(f.created_at) < cutoff)
      .map(f => `temps/${f.name}`)

    if (!expired.length) return NextResponse.json({ deleted: 0 })

    const { error: removeErr } = await adminClient.storage
      .from(BUCKET)
      .remove(expired)

    if (removeErr) throw removeErr

    console.log(`[cron/cleanup-temp-images] deleted ${expired.length} file(s)`)
    return NextResponse.json({ deleted: expired.length, paths: expired })
  } catch (err) {
    const e = err as { message?: string }
    console.error('[cron/cleanup-temp-images]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
