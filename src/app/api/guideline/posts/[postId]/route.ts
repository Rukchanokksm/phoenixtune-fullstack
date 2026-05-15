import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

const FULL_SELECT = `
  id, title, excerpt, cover_url, body, comment_count, created_at, updated_at,
  user:user_profiles!guideline_posts_user_id_fkey(id, username)
`

export async function GET(_: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("guideline_posts")
        .select(FULL_SELECT)
        .eq("id", postId)
        .single()

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
    if ((profile as { role?: string } | null)?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const admin = createAdminClient()
    const { data, error } = await admin
        .from("guideline_posts")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", postId)
        .select(FULL_SELECT)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
    if ((profile as { role?: string } | null)?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("guideline_posts").delete().eq("id", postId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
