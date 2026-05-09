import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface DbGame {
    id: string
    name: string
    slug: string
    cover_url: string | null
    is_active: boolean
    tune_count: { count: number }[]
}
interface DbTune {
    id: string
    discipline: string
    title: string
    upvotes: number
    car: { make: string; model: string; pi_class: string }[]
    user: { username: string }[]
}

const DISCIPLINE_STYLE: Record<
    string,
    { bg: string; color: string; label: string }
> = {
    drift: { bg: "#2a0f1a", color: "#f472b6", label: "Drift" },
    track: { bg: "#0f1a2a", color: "#60a5fa", label: "Track" },
    street: { bg: "#0f2a1a", color: "#4ade80", label: "Street" },
    rally: { bg: "#2a1f0f", color: "#fb923c", label: "Rally" },
    offroad: { bg: "#2a2010", color: "#fbbf24", label: "Offroad" },
    drag: { bg: "#2a1010", color: "#f87171", label: "Drag" },
}

const GAME_META: Record<
    string,
    { gradient: string; icon: string; accent: string; short: string }
> = {
    "forza-horizon-5": {
        gradient: "linear-gradient(135deg,#1e3a5f,#0f2040,#0d0f1e)",
        icon: "🏔",
        accent: "#60a5fa",
        short: "FH5",
    },
    "forza-horizon-6": {
        gradient: "linear-gradient(135deg,#2a1f3a,#1a0f2a,#0d0f1e)",
        icon: "🌆",
        accent: "#c084fc",
        short: "FH6",
    },
    "the-crew-motorfest": {
        gradient: "linear-gradient(135deg,#3a2a0f,#2a1a0a,#1a1208)",
        icon: "🌺",
        accent: "#fb923c",
        short: "TCM",
    },
    "nfs-unbound": {
        gradient: "linear-gradient(135deg,#2a0f0f,#1a0808,#150a0a)",
        icon: "🏙",
        accent: "#f87171",
        short: "NFS",
    },
}

function DisciplineBadge({ discipline }: { discipline: string }) {
    const s = DISCIPLINE_STYLE[discipline] ?? {
        bg: "#1e293b",
        color: "#94a3b8",
        label: discipline,
    }
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "5px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: s.bg,
                color: s.color,
                whiteSpace: "nowrap",
            }}
        >
            {s.label}
        </span>
    )
}

function PIBadge({ piClass }: { piClass: string }) {
    const colors: Record<string, string> = {
        D: "#94a3b8",
        C: "#fbbf24",
        B: "#4ade80",
        A: "#60a5fa",
        S1: "#c084fc",
        S2: "#f472b6",
        X: "#f87171",
    }
    return (
        <span
            style={{
                display: "inline-block",
                padding: "1px 6px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 800,
                background: "rgba(255,255,255,0.06)",
                color: colors[piClass] ?? "#94a3b8",
                fontFamily: "monospace",
            }}
        >
            {piClass}
        </span>
    )
}

function GameStatusBadge({
    isActive,
    slug,
}: {
    isActive: boolean
    slug: string
}) {
    if (slug === "forza-horizon-6")
        return <span style={bs("#2a1f0f", "#fb923c")}>SOON</span>
    if (!isActive) return <span style={bs("#1e293b", "#64748b")}>COMING</span>
    return <span style={bs("#0f2a1a", "#4ade80")}>LIVE</span>
}
function bs(bg: string, color: string): React.CSSProperties {
    return {
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "2px 7px",
        borderRadius: "5px",
        background: bg,
        color,
    }
}

export default async function HomePage() {
    const supabase = await createClient()

    const [{ count: tuneCount }, { count: tunerCount }, { count: gameCount }] =
        await Promise.all([
            supabase.from("tunes").select("*", { count: "exact", head: true }),
            supabase
                .from("user_profiles")
                .select("*", { count: "exact", head: true }),
            supabase
                .from("games")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true),
        ])

    const { data: games } = await supabase
        .from("games")
        .select("*, tune_count:tunes(count)")
        .order("created_at", { ascending: false })

    const { data: recentTunes } = await supabase
        .from("tunes")
        .select(
            "id, discipline, title, upvotes, car:cars(make,model,pi_class), user:user_profiles(username)",
        )
        .order("created_at", { ascending: false })
        .limit(8)

    const stats = [
        { value: (tuneCount ?? 0).toLocaleString(), label: "Tunes" },
        { value: (tunerCount ?? 0).toLocaleString(), label: "Tuners" },
        { value: (gameCount ?? 0).toString(), label: "Games" },
    ]

    return (
        <div
            style={{
                background: "#0d0f14",
                minHeight: "100vh",
                color: "#e2e8f0",
            }}
        >
            {/* HERO */}
            <section
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "80px 24px 64px",
                    textAlign: "center",
                }}
            >
                <span
                    style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#facc15",
                        background: "rgba(250,204,21,0.1)",
                        border: "1px solid rgba(250,204,21,0.2)",
                        padding: "4px 14px",
                        borderRadius: "100px",
                        marginBottom: "20px",
                    }}
                >
                    Community Tuning Platform
                </span>

                <h1
                    style={{
                        fontSize: "clamp(36px,5vw,60px)",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: "-1px",
                        margin: "0 0 20px",
                        color: "#f1f5f9",
                    }}
                >
                    แชร์ tune.{" "}
                    <span
                        style={{
                            background:
                                "linear-gradient(135deg,#facc15,#fbbf24)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        ของคุณ ให้กับคนอื่นได้รู้
                    </span>
                </h1>

                <p
                    style={{
                        fontSize: "17px",
                        lineHeight: 1.7,
                        color: "#64748b",
                        maxWidth: "520px",
                        margin: "0 auto 40px",
                    }}
                >
                    แหล่งรวม tune setting สำหรับ Forza, The Crew และ NFS ค้นหา
                    แชร์ และ rate tune จากชุมชน tuner ทั่วโลก
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: "56px",
                    }}
                >
                    <Link
                        href="/tunes"
                        style={{
                            padding: "12px 28px",
                            borderRadius: "9px",
                            background: "#facc15",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "15px",
                            textDecoration: "none",
                        }}
                    >
                        Browse Tunes →
                    </Link>
                    <Link
                        href="/tunes/new"
                        style={{
                            padding: "12px 28px",
                            borderRadius: "9px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#cbd5e1",
                            fontWeight: 600,
                            fontSize: "15px",
                            textDecoration: "none",
                        }}
                    >
                        Upload Your Tune
                    </Link>
                </div>

                <div
                    style={{
                        display: "inline-flex",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            style={{
                                padding: "16px 32px",
                                textAlign: "center",
                                borderRight:
                                    i < stats.length - 1
                                        ? "1px solid rgba(255,255,255,0.07)"
                                        : "none",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "26px",
                                    fontWeight: 800,
                                    color: "#f1f5f9",
                                    lineHeight: 1,
                                }}
                            >
                                {s.value}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginTop: "4px",
                                    fontWeight: 500,
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* GAMES */}
            <section
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 24px 72px",
                }}
            >
                <h2
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: "24px",
                    }}
                >
                    Games
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill,minmax(240px,1fr))",
                        gap: "16px",
                    }}
                >
                    {((games as DbGame[]) ?? []).map((game) => {
                        const count = game.tune_count?.[0]?.count ?? 0
                        const clickable =
                            game.is_active && game.slug !== "forza-horizon-6"
                        const meta = GAME_META[game.slug]
                        return (
                            <Link
                                key={game.id}
                                href={clickable ? `/games/${game.slug}` : "#"}
                                style={{
                                    display: "block",
                                    textDecoration: "none",
                                    borderRadius: "12px",
                                    border: `1px solid ${meta ? meta.accent + "33" : "rgba(255,255,255,0.07)"}`,
                                    overflow: "hidden",
                                    background: "#13151c",
                                    opacity: clickable ? 1 : 0.7,
                                    cursor: clickable ? "pointer" : "default",
                                }}
                            >
                                {/* Card banner */}
                                <div
                                    style={{
                                        height: "140px",
                                        background:
                                            meta?.gradient ??
                                            "linear-gradient(135deg,#1e293b,#0f172a)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Cover image (if available) */}
                                    {game.cover_url && (
                                        <img
                                            src={game.cover_url}
                                            alt={game.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                position: "absolute",
                                                inset: 0,
                                                opacity: 0.75,
                                            }}
                                        />
                                    )}
                                    {/* Radial highlight overlay */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background:
                                                "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, transparent 65%)",
                                        }}
                                    />
                                    {/* Bottom fade for text legibility */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: "64px",
                                            background:
                                                "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                                        }}
                                    />

                                    {/* Center: icon + short badge (no cover) */}
                                    {!game.cover_url && (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "6px",
                                                userSelect: "none",
                                                position: "relative",
                                                zIndex: 1,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "36px",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {meta?.icon ?? "🎮"}
                                            </span>
                                            {meta && (
                                                <span
                                                    style={{
                                                        fontSize: "10px",
                                                        fontWeight: 800,
                                                        letterSpacing: "0.14em",
                                                        color: meta.accent,
                                                        background: `${meta.accent}22`,
                                                        border: `1px solid ${meta.accent}44`,
                                                        padding: "2px 9px",
                                                        borderRadius: "5px",
                                                    }}
                                                >
                                                    {meta.short}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Game name — bottom left overlay */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            left: "12px",
                                            right: "44px",
                                            zIndex: 2,
                                        }}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                fontWeight: 800,
                                                color: "#f1f5f9",
                                                lineHeight: 1.2,
                                                textShadow:
                                                    "0 1px 6px rgba(0,0,0,0.9)",
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {game.name}
                                        </p>
                                    </div>

                                    {/* Status badge — top right */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            zIndex: 2,
                                        }}
                                    >
                                        <GameStatusBadge
                                            isActive={game.is_active}
                                            slug={game.slug}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: "14px 16px" }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            color: "#e2e8f0",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {game.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#64748b",
                                        }}
                                    >
                                        {count > 0
                                            ? `${count.toLocaleString()} tunes`
                                            : "ยังไม่มี tune"}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* RECENT TUNES */}
            <section
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 24px 80px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#f1f5f9",
                            margin: 0,
                        }}
                    >
                        Recent Tunes
                    </h2>
                    <Link
                        href="/tunes"
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#facc15",
                            textDecoration: "none",
                            padding: "5px 12px",
                            borderRadius: "7px",
                            border: "1px solid rgba(250,204,21,0.25)",
                        }}
                    >
                        ดูทั้งหมด →
                    </Link>
                </div>

                <div
                    style={{
                        background: "#13151c",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            ...rowStyle,
                            background: "rgba(255,255,255,0.03)",
                        }}
                    >
                        {[
                            "Discipline",
                            "รถ",
                            "Tune Title",
                            "Tuner",
                            "Upvotes",
                        ].map((h, i) => (
                            <span
                                key={h}
                                style={
                                    {
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        color: "#475569",
                                        textAlign: i === 4 ? "right" : "left",
                                    } as React.CSSProperties
                                }
                            >
                                {h}
                            </span>
                        ))}
                    </div>

                    {!(recentTunes as DbTune[])?.length ? (
                        <div
                            style={{
                                padding: "48px 24px",
                                textAlign: "center",
                                color: "#475569",
                                fontSize: "14px",
                            }}
                        >
                            ยังไม่มี tune — เป็นคนแรกที่ upload!
                        </div>
                    ) : (
                        (recentTunes as DbTune[]).map((tune) => {
                            const car = tune.car?.[0] ?? null
                            const user = tune.user?.[0] ?? null
                            return (
                                <Link
                                    key={tune.id}
                                    href={`/tunes/${tune.id}`}
                                    style={{
                                        ...rowStyle,
                                        borderTop:
                                            "1px solid rgba(255,255,255,0.05)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <span>
                                        <DisciplineBadge
                                            discipline={tune.discipline}
                                        />
                                    </span>
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        {car ? (
                                            <>
                                                <span
                                                    style={{
                                                        fontSize: "13px",
                                                        color: "#cbd5e1",
                                                    }}
                                                >
                                                    {car.make} {car.model}
                                                </span>
                                                <PIBadge
                                                    piClass={car.pi_class}
                                                />
                                            </>
                                        ) : (
                                            <span style={{ color: "#475569" }}>
                                                —
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "13.5px",
                                            color: "#e2e8f0",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {tune.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            color: "#64748b",
                                        }}
                                    >
                                        {user?.username ?? "—"}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            color: "#94a3b8",
                                            textAlign: "right",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            gap: "4px",
                                        }}
                                    >
                                        <span style={{ color: "#facc15" }}>
                                            ▲
                                        </span>
                                        {tune.upvotes}
                                    </span>
                                </Link>
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}

const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "100px 1fr 1.5fr 120px 64px",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    color: "#e2e8f0",
}
