import { createClient } from "@/lib/supabase/server"
import { BlogListClient } from "@/components/blog/BlogListClient"

const POST_SELECT = `
  id, title, excerpt, cover_url, tags, comment_count, created_at,
  user:user_profiles!blog_posts_user_id_fkey(username)
`

export default async function BlogPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = user
        ? await supabase.from("user_profiles").select("role").eq("id", user.id).single()
        : { data: null }
    const isAdmin = (profile as { role?: string } | null)?.role === "admin"

    const { data: posts } = await supabase
        .from("blog_posts")
        .select(POST_SELECT)
        .order("created_at", { ascending: false })
        .limit(12)

    return <BlogListClient posts={(posts as unknown as Parameters<typeof BlogListClient>[0]["posts"]) ?? []} isAdmin={isAdmin} />
}
