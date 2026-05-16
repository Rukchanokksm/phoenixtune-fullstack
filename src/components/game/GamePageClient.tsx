"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/i18n/LanguageProvider"
import { TopTunesClient } from "@/components/game/TopTunesClient"
import { BrandsGrid } from "@/components/game/BrandsGrid"
import { AdUnit } from "@/components/ads/AdUnit"

interface GameMeta {
    name: string
    gradient: string
    accent: string
    available: boolean
}

interface Props {
    gameSlug: string
    meta: GameMeta
    brands: string[]
    coverUrl: string | null
}

function Heading({
    emoji,
    title,
    sub,
    dot,
}: {
    emoji: string
    title: string
    sub: string
    dot: string
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                marginBottom: "24px",
            }}
        >
            <span style={{ fontSize: "26px", lineHeight: 1 }}>{emoji}</span>
            <div>
                <h2
                    style={{
                        margin: 0,
                        color: "#e2e8f0",
                        fontWeight: 800,
                        fontSize: "19px",
                    }}
                >
                    {title}
                </h2>
                <p
                    style={{
                        margin: "4px 0 0",
                        color: "#475569",
                        fontSize: "13px",
                    }}
                >
                    {sub}
                </p>
            </div>
            <div
                style={{
                    marginLeft: "auto",
                    width: "36px",
                    height: "3px",
                    background: dot,
                    borderRadius: "2px",
                    marginTop: "12px",
                    flexShrink: 0,
                }}
            />
        </div>
    )
}

export function GamePageClient({ gameSlug, meta, brands, coverUrl }: Props) {
    const { t } = useLanguage()
    const g = t.game

    const subtitleKey =
        gameSlug === "forza-horizon-5"
            ? "subtitleFH5"
            : gameSlug === "forza-horizon-6"
              ? "subtitleFH6"
              : gameSlug === "nfs-unbound"
                ? "subtitleNFS"
                : "subtitleFH5"

    const subtitle = g[subtitleKey]

    if (!meta.available) {
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
                {coverUrl && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 0,
                            pointerEvents: "none",
                        }}
                    >
                        <Image
                            src={coverUrl}
                            alt=""
                            fill
                            style={{
                                objectFit: "cover",
                                opacity: 0.06,
                                filter: "blur(2px)",
                            }}
                            priority
                        />
                    </div>
                )}
                <div
                    style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        🔜
                    </div>
                    <h1 style={{ color: "#e2e8f0", marginBottom: "8px" }}>
                        {meta.name}
                    </h1>
                    <p style={{ color: "#475569", marginBottom: "20px" }}>
                        {g.comingSoonDesc}
                    </p>
                    <Link
                        href="/"
                        style={{ color: "#facc15", textDecoration: "none" }}
                    >
                        {g.backHome}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                background: "#0d0f14",
                minHeight: "100vh",
                color: "#e2e8f0",
            }}
        >
            {/* ─── Hero with cover image background ─── */}
            <div
                style={{
                    position: "relative",
                    borderBottom: `1px solid ${meta.accent}22`,
                    overflow: "hidden",
                }}
            >
                {coverUrl && (
                    <Image
                        src={coverUrl}
                        alt={meta.name}
                        fill
                        style={{
                            objectFit: "cover",
                            objectPosition: "center 30%",
                            opacity: 0.18,
                        }}
                        priority
                    />
                )}

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: meta.gradient,
                        zIndex: 1,
                        ...(coverUrl ? { opacity: 0.82 } : {}),
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "56px 24px 48px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "16px",
                        }}
                    >
                        <Link
                            href="/"
                            style={{
                                fontSize: "13px",
                                color: "#64748b",
                                textDecoration: "none",
                            }}
                        >
                            {g.home}
                        </Link>
                        <span style={{ color: "#334155" }}>›</span>
                        <span style={{ fontSize: "13px", color: meta.accent }}>
                            {meta.name}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontSize: "clamp(28px,4vw,52px)",
                                    fontWeight: 900,
                                    margin: "0 0 8px",
                                    color: "#f1f5f9",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {meta.name}
                            </h1>
                            <p
                                style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "15px",
                                }}
                            >
                                {subtitle}
                            </p>
                        </div>
                        {brands.length > 0 && (
                            <div
                                style={{
                                    marginLeft: "auto",
                                    padding: "8px 18px",
                                    borderRadius: "10px",
                                    background: `${meta.accent}18`,
                                    border: `1px solid ${meta.accent}33`,
                                    fontSize: "13px",
                                    color: meta.accent,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {brands.length} {g.brandsLabel}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "40px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "56px",
                }}
            >
                {/* Top Tunes */}
                <section>
                    <Heading
                        emoji="🏆"
                        title={g.topTunesTitle}
                        sub={g.topTunesSub}
                        dot={meta.accent}
                    />
                    <TopTunesClient gameSlug={gameSlug} />
                </section>

                <AdUnit slot={`game-${gameSlug}-mid`} format="horizontal" />

                {/* Tune Lab CTA */}
                <section>
                    <Heading
                        emoji="🧮"
                        title={g.tuneLabTitle}
                        sub={g.tuneLabSub}
                        dot="#facc15"
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg,#1a1400,#0d0f14)",
                                border: `1px solid ${gameSlug === "forza-horizon-6" ? "rgba(250,204,21,0.06)" : "rgba(250,204,21,0.15)"}`,
                                borderRadius: "16px",
                                padding: "40px 32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "24px",
                                opacity: gameSlug === "forza-horizon-6" ? 0.6 : 1,
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "20px",
                                            fontWeight: 800,
                                            color: "#f1f5f9",
                                        }}
                                    >
                                        {g.autoCalcTitle}
                                    </h3>
                                    {gameSlug === "forza-horizon-6" && (
                                        <span style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            padding: "3px 8px",
                                            borderRadius: "5px",
                                            background: "rgba(250,204,21,0.1)",
                                            border: "1px solid rgba(250,204,21,0.25)",
                                            color: "#facc15",
                                        }}>
                                            {t.nav.soon}
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "#64748b",
                                        fontSize: "14px",
                                        maxWidth: "420px",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {gameSlug === "forza-horizon-6"
                                        ? "The calculation formula for FH6 is still being researched. This feature will be available soon."
                                        : g.autoCalcDesc}
                                </p>
                            </div>
                            {gameSlug === "forza-horizon-6" ? (
                                <span
                                    style={{
                                        padding: "13px 28px",
                                        borderRadius: "10px",
                                        background: "rgba(250,204,21,0.08)",
                                        border: "1px solid rgba(250,204,21,0.2)",
                                        color: "#64748b",
                                        fontWeight: 800,
                                        fontSize: "15px",
                                        whiteSpace: "nowrap",
                                        cursor: "not-allowed",
                                    }}
                                >
                                    {t.nav.soon}
                                </span>
                            ) : (
                            <Link
                                href="/calculator"
                                className="btn-calculator"
                                style={{
                                    padding: "13px 28px",
                                    borderRadius: "10px",
                                    background: "#facc15",
                                    color: "#0d0f14",
                                    fontWeight: 800,
                                    fontSize: "15px",
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {g.calcBtn}
                            </Link>
                            )}
                        </div>
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg,#0f1a0f,#0d0f14)",
                                border: "1px solid rgba(74,222,128,0.15)",
                                borderRadius: "16px",
                                padding: "40px 32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "24px",
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        fontSize: "20px",
                                        fontWeight: 800,
                                        color: "#f1f5f9",
                                    }}
                                >
                                    {g.shareTuneTitle}
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "#64748b",
                                        fontSize: "14px",
                                        maxWidth: "420px",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {g.shareTuneDesc}
                                </p>
                            </div>
                            <Link
                                href={`/tunes/new?game=${gameSlug}`}
                                className="btn-share-tune"
                                style={{
                                    padding: "13px 28px",
                                    borderRadius: "10px",
                                    background: "#4ade80",
                                    color: "#0d0f14",
                                    fontWeight: 800,
                                    fontSize: "15px",
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {g.shareTuneBtn}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Car Brands */}
                {brands.length > 0 && (
                    <section>
                        <Heading
                            emoji="🚗"
                            title={g.carBrandsTitle}
                            sub={`${g.carBrandsSub} ${brands.length} ${g.brandsLabel}`}
                            dot="#4ade80"
                        />
                        <BrandsGrid
                            gameSlug={gameSlug}
                            brands={brands}
                            accent={meta.accent}
                        />
                    </section>
                )}

                <AdUnit slot={`game-${gameSlug}-bottom`} format="horizontal" />

                {/* All Tunes CTA */}
                <section>
                    <Heading
                        emoji="📋"
                        title={g.allTunesTitle}
                        sub={g.allTunesSub}
                        dot={meta.accent}
                    />
                    <Link
                        href={`/tunes?game=${gameSlug}`}
                        style={{ textDecoration: "none", display: "block" }}
                    >
                        <div
                            style={{
                                background: `linear-gradient(135deg,${meta.accent}0d,#0d0f14)`,
                                border: `1px solid ${meta.accent}33`,
                                borderRadius: "16px",
                                padding: "36px 32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "20px",
                                transition: "border-color 0.2s",
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        fontSize: "20px",
                                        fontWeight: 800,
                                        color: "#f1f5f9",
                                    }}
                                >
                                    {g.allTunesCardPrefix} {meta.name}{" "}
                                    {g.allTunesCardSuffix}
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "#64748b",
                                        fontSize: "14px",
                                        lineHeight: 1.6,
                                        maxWidth: "420px",
                                    }}
                                >
                                    {g.allTunesCardDesc}
                                </p>
                            </div>
                            <div
                                style={{
                                    padding: "13px 28px",
                                    borderRadius: "10px",
                                    background: meta.accent,
                                    color: "#0d0f14",
                                    fontWeight: 800,
                                    fontSize: "15px",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                            >
                                {g.allTunesBtn}
                            </div>
                        </div>
                    </Link>
                </section>
            </div>
        </div>
    )
}
