"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/userStore"

export default function SettingsPage() {
  const user = useUserStore((s) => s.user)
  const supabase = createClient()
  const [lang, setLang] = useState<"en" | "th">("en")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null
    if (saved === "en" || saved === "th") setLang(saved)
  }, [])

  function handleLangChange(next: "en" | "th") {
    setLang(next)
    localStorage.setItem("lang", next)
    document.documentElement.lang = next
    window.dispatchEvent(new Event("lang-change"))
    setMsg("Language updated")
    setTimeout(() => setMsg(""), 2000)
  }

  async function handleSignOut() {
    setSaving(true)
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (!user) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
        Please <Link href="/login" style={{ color: "#facc15" }}>log in</Link> to access settings.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px", color: "#e2e8f0" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "32px" }}>Settings</h1>

      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: "8px",
          background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
          color: "#4ade80", fontSize: "13px", marginBottom: "20px" }}>
          ✓ {msg}
        </div>
      )}

      {/* Language */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Language</h2>
        <p style={pStyle}>Choose your preferred display language.</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          {[
            { code: "en" as const, label: "English" },
            { code: "th" as const, label: "ภาษาไทย" },
          ].map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleLangChange(opt.code)}
              style={{
                padding: "10px 18px", borderRadius: "8px",
                border: `1px solid ${lang === opt.code ? "#facc15" : "rgba(255,255,255,0.1)"}`,
                background: lang === opt.code ? "rgba(250,204,21,0.1)" : "#13151c",
                color: lang === opt.code ? "#facc15" : "#94a3b8",
                fontWeight: lang === opt.code ? 700 : 500,
                fontSize: "14px", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Profile */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Profile</h2>
        <p style={pStyle}>Update your username, bio, and avatar.</p>
        <Link href={`/profile/${user.username}`} style={{
          display: "inline-block", marginTop: "12px",
          padding: "9px 16px", borderRadius: "8px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#e2e8f0", fontSize: "13.5px", textDecoration: "none", fontWeight: 500,
        }}>
          Edit profile →
        </Link>
      </section>

      {/* Password */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Password</h2>
        <p style={pStyle}>Change your account password.</p>
        <Link href="/login" style={{
          display: "inline-block", marginTop: "12px",
          padding: "9px 16px", borderRadius: "8px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#e2e8f0", fontSize: "13.5px", textDecoration: "none", fontWeight: 500,
        }}>
          Change password →
        </Link>
      </section>

      {/* Sign out */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Sign out</h2>
        <p style={pStyle}>End your current session.</p>
        <button
          onClick={handleSignOut}
          disabled={saving}
          style={{
            marginTop: "12px", padding: "9px 18px", borderRadius: "8px",
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
            color: "#f87171", fontSize: "13.5px", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  marginBottom: "20px", padding: "20px 22px",
  background: "#13151c", borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.06)",
}
const h2Style: React.CSSProperties = { fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#f1f5f9" }
const pStyle: React.CSSProperties = { color: "#64748b", fontSize: "13px", margin: 0 }
