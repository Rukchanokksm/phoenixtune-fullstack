"use client"

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/LanguageProvider"
import { timeAgo } from "@/lib/i18n/timeAgo"
import { AdUnit } from "@/components/ads/AdUnit"

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-games`

const GAME_META: Record<string, { gradient: string; icon: string; accent: string; short: string }> = {
  "forza-horizon-5":    { gradient: "linear-gradient(135deg,#1e3a5f,#0f2040,#0d0f1e)", icon: "🏔", accent: "#60a5fa", short: "FH5" },
  "forza-horizon-6":    { gradient: "linear-gradient(135deg,#2a1f3a,#1a0f2a,#0d0f1e)", icon: "🌆", accent: "#c084fc", short: "FH6" },
  "the-crew-motorfest": { gradient: "linear-gradient(135deg,#3a2a0f,#2a1a0a,#1a1208)", icon: "🌺", accent: "#fb923c", short: "TCM" },
  "nfs-unbound":        { gradient: "linear-gradient(135deg,#2a0f0f,#1a0808,#150a0a)", icon: "🏙", accent: "#f87171", short: "NFS" },
}

function bs(bg: string, color: string): React.CSSProperties {
  return { fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", padding: "2px 7px", borderRadius: "5px", background: bg, color }
}

export interface DbGame {
  id: string; name: string; slug: string; cover_url: string | null
  is_active: boolean; tune_count: { count: number }[]
}

export interface LatestPost {
  id: string; title: string; category: string; created_at: string
  user: { username: string } | null
  game: { name: string } | null
}

interface Props {
  tuneCount: number
  tunerCount: number
  gameCount: number
  games: DbGame[]
  latestPosts: LatestPost[]
}

export function HomeClient({ tuneCount, tunerCount, gameCount, games, latestPosts }: Props) {
  const { t, locale } = useLanguage()
  const h = t.home

  const stats = [
    { value: tuneCount.toLocaleString(), label: h.statTunes },
    { value: tunerCount.toLocaleString(), label: h.statTuners },
    { value: gameCount.toString(), label: h.statGames },
  ]

  const catLabel: Record<string, string> = {
    announcement: h.catAnnouncement,
    general:      h.catGeneral,
    report:       h.catReport,
  }
  const catColor: Record<string, { color: string; bg: string }> = {
    announcement: { color: "#facc15", bg: "rgba(250,204,21,0.08)" },
    general:      { color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
    report:       { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
  }

  return (
    <>
      <style>{`
        .game-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 14px 40px rgba(0,0,0,0.55); }
        .game-card .game-banner img { transition: transform 0.35s ease; }
        .game-card:hover .game-banner img { transform: scale(1.07); }
      `}</style>
      <div style={{ background: "#0d0f14", minHeight: "100vh", color: "#e2e8f0" }}>

        {/* HERO */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" }}>
          <span style={{
            display: "inline-block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#facc15", background: "rgba(250,204,21,0.1)",
            border: "1px solid rgba(250,204,21,0.2)", padding: "4px 14px", borderRadius: "100px", marginBottom: "20px",
          }}>
            {h.badge}
          </span>

          <h1 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", margin: "0 0 20px", color: "#f1f5f9" }}>
            {h.heroTitle}{" "}
            <span style={{ background: "linear-gradient(135deg,#facc15,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {h.heroTitleAt}
            </span>
          </h1>

          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#64748b", maxWidth: "520px", margin: "0 auto 40px" }}>
            {h.heroDesc}
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px" }}>
            <Link href="/tunes" style={{ padding: "12px 28px", borderRadius: "9px", background: "#facc15", color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>
              {h.browseTunes}
            </Link>
            <Link href="/tunes/new" style={{ padding: "12px 28px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              {h.uploadTune}
            </Link>
          </div>

          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ padding: "16px 32px", textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AD */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 32px" }}>
          <AdUnit slot="homepage-hero-banner" format="horizontal" />
        </div>

        {/* GAMES */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 72px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", marginBottom: "24px" }}>{h.gamesTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "16px" }}>
            {games.map((game) => {
              const count = game.tune_count?.[0]?.count ?? 0
              const clickable = game.is_active && game.slug !== "forza-horizon-6"
              const meta = GAME_META[game.slug]
              const statusBadge = game.slug === "forza-horizon-6"
                ? <span style={bs("#2a1f0f", "#fb923c")}>{h.statusSoon}</span>
                : !game.is_active
                  ? <span style={bs("#1e293b", "#64748b")}>{h.statusComing}</span>
                  : <span style={bs("#0f2a1a", "#4ade80")}>{h.statusLive}</span>
              return (
                <Link key={game.id} href={clickable ? `/games/${game.slug}` : "#"}
                  className={clickable ? "game-card" : undefined}
                  style={{ display: "block", textDecoration: "none", borderRadius: "12px",
                    border: `1px solid ${meta ? meta.accent + "33" : "rgba(255,255,255,0.07)"}`,
                    overflow: "hidden", background: "#13151c", opacity: clickable ? 1 : 0.7,
                    cursor: clickable ? "pointer" : "default" }}>
                  <div className="game-banner" style={{ height: "140px", background: meta?.gradient ?? "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {game.cover_url && (
                      <Image src={`${STORAGE_BASE}/${game.cover_url}`} alt={game.name} fill sizes="(max-width:600px) 100vw, 280px" style={{ objectFit: "cover", opacity: 0.75 }} />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, transparent 65%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "64px", background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />
                    {!game.cover_url && meta && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", userSelect: "none", position: "relative", zIndex: 1 }}>
                        <span style={{ fontSize: "36px", lineHeight: 1 }}>{meta.icon}</span>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: meta.accent, background: `${meta.accent}22`, border: `1px solid ${meta.accent}44`, padding: "2px 9px", borderRadius: "5px" }}>{meta.short}</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "44px", zIndex: 2 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.9)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {game.name}
                      </p>
                    </div>
                    <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>{statusBadge}</div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>{game.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {count > 0 ? `${count.toLocaleString()} tunes` : h.noTunes}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* RECENT POSTS */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{h.recentTitle}</h2>
            <Link href="/forums" style={{ fontSize: "13px", fontWeight: 600, color: "#facc15", textDecoration: "none", padding: "5px 12px", borderRadius: "7px", border: "1px solid rgba(250,204,21,0.25)" }}>
              {h.viewAll}
            </Link>
          </div>

          {!latestPosts.length ? (
            <div style={{ padding: "32px 20px", background: "#111318", border: "1px solid #1e2130", borderRadius: "10px", textAlign: "center", color: "#374151", fontSize: "13px" }}>
              {h.noPosts}
              <Link href="/forums/new" style={{ color: "#6366f1", textDecoration: "none" }}>{h.beFirstPost}</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {latestPosts.map((post) => {
                const cm = catColor[post.category] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.08)" }
                const label = catLabel[post.category] ?? post.category
                return (
                  <Link key={post.id} href={`/forums/${post.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", background: "#111318", border: "1px solid #1e2130", borderRadius: "10px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: cm.color, background: cm.bg, padding: "1px 7px", borderRadius: "4px" }}>{label}</span>
                          {post.game && (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#60a5fa", background: "rgba(96,165,250,0.08)", padding: "1px 7px", borderRadius: "4px" }}>{post.game.name}</span>
                          )}
                          {post.user && <span style={{ fontSize: "11px", color: "#475569" }}>@{post.user.username}</span>}
                          <span style={{ fontSize: "11px", color: "#374151" }}>{timeAgo(post.created_at, locale)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
