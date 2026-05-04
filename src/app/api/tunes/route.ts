import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/tunes ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const gameId     = searchParams.get('gameId')
    const discipline = searchParams.get('discipline')
    const piClass    = searchParams.get('piClass')
    const drivetrain = searchParams.get('drivetrain')
    const search     = searchParams.get('search')
    const sortBy     = searchParams.get('sortBy') ?? 'newest'
    const page       = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const perPage    = Math.min(50, Math.max(1, Number(searchParams.get('perPage') ?? '20')))

    const supabase = await createClient()
    const from = (page - 1) * perPage
    const to   = from + perPage - 1

    let query = supabase
      .from('tunes')
      .select(`
        id, discipline, title, description, upvotes, view_count,
        share_code, game_version, is_featured, created_at, updated_at,
        car:cars(id, make, model, pi_class, drivetrain, weight_kg, power_hp),
        game:games(id, name, slug),
        user:user_profiles(id, username, avatar_url, is_premium)
      `, { count: 'exact' })

    // ── Filters ──
    if (gameId)     query = query.eq('game_id', gameId)
    if (discipline) query = query.eq('discipline', discipline)
    if (piClass)    query = query.eq('cars.pi_class', piClass)
    if (drivetrain) query = query.eq('cars.drivetrain', drivetrain)

    // ── Full-text search ──
    if (search) {
      query = query.textSearch('title', search, {
        type: 'websearch',
        config: 'english',
      })
    }

    // ── Sort ──
    switch (sortBy) {
      case 'popular':  query = query.order('upvotes',     { ascending: false }); break
      case 'trending': query = query.order('view_count',  { ascending: false }); break
      default:         query = query.order('created_at',  { ascending: false }); break
    }

    // ── Pagination ──
    query = query.range(from, to)

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

// ─── POST /api/tunes ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, carId, gameId, discipline, parameters, description, shareCode, gameVersion } = body

    // Validation
    const missing: string[] = []
    if (!title?.trim())   missing.push('title')
    if (!carId)           missing.push('carId')
    if (!gameId)          missing.push('gameId')
    if (!discipline)      missing.push('discipline')
    if (!parameters)      missing.push('parameters')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const validDisciplines = ['street', 'track', 'rally', 'offroad', 'drift', 'drag']
    if (!validDisciplines.includes(discipline)) {
      return NextResponse.json({ error: `Invalid discipline: ${discipline}` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tunes')
      .insert({
        user_id:      user.id,
        car_id:       carId,
        game_id:      gameId,
        discipline,
        title:        title.trim(),
        description:  description?.trim() ?? null,
        parameters,
        share_code:   shareCode ?? null,
        game_version: gameVersion ?? null,
      })
      .select(`
        *,
        car:cars(id, make, model, pi_class, drivetrain),
        game:games(id, name, slug),
        user:user_profiles(id, username, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
