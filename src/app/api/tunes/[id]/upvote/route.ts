import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// ─── POST /api/tunes/[id]/upvote — toggle ────────────────────────────────────
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: tuneId } = await params
    const supabase = await createClient()

    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tune exists
    const { data: tune } = await supabase
      .from('tunes')
      .select('id, upvotes')
      .eq('id', tuneId)
      .single()

    if (!tune) {
      return NextResponse.json({ error: 'Tune not found' }, { status: 404 })
    }

    // Check existing upvote
    const { data: existing } = await supabase
      .from('upvotes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('tune_id', tuneId)
      .maybeSingle()

    let upvoted: boolean

    if (existing) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('tune_id', tuneId)
      if (error) throw error
      upvoted = false
    } else {
      // Add upvote
      const { error } = await supabase
        .from('upvotes')
        .insert({ user_id: user.id, tune_id: tuneId })
      if (error) throw error
      upvoted = true
    }

    // Get fresh upvote count (updated by trigger)
    const { data: updated } = await supabase
      .from('tunes')
      .select('upvotes')
      .eq('id', tuneId)
      .single()

    return NextResponse.json({
      upvoted,
      upvotes: updated?.upvotes ?? tune.upvotes,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
