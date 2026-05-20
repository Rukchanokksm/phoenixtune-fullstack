import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test with anon key (what the page uses)
    const supabase = await createServerClient();
    const { data: anonGames, error: anonErr } = await supabase
      .from("games")
      .select("id, name, is_active");

    // Test with service role key (bypasses RLS)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: adminGames, error: adminErr } = await admin
      .from("games")
      .select("id, name, is_active");

    return NextResponse.json({
      anon: {
        data: anonGames,
        error: anonErr?.message ?? null,
        count: anonGames?.length ?? 0,
      },
      admin: {
        data: adminGames,
        error: adminErr?.message ?? null,
        count: adminGames?.length ?? 0,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
