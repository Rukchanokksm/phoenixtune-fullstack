import { createClient } from "@/lib/supabase/server";
import { GuidelineListClient } from "@/components/guideline/GuidelineListClient";

const POST_SELECT = `
  id, title, excerpt, cover_url, comment_count, created_at,
  user:user_profiles!guideline_posts_user_id_fkey(username)
`;

export default async function GuidelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    : { data: null };
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";

  const { data: posts } = await supabase
    .from("guideline_posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <GuidelineListClient
      posts={
        (posts as unknown as Parameters<
          typeof GuidelineListClient
        >[0]["posts"]) ?? []
      }
      isAdmin={isAdmin}
    />
  );
}
