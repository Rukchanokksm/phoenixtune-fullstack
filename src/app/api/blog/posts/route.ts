import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const POST_SELECT = `
  id, title, excerpt, cover_url, tags, comment_count, created_at, updated_at,
  user:user_profiles!blog_posts_user_id_fkey(username)
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 12;
  const from = (page - 1) * perPage;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("blog_posts")
    .select(POST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, perPage });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, excerpt, cover_url, body: postBody, tags } = body;
  if (!title?.trim())
    return NextResponse.json({ error: "Title required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      excerpt,
      cover_url,
      body: postBody ?? "[]",
      tags: tags ?? [],
    })
    .select(POST_SELECT)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
