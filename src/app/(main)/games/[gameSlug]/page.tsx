import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { GamePageClient } from "@/components/game/GamePageClient"

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-games`

const GAME_META: Record<
    string,
    {
        name: string
        gradient: string
        accent: string
        available: boolean
    }
> = {
    "forza-horizon-5": {
        name: "Forza Horizon 5",
        gradient: "linear-gradient(135deg,#1e3a5f,#0f2040,#0d0f1e)",
        accent: "#60a5fa",
        available: true,
    },
    "forza-horizon-6": {
        name: "Forza Horizon 6",
        gradient: "linear-gradient(135deg,#2a1f3a,#1a0f2a,#0d0f1e)",
        accent: "#c084fc",
        available: false,
    },
    "nfs-unbound": {
        name: "Need for Speed Unbound",
        gradient: "linear-gradient(135deg,#2a0f0f,#1a0808,#150a0a)",
        accent: "#f87171",
        available: true,
    },
}

export default async function GamePage({
    params,
}: {
    params: Promise<{ gameSlug: string }>
}) {
    const { gameSlug } = await params
    const meta = GAME_META[gameSlug]

    if (!meta) {
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
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        🎮
                    </div>
                    <h1 style={{ color: "#e2e8f0", marginBottom: "8px" }}>
                        Game not found
                    </h1>
                    <Link
                        href="/"
                        style={{ color: "#facc15", textDecoration: "none" }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const supabase = await createClient()
    const { data: gameRow } = await supabase
        .from("games")
        .select("id, cover_url")
        .eq("slug", gameSlug)
        .single()

    const game = gameRow as { id: string; cover_url: string | null } | null

    const coverUrl = game?.cover_url
        ? `${STORAGE_BASE}/${game.cover_url}`
        : null

    let brands: string[] = []
    if (game && meta.available) {
        const { data: cars } = await supabase
            .from("cars")
            .select("make")
            .eq("game_id", game.id)
            .order("make", { ascending: true })
        if (cars) brands = [...new Set(cars.map((c) => c.make))]
    }

    return (
        <GamePageClient
            gameSlug={gameSlug}
            meta={meta}
            brands={brands}
            coverUrl={coverUrl}
        />
    )
}
