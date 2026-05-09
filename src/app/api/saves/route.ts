import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/saves — get saved tunes (any logged-in user) ───────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folderName = req.nextUrl.searchParams.get('folder')
    const page    = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'))
    const perPage = Math.min(50, Number(req.nextUrl.searchParams.get('perPage') ?? '20'))
    const from    = (page - 1) * perPage
    const to      = from + perPage - 1

    let query = supabase
      .from('saves')
      .select(`
        id, folder_name, created_at,
        tune:tunes(
          id, title, discipline, upvotes, view_count, created_at,
          car:cars(make, model, pi_class),
          game:games(name, slug),
          user:user_profiles(username, avatar_url)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (folderName) {
      query = query.eq('folder_name', folderName)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      data:    data ?? [],
      total:   count ?? 0,
      page,
      perPage,
      hasMore: (count ?? 0) > to + 1,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── POST /api/saves — save a tune (any logged-in user) ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tuneId, folderName } = await req.json()
    if (!tuneId) {
      return NextResponse.json({ error: 'tuneId is required' }, { status: 400 })
    }

    const { data: tune } = await supabase
      .from('tunes')
      .select('id')
      .eq('id', tuneId)
      .single()

    if (!tune) {
      return NextResponse.json({ error: 'Tune not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('saves')
      .upsert(
        { user_id: user.id, tune_id: tuneId, folder_name: folderName ?? 'Default' },
        { onConflict: 'user_id,tune_id' }
      )
      .select('id, folder_name, created_at')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── DELETE /api/saves — unsave a tune ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tuneId = req.nextUrl.searchParams.get('tuneId')
    if (!tuneId) {
      return NextResponse.json({ error: 'tuneId query param required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('user_id', user.id)
      .eq('tune_id', tuneId)

    if (error) throw error

    return NextResponse.json({ deleted: tuneId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
