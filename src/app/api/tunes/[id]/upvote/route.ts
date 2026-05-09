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
    const pgErr = err as { message?: string; code?: string }
    const message = pgErr?.message ?? (err instanceof Error ? err.message : 'Internal server error')
    return NextResponse.json({ error: message, code: pgErr?.code }, { status: 500 })
  }
}

// ─── DELETE /api/tunes/[id]/upvote — remove upvote ───────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: tuneId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', user.id)
      .eq('tune_id', tuneId)
    if (error) throw error

    const { data: updated } = await supabase
      .from('tunes').select('upvotes').eq('id', tuneId).single()

    return NextResponse.json({ upvoted: false, upvotes: updated?.upvotes ?? 0 })
  } catch (err) {
    const pgErr = err as { message?: string; code?: string }
    const message = pgErr?.message ?? (err instanceof Error ? err.message : 'Internal server error')
    return NextResponse.json({ error: message, code: pgErr?.code }, { status: 500 })
  }
}
