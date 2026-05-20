import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const gameSlug = req.nextUrl.searchParams.get("game") ?? "forza-horizon-5";

  const supabase = await createClient();

  // Resolve game_id from slug
  const { data: game, error: gameErr } = await supabase
    .from("games")
    .select("id")
    .eq("slug", gameSlug)
    .single();

  if (gameErr || !game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Fetch all cars for this game
  const { data: cars, error } = await supabase
    .from("cars")
    .select("id, make, model, year, drivetrain, pi_class")
    .eq("game_id", game.id)
    .order("make", { ascending: true })
    .order("year", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group into { brands, modelsByBrand }
  const brandSet = new Map<string, string>(); // make -> make (dedupe)
  const modelsByBrand: Record<
    string,
    {
      id: string;
      year: number;
      model: string;
      label: string;
      drivetrain: string;
    }[]
  > = {};

  for (const car of cars ?? []) {
    if (!brandSet.has(car.make)) brandSet.set(car.make, car.make);
    if (!modelsByBrand[car.make]) modelsByBrand[car.make] = [];
    modelsByBrand[car.make].push({
      id: car.id,
      year: car.year,
      model: car.model,
      label: `${car.year} ${car.model}`,
      drivetrain: car.drivetrain ?? "RWD",
    });
  }

  const brands = Array.from(brandSet.keys()).map((make) => ({
    id: make.toLowerCase().replace(/\s+/g, "-"),
    name: make,
  }));

  return NextResponse.json({ brands, modelsByBrand });
}
