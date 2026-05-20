import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword)
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 },
    );

  if (oldPassword === newPassword)
    return NextResponse.json(
      { error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" },
      { status: 400 },
    );

  if (newPassword.length < 8)
    return NextResponse.json(
      { error: "password ต้องมีอย่างน้อย 8 ตัวอักษร" },
      { status: 400 },
    );

  // ดึง user ปัจจุบัน
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email)
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อน" },
      { status: 401 },
    );

  // ยืนยันรหัสเดิมโดย sign in ชั่วคราว
  const check = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: signInErr } = await check.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });
  if (signInErr)
    return NextResponse.json(
      { error: "รหัสผ่านเดิมไม่ถูกต้อง" },
      { status: 403 },
    );

  // เปลี่ยน password
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
