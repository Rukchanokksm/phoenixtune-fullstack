import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId, email, username, gender, country, avatarUrl } = await req.json()

  if (!userId || !email || !username)
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

  // ใช้ service role — bypass RLS ทั้งหมด
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await admin.from('user_profiles').upsert({
    id:            userId,
    username,
    email,
    avatar_url:   avatarUrl ?? null,
    gender:       gender    ?? 'unspecified',
    country:      country   || null,
    role:         'user',
    active_title: 'newcomer',
    titles_earned: ['newcomer'],
    is_premium:   false,
    tune_share_count:       0,
    total_upvotes_received: 0,
  }, { onConflict: 'id' })

  if (error) {
    console.error('[create-profile]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
