import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const POST_SELECT = `
  id, title, body, category, upvotes, comment_count, images, created_at, updated_at,
  game:games!forum_posts_game_id_fkey(id, name, slug),
  user:user_profiles!forum_posts_user_id_fkey(id, username)
`

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body } = await req.json()
  if (!title?.trim() && body === undefined)
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const updates: Record<string, string> = { updated_at: new Date().toISOString() }
  if (title?.trim()) updates.title = title.trim()
  if (body !== undefined) updates.body = body

  const { data, error } = await supabase
    .from('forum_posts')
    .update(updates)
    .eq('id', postId)
    .eq('user_id', user.id)
    .select(POST_SELECT)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
