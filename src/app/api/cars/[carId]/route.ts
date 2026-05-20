import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ carId: string }> },
) {
  const { carId } = await params;
  const supabase = await createClient();

  const { data: car, error } = await supabase
    .from("cars")
    .select("id, make, model, year, pi_class, drivetrain")
    .eq("id", carId)
    .single();

  if (error || !car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }

  return NextResponse.json({ car });
}
