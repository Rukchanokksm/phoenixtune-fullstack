import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, newPassword } = await req.json();

  if (!email || !newPassword)
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 },
    );

  if (newPassword.length < 8)
    return NextResponse.json(
      { error: "password ต้องมีอย่างน้อย 8 ตัวอักษร" },
      { status: 400 },
    );

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // หา user จาก email
  const {
    data: { users },
    error: listErr,
  } = await admin.auth.admin.listUsers();
  if (listErr)
    return NextResponse.json({ error: listErr.message }, { status: 500 });

  const user = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (!user)
    return NextResponse.json(
      { error: "ไม่พบ email นี้ในระบบ" },
      { status: 404 },
    );

  // อัปเดต password
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
