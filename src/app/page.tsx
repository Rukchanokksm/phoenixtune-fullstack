import { createClient } from "@/lib/supabase/server";
import {
  HomeClient,
  type DbGame,
  type LatestPost,
} from "@/components/home/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ count: tuneCount }, { count: tunerCount }, { count: gameCount }] =
    await Promise.all([
      supabase.from("tunes").select("*", { count: "exact", head: true }),
      supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("games")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  const { data: games } = await supabase
    .from("games")
    .select("*, tune_count:tunes(count)")
    .order("created_at", { ascending: false });

  const { data: latestPostsRaw } = await supabase
    .from("forum_posts")
    .select(
      "id, title, category, created_at, user:user_profiles!forum_posts_user_id_fkey(username), game:games!forum_posts_game_id_fkey(name)",
    )
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <HomeClient
      tuneCount={tuneCount ?? 0}
      tunerCount={tunerCount ?? 0}
      gameCount={gameCount ?? 0}
      games={(games as unknown as DbGame[]) ?? []}
      latestPosts={(latestPostsRaw as unknown as LatestPost[]) ?? []}
    />
  );
}
