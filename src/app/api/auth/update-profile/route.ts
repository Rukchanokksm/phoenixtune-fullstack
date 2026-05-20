import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, bio, gender, country, birthday, avatarUrl } =
    await req.json();

  const updates: Record<string, unknown> = {};
  if (username !== undefined) updates.username = username.trim();
  if (bio !== undefined) updates.bio = bio || null;
  if (gender !== undefined) updates.gender = gender;
  if (country !== undefined) updates.country = country || null;
  if (birthday !== undefined) updates.birthday = birthday || null;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl || null;

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("[update-profile]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
