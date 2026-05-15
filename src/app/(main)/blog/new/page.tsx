"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/LanguageProvider"

type Block =
    | { type: "text"; content: string }
    | { type: "image"; url: string }
    | { type: "section"; title: string }

export default function NewBlogPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [coverUrl, setCoverUrl] = useState("")
    const [blocks, setBlocks] = useState<Block[]>([{ type: "text", content: "" }])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d?.user?.role === "admin") setAuthorized(true)
                else setAuthorized(false)
            })
            .catch(() => setAuthorized(false))
    }, [])

    if (authorized === null) {
        return <div style={{ maxWidth: "800px", margin: "80px auto", padding: "24px", color: "#475569", textAlign: "center" }}>{t.blog.loading}</div>
    }
    if (!authorized) {
        return (
            <div style={{ maxWidth: "800px", margin: "80px auto", padding: "24px", textAlign: "center", color: "#374151" }}>
                {t.blog.adminOnly}
                <br />
                <Link href="/blog" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "13px" }}>← {t.blog.backList}</Link>
            </div>
        )
    }

    function addBlock(type: Block["type"]) {
        if (type === "text") setBlocks((b) => [...b, { type: "text", content: "" }])
        if (type === "image") setBlocks((b) => [...b, { type: "image", url: "" }])
        if (type === "section") setBlocks((b) => [...b, { type: "section", title: "" }])
    }

    function updateBlock(i: number, patch: Partial<Block>) {
        setBlocks((prev) => prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as Block) : b)))
    }

    function removeBlock(i: number) {
        setBlocks((prev) => prev.filter((_, idx) => idx !== i))
    }

    function moveBlock(i: number, dir: -1 | 1) {
        setBlocks((prev) => {
            const next = [...prev]
            const j = i + dir
            if (j < 0 || j >= next.length) return prev
            ;[next[i], next[j]] = [next[j], next[i]]
            return next
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        if (!title.trim()) { setError(t.blog.errNoTitle); return }
        setSubmitting(true)
        try {
            const res = await fetch("/api/blog/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    excerpt: excerpt.trim() || null,
                    cover_url: coverUrl.trim() || null,
                    body: JSON.stringify(blocks.filter((b) => {
                        if (b.type === "text") return b.content.trim()
                        if (b.type === "image") return b.url.trim()
                        if (b.type === "section") return b.title.trim()
                        return false
                    })),
                }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? t.blog.errGeneric); return }
            router.push(`/blog/${data.id}`)
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: "8px",
        background: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)",
        color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box",
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "28px" }}>
                <Link href="/blog" style={{ color: "#475569", fontSize: "13px", textDecoration: "none" }}>← {t.blog.backList}</Link>
                <h1 style={{ margin: "12px 0 4px", fontSize: "22px", fontWeight: 800, color: "#f1f5f9" }}>
                    {t.blog.newPostTitle}
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>{t.blog.titleLabel} *</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.blog.titlePlaceholder} style={{ ...inputStyle, fontSize: "18px", fontWeight: 700 }} />
                </div>
                <div>
                    <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>{t.blog.excerptLabel}</label>
                    <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t.blog.excerptPlaceholder} style={inputStyle} />
                </div>
                <div>
                    <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>{t.blog.coverUrlLabel}</label>
                    <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
                </div>

                <div>
                    <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "10px" }}>{t.blog.contentLabel}</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {blocks.map((block, i) => (
                            <div key={i} style={{ background: "#111318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: block.type === "section" ? "#60a5fa" : block.type === "image" ? "#818cf8" : "#64748b", background: block.type === "section" ? "rgba(96,165,250,0.1)" : block.type === "image" ? "rgba(129,140,248,0.1)" : "rgba(100,116,139,0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                                        {block.type}
                                    </span>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                                        <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ padding: "2px 8px", borderRadius: "4px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", fontSize: "11px", cursor: "pointer", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                                        <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} style={{ padding: "2px 8px", borderRadius: "4px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", fontSize: "11px", cursor: "pointer", opacity: i === blocks.length - 1 ? 0.3 : 1 }}>↓</button>
                                        <button type="button" onClick={() => removeBlock(i)} style={{ padding: "2px 8px", borderRadius: "4px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "11px", cursor: "pointer" }}>✕</button>
                                    </div>
                                </div>
                                {block.type === "text" && (
                                    <textarea value={block.content} onChange={(e) => updateBlock(i, { content: e.target.value })} rows={5} placeholder={t.blog.textPlaceholder} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: "13.5px", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.7 }} />
                                )}
                                {block.type === "image" && (
                                    <input value={block.url} onChange={(e) => updateBlock(i, { url: e.target.value })} placeholder="https://..." style={inputStyle} />
                                )}
                                {block.type === "section" && (
                                    <input value={block.title} onChange={(e) => updateBlock(i, { title: e.target.value })} placeholder={t.blog.sectionTitlePlaceholder} style={{ ...inputStyle, fontWeight: 700 }} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        {(["text", "image", "section"] as Block["type"][]).map((type) => (
                            <button key={type} type="button" onClick={() => addBlock(type)} style={{ padding: "6px 14px", borderRadius: "7px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>
                                + {type}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div style={{ color: "#f87171", fontSize: "13px" }}>{error}</div>}

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <Link href="/blog" style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", fontSize: "13px", textDecoration: "none" }}>
                        {t.blog.cancel}
                    </Link>
                    <button type="submit" disabled={submitting || !title.trim()} style={{ padding: "10px 24px", borderRadius: "8px", background: "#60a5fa", color: "#000", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", opacity: submitting || !title.trim() ? 0.5 : 1 }}>
                        {submitting ? t.blog.submitting : t.blog.submitBtn}
                    </button>
                </div>
            </form>
        </div>
    )
}
