import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/tunes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const gameId     = searchParams.get('gameId')
    const carId      = searchParams.get('carId')
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

    if (gameId)     query = query.eq('game_id', gameId)
    if (carId)      query = query.eq('car_id', carId)
    if (discipline) query = query.eq('discipline', discipline)
    if (piClass)    query = query.eq('cars.pi_class', piClass)
    if (drivetrain) query = query.eq('cars.drivetrain', drivetrain)

    if (search) {
      query = query.textSearch('title', search, { type: 'websearch', config: 'english' })
    }

    switch (sortBy) {
      case 'popular':  query = query.order('upvotes',     { ascending: false }); break
      case 'trending': query = query.order('view_count',  { ascending: false }); break
      default:         query = query.order('created_at',  { ascending: false }); break
    }

    query = query.range(from, to)
    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, perPage })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/tunes
// Accepts car details — upserts the car row, then inserts the tune
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title, discipline, description, shareCode, gameVersion, parameters,
      // Car details (new approach — no pre-seed needed)
      gameSlug, carMake, carModel, carYear, piClass, drivetrain,
      // Legacy approach — accept direct carId + gameId if provided
      carId: legacyCarId, gameId: legacyGameId,
    } = body

    // Validation
    if (!title?.trim())   return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!discipline)      return NextResponse.json({ error: 'discipline is required' }, { status: 400 })
    if (!parameters)      return NextResponse.json({ error: 'parameters is required' }, { status: 400 })

    const validDisciplines = ['street', 'track', 'rally', 'offroad', 'drift', 'drag']
    if (!validDisciplines.includes(discipline)) {
      return NextResponse.json({ error: `Invalid discipline: ${discipline}` }, { status: 400 })
    }

    let carId  = legacyCarId  as string | undefined
    let gameId = legacyGameId as string | undefined

    // --- Resolve game -------------------------------------------------------
    if (!gameId) {
      if (!gameSlug) return NextResponse.json({ error: 'gameSlug is required' }, { status: 400 })
      const { data: game } = await supabase
        .from('games').select('id').eq('slug', gameSlug).single()
      if (!game) return NextResponse.json({ error: `Game not found: ${gameSlug}` }, { status: 400 })
      gameId = game.id
    }

    // --- Resolve / upsert car -----------------------------------------------
    if (!carId) {
      if (!carMake || !carModel)
        return NextResponse.json({ error: 'carMake and carModel are required' }, { status: 400 })

      const validPiClasses  = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']
      const validDrivetrains = ['FWD', 'RWD', 'AWD']
      const safePiClass    = validPiClasses.includes(piClass)    ? piClass    : 'A'
      const safeDrivetrain = validDrivetrains.includes(drivetrain) ? drivetrain : 'RWD'

      // Try to find existing car (same game + make + model + year)
      const { data: existing } = await supabase
        .from('cars')
        .select('id')
        .eq('game_id', gameId)
        .eq('make', carMake)
        .eq('model', carModel)
        .eq('year', carYear ?? 0)
        .maybeSingle()

      if (existing) {
        carId = existing.id
      } else {
        // Insert new car
        const { data: newCar, error: carErr } = await supabase
          .from('cars')
          .insert({
            game_id:    gameId,
            make:       carMake,
            model:      carModel,
            year:       carYear ?? null,
            pi_class:   safePiClass,
            drivetrain: safeDrivetrain,
          })
          .select('id')
          .single()
        if (carErr) throw carErr
        carId = newCar.id
      }
    }

    // --- Insert tune --------------------------------------------------------
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
