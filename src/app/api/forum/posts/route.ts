import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const POST_SELECT = `
  id, title, category, upvotes, comment_count, images, created_at, updated_at,
  game:games!forum_posts_game_id_fkey(id, name, slug),
  user:user_profiles!forum_posts_user_id_fkey(id, username)
`

// GET /api/forum/posts?category=general&gameId=...&page=1&sortBy=latest
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const gameId   = searchParams.get('gameId')
    const sortBy   = searchParams.get('sortBy') ?? 'latest'   // latest | popular
    const page     = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const perPage  = Math.min(20, Math.max(1, Number(searchParams.get('perPage') ?? '20')))

    const supabase = await createClient()
    let query = supabase.from('forum_posts').select(POST_SELECT, { count: 'exact' })

    if (category) query = query.eq('category', category)
    if (gameId)   query = query.eq('game_id', gameId)

    if (sortBy === 'popular') {
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('updated_at', { ascending: false })
    }

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, perPage })
  } catch (err) {
    const pgErr = err as { message?: string; code?: string }
    return NextResponse.json({ error: pgErr?.message ?? 'Internal server error', code: pgErr?.code }, { status: 500 })
  }
}

// POST /api/forum/posts
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, body: postBody, category, gameId, images } = body

    if (!title?.trim())    return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!postBody?.trim()) return NextResponse.json({ error: 'body is required' }, { status: 400 })

    const validCategories = ['general', 'report']
    if (!validCategories.includes(category)) {
      // announcement: admin only
      if (category === 'announcement') {
        const { data: profile } = await supabase
          .from('user_profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin')
          return NextResponse.json({ error: 'Only admins can post announcements' }, { status: 403 })
      } else {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
    }

    // Ensure profile exists
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('user_profiles').select('id').eq('id', user.id).maybeSingle()
    if (!profile) {
      const username = user.email?.split('@')[0] ?? user.id.slice(0, 8)
      await adminClient.from('user_profiles').insert({ id: user.id, username, role: 'user', active_title: 'newcomer', titles_earned: ['newcomer'] })
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id:  user.id,
        game_id:  gameId ?? null,
        category: category ?? 'general',
        title:    title.trim(),
        body:     postBody.trim(),
        images:   Array.isArray(images) ? images.filter((u: string) => typeof u === 'string').slice(0, 10) : [],
      })
      .select(POST_SELECT)
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const pgErr = err as { message?: string; code?: string }
    console.error('[POST /api/forum/posts]', JSON.stringify(err))
    return NextResponse.json({ error: pgErr?.message ?? 'Internal server error', code: pgErr?.code }, { status: 500 })
  }
}
