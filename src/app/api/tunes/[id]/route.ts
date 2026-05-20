import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/tunes/[id] ──────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch tune with all relations
    const { data: tune, error } = await supabase
      .from("tunes")
      .select(
        `
        *,
        car:cars(id, make, model, year, pi_class, drivetrain, weight_kg, power_hp),
        game:games(id, name, slug),
        user:user_profiles!tunes_user_id_fkey(id, username, avatar_url, is_premium),
        comments(
          id, body, created_at,
          user:user_profiles!comments_user_id_fkey(id, username, avatar_url)
        )
      `,
      )
      .eq("id", id)
      .order("created_at", { referencedTable: "comments", ascending: false })
      .single();

    if (error || !tune) {
      return NextResponse.json({ error: "Tune not found" }, { status: 404 });
    }

    // Increment view_count asynchronously (fire and forget)
    supabase
      .from("tunes")
      .update({ view_count: (tune.view_count ?? 0) + 1 })
      .eq("id", id)
      .then(() => {});

    // Check logged-in user state
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isSaved = false;
    let hasUpvoted = false;

    if (user) {
      const [saveRes, upvoteRes] = await Promise.all([
        supabase
          .from("saves")
          .select("id")
          .eq("user_id", user.id)
          .eq("tune_id", id)
          .maybeSingle(),
        supabase
          .from("upvotes")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("tune_id", id)
          .maybeSingle(),
      ]);
      isSaved = !!saveRes.data;
      hasUpvoted = !!upvoteRes.data;
    }

    return NextResponse.json({ ...tune, isSaved, hasUpvoted });
  } catch (err) {
    const pgErr = err as { message?: string; code?: string; details?: string };
    const message =
      pgErr?.message ??
      (err instanceof Error ? err.message : "Internal server error");
    return NextResponse.json(
      { error: message, code: pgErr?.code },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/tunes/[id] ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("tunes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Tune not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const allowed = [
      "title",
      "description",
      "parameters",
      "share_code",
      "game_version",
    ];
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (updates.title && typeof updates.title === "string") {
      updates.title = updates.title.trim();
      if (!updates.title) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabase
      .from("tunes")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        car:cars(id, make, model, pi_class, drivetrain),
        game:games(id, name, slug),
        user:user_profiles!tunes_user_id_fkey(id, username, avatar_url)
      `,
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    const pgErr = err as { message?: string; code?: string; details?: string };
    const message =
      pgErr?.message ??
      (err instanceof Error ? err.message : "Internal server error");
    return NextResponse.json(
      { error: message, code: pgErr?.code },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/tunes/[id] ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("tunes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Tune not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("tunes").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ deleted: id });
  } catch (err) {
    const pgErr = err as { message?: string; code?: string; details?: string };
    const message =
      pgErr?.message ??
      (err instanceof Error ? err.message : "Internal server error");
    return NextResponse.json(
      { error: message, code: pgErr?.code },
      { status: 500 },
    );
  }
}
