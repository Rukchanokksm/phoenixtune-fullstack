import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarModelsGrid } from "@/components/game/CarModelsGrid";
import styles from "./page.module.css";

const GAME_META: Record<string, { name: string; accent: string }> = {
  "forza-horizon-5": { name: "Forza Horizon 5", accent: "#60a5fa" },
  "forza-horizon-6": { name: "Forza Horizon 6", accent: "#c084fc" },
  "nfs-unbound": { name: "NFS Unbound", accent: "#f87171" },
};

export default async function BrandPage({
  params,
}: {
  params: Promise<{ gameSlug: string; brand: string }>;
}) {
  const { gameSlug, brand } = await params;
  const brandName = decodeURIComponent(brand);
  const meta = GAME_META[gameSlug] ?? { name: gameSlug, accent: "#64748b" };

  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("slug", gameSlug)
    .single();

  if (!game) {
    return (
      <div
        style={{
          background: "#0d0f14",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎮</div>
          <p>ไม่พบเกมนี้</p>
          <Link href="/" style={{ color: meta.accent, textDecoration: "none" }}>
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const { data: cars } = await supabase
    .from("cars")
    .select("id, make, model, year")
    .eq("game_id", game.id)
    .eq("make", brandName)
    .order("year", { ascending: false });

  const models = cars ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span>›</span>
            <Link href={`/games/${gameSlug}`} className={styles.breadcrumbLink}>
              {meta.name}
            </Link>
            <span>›</span>
            <span style={{ color: meta.accent }}>{brandName}</span>
          </nav>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{brandName}</h1>
            <span className={styles.countBadge}>{models.length} รุ่น</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <CarModelsGrid
          cars={models}
          gameSlug={gameSlug}
          brandName={brandName}
          accent={meta.accent}
        />
      </div>
    </div>
  );
}
