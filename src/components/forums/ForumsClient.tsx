"use client"

import Link from "next/link"
import { AdUnit } from "@/components/ads/AdUnit"
import { useLanguage } from "@/lib/i18n/LanguageProvider"
import { timeAgo } from "@/lib/i18n/timeAgo"

export type ForumPost = {
  id: string; title: string; category: string; upvotes: number; comment_count: number
  created_at: string; updated_at: string
  game: { name: string; slug: string } | null
  user: { username: string } | null
}

interface Props {
  isLoggedIn: boolean
  isAdmin: boolean
  announcements: ForumPost[]
  generalPosts: ForumPost[]
  reportPosts: ForumPost[]
}

function PostRow({ post, locale }: { post: ForumPost; locale: string }) {
  const { t } = useLanguage()
  return (
    <Link href={`/forums/${post.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "13px 20px", borderTop: "1px solid #1a1d24" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
          <div style={{ display: "flex", gap: "10px", marginTop: "3px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#475569", fontSize: "12px" }}>@{post.user?.username ?? "—"}</span>
            {post.game && (
              <span style={{ color: "#60a5fa", fontSize: "11px", background: "rgba(96,165,250,0.08)", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>{post.game.name}</span>
            )}
            <span style={{ color: "#374151", fontSize: "11px" }}>{timeAgo(post.updated_at, locale as "en" | "th")}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
          <span style={{ color: "#475569", fontSize: "12px" }}>{post.comment_count} {t.forums.comments}</span>
          <span style={{ color: "#64748b", fontSize: "12px" }}>▲ {post.upvotes}</span>
        </div>
      </div>
    </Link>
  )
}

function SegmentCard({ title, sub, href, adminLink, children }: {
  title: string; sub: string; href: string; adminLink?: React.ReactNode; children: React.ReactNode
}) {
  const { t } = useLanguage()
  return (
    <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1a1d24" }}>
        <div>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>{title}</span>
          <span style={{ color: "#475569", fontSize: "12px", marginLeft: "10px" }}>{sub}</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {adminLink}
          <Link href={href} style={{ color: "#64748b", fontSize: "12px", textDecoration: "none" }}>{t.forums.viewAll}</Link>
        </div>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ padding: "32px 20px", color: "#374151", fontSize: "13px", textAlign: "center" }}>{text}</div>
}

export function ForumsClient({ isLoggedIn, isAdmin, announcements, generalPosts, reportPosts }: Props) {
  const { t, locale } = useLanguage()
  const f = t.forums

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px", color: "#e2e8f0" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800 }}>{f.title}</h1>
          <p style={{ margin: 0, color: "#475569", fontSize: "13px" }}>{f.subtitle}</p>
        </div>
        {isLoggedIn && (
          <Link href="/forums/new" style={{ padding: "10px 22px", borderRadius: "8px", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
            {f.newPost}
          </Link>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        <SegmentCard
          title={f.catAnnouncement} sub={f.catAnnouncementSub}
          href="/forums/announcements"
          adminLink={isAdmin ? (
            <Link href="/forums/new?category=announcement" style={{ color: "#6366f1", fontSize: "12px", textDecoration: "none", fontWeight: 600 }}>
              {f.addAnnouncement}
            </Link>
          ) : undefined}
        >
          {!announcements.length
            ? <EmptyState text={f.emptyAnnouncements} />
            : announcements.map(p => <PostRow key={p.id} post={p} locale={locale} />)
          }
        </SegmentCard>

        <AdUnit slot="forums-hub-banner" format="horizontal" />

        <SegmentCard title={f.catGeneral} sub={f.catGeneralSub} href="/forums/general">
          {!generalPosts.length
            ? <EmptyState text={f.emptyGeneral} />
            : generalPosts.map(p => <PostRow key={p.id} post={p} locale={locale} />)
          }
        </SegmentCard>

        <SegmentCard title={f.catReports} sub={f.catReportsSub} href="/forums/reports">
          {!reportPosts.length
            ? <EmptyState text={f.emptyReports} />
            : reportPosts.map(p => <PostRow key={p.id} post={p} locale={locale} />)
          }
        </SegmentCard>

      </div>
    </div>
  )
}
