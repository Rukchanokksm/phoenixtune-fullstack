import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId)
    return NextResponse.json({ error: "postId required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_comments")
    .select(
      "id, body, created_at, user:user_profiles!blog_comments_user_id_fkey(id, username)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, body } = await req.json();
  if (!postId || !body?.trim())
    return NextResponse.json(
      { error: "postId and body required" },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("blog_comments")
    .insert({ post_id: postId, user_id: user.id, body: body.trim() })
    .select(
      "id, body, created_at, user:user_profiles!blog_comments_user_id_fkey(id, username)",
    )
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("blog_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
