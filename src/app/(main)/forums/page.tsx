import { createClient } from '@/lib/supabase/server'
import { ForumsClient, type ForumPost } from '@/components/forums/ForumsClient'

const POST_SELECT = `
  id, title, category, upvotes, comment_count, created_at, updated_at,
  game:games!forum_posts_game_id_fkey(name, slug),
  user:user_profiles!forum_posts_user_id_fkey(username)
`

export default async function ForumsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    : { data: null }
  const isAdmin = (profile as { role?: string } | null)?.role === 'admin'

  const [
    { data: announcements },
    { data: generalPosts },
    { data: reportPosts },
  ] = await Promise.all([
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'announcement').order('created_at', { ascending: false }).limit(10),
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'general').order('updated_at', { ascending: false }).limit(5),
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'report').order('updated_at', { ascending: false }).limit(5),
  ])

  return (
    <ForumsClient
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      announcements={(announcements as unknown as ForumPost[]) ?? []}
      generalPosts={(generalPosts as unknown as ForumPost[]) ?? []}
      reportPosts={(reportPosts as unknown as ForumPost[]) ?? []}
    />
  )
}
