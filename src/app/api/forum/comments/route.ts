import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const COMMENT_SELECT = `
  id, body, created_at,
  user:user_profiles!forum_comments_user_id_fkey(id, username)
`

// GET /api/forum/comments?postId=...
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

// POST /api/forum/comments
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId, body } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
  if (!body?.trim()) return NextResponse.json({ error: 'body required' }, { status: 400 })

  const { data, error } = await supabase
    .from('forum_comments')
    .insert({ post_id: postId, user_id: user.id, body: body.trim() })
    .select(COMMENT_SELECT)
    .single()

  if (error) {
    const pgErr = error as { message?: string; code?: string }
    return NextResponse.json({ error: pgErr?.message ?? 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/forum/comments?id=...
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('forum_comments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
