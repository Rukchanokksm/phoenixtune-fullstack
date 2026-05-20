import { createClient } from "@/lib/supabase/server";
import type { TitleId, Gender } from "@/types";
import { ProfileNotFoundView } from "@/components/profile/ProfileNotFoundView";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "id, username, avatar_url, bio, gender, country, birthday, role, active_title, titles_earned, tune_share_count, total_upvotes_received, is_premium, created_at",
    )
    .eq("username", username)
    .single();

  if (!profile) return <ProfileNotFoundView username={username} />;

  const isOwner = authUser?.id === profile.id;

  const { data: tunes } = await supabase
    .from("tunes")
    .select(
      `id, title, discipline, created_at, updated_at, upvotes, view_count,
             car:cars!tunes_car_id_fkey(make, model, pi_class),
             game:games!tunes_game_id_fkey(id, name, slug)`,
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Group tunes by game
  const byGame: Record<
    string,
    { gameName: string; gameSlug: string; tunes: typeof tuneList }
  > = {};
  const tuneList = (tunes ?? []).map((t) => ({
    id: t.id as string,
    title: t.title as string,
    discipline: t.discipline as string,
    upvotes: (t.upvotes ?? 0) as number,
    view_count: (t.view_count ?? 0) as number,
    created_at: t.created_at as string,
    updated_at: (t as { updated_at?: string }).updated_at ?? null,
    car: t.car as unknown as {
      make: string;
      model: string;
      pi_class: string;
    } | null,
    gameId:
      (t.game as unknown as { id: string; name: string; slug: string } | null)
        ?.id ?? "",
    gameName:
      (t.game as unknown as { id: string; name: string; slug: string } | null)
        ?.name ?? "",
    gameSlug:
      (t.game as unknown as { id: string; name: string; slug: string } | null)
        ?.slug ?? "",
  }));
  for (const tune of tuneList) {
    if (!tune.gameId) continue;
    if (!byGame[tune.gameId])
      byGame[tune.gameId] = {
        gameName: tune.gameName,
        gameSlug: tune.gameSlug,
        tunes: [],
      };
    byGame[tune.gameId].tunes.push(tune);
  }
  const gameGroups = Object.values(byGame).map((g) => ({
    gameName: g.gameName,
    gameSlug: g.gameSlug,
    tunes: g.tunes.map(
      ({
        id,
        title,
        discipline,
        upvotes,
        view_count,
        created_at,
        updated_at,
        car,
      }) => ({
        id,
        title,
        discipline,
        upvotes,
        view_count,
        created_at,
        updated_at,
        car,
      }),
    ),
  }));

  const totalTunes = tuneList.length;
  const totalUpvotes = tuneList.reduce((s, t) => s + t.upvotes, 0);
  const totalViews = tuneList.reduce((s, t) => s + t.view_count, 0);

  const earned = (profile.titles_earned as string[]).filter(
    (id): id is TitleId =>
      [
        "newcomer",
        "first_tune",
        "tuner_10",
        "tuner_30",
        "tuner_100",
        "liked_10",
        "liked_50",
        "liked_100",
      ].includes(id),
  );

  return (
    <ProfilePageClient
      isOwner={isOwner}
      profile={{
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatar_url ?? null,
        bio: profile.bio ?? null,
        gender: (profile.gender as Gender) ?? "unspecified",
        country: profile.country ?? null,
        birthday: profile.birthday ?? null,
        role: profile.role ?? "user",
        activeTitle: (profile.active_title as TitleId) ?? "newcomer",
        joinYear: new Date(profile.created_at).getFullYear(),
      }}
      earned={earned}
      totalTunes={totalTunes}
      totalUpvotes={totalUpvotes}
      totalViews={totalViews}
      gameGroups={gameGroups}
    />
  );
}
