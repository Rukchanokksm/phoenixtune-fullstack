"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type View = "login" | "forgot" | "change"

function calcStrength(pw: string): {
    level: 0 | 1 | 2
    label: string
    color: string
} {
    if (!pw) return { level: 0, label: "", color: "" }
    const u = new Set(pw).size
    if (u <= 1) return { level: 0, label: "คาดเดาง่าย", color: "#f87171" }
    if (u <= 5) return { level: 1, label: "ปานกลาง", color: "#facc15" }
    return { level: 2, label: "คาดเดายาก", color: "#4ade80" }
}

function StrengthBar({ password }: { password: string }) {
    const s = calcStrength(password)
    if (!password) return null
    return (
        <div style={{ marginTop: "8px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: "4px",
                            borderRadius: "2px",
                            transition: "background 0.3s",
                            background: i <= s.level ? s.color : "#1e2130",
                        }}
                    />
                ))}
            </div>
            <span style={{ fontSize: "11px", color: s.color, fontWeight: 600 }}>
                {s.label}
            </span>
        </div>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get('next') ?? '/'
    const supabase = createClient()

    const [view, setView] = useState<View>("login")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState("")
    const [err, setErr] = useState("")

    // Login
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPw, setLoginPw] = useState("")

    // Forgot
    const [fEmail, setFEmail] = useState("")
    const [fNewPw, setFNewPw] = useState("")
    const [fConfirm, setFConfirm] = useState("")

    // Change
    const [cOld, setCOld] = useState("")
    const [cNew, setCNew] = useState("")
    const [cConfirm, setCConfirm] = useState("")

    function reset() {
        setErr("")
        setDone("")
    }
    function switchTo(v: View) {
        reset()
        setView(v)
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        reset()
        if (!loginEmail || !loginPw)
            return setErr("กรุณากรอก email และ password")
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPw,
        })
        setLoading(false)
        if (error) {
            const msg = error.message
            if (msg.includes("Invalid login credentials"))
                return setErr("email หรือ password ไม่ถูกต้อง")
            if (msg.includes("Email not confirmed"))
                return setErr(
                    "กรุณายืนยัน email ก่อน — หรือปิด Email Confirmation ใน Supabase Dashboard",
                )
            if (msg.includes("Too many requests"))
                return setErr("ลองเข้าสู่ระบบบ่อยเกินไป รอสักครู่แล้วลองใหม่")
            return setErr(msg)
        }
        router.push(nextPath)
        router.refresh()
    }

    // ── FORGOT ────────────────────────────────────────────────────────────────
    async function handleForgot(e: React.FormEvent) {
        e.preventDefault()
        reset()
        if (!fEmail) return setErr("กรุณากรอก email")
        if (fNewPw.length < 8)
            return setErr("password ต้องมีอย่างน้อย 8 ตัวอักษร")
        if (fNewPw !== fConfirm) return setErr("password ทั้งสองช่องไม่ตรงกัน")
        setLoading(true)
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: fEmail, newPassword: fNewPw }),
        })
        const data = await res.json()
        setLoading(false)
        if (!res.ok) return setErr(data.error ?? "เกิดข้อผิดพลาด")
        setDone("เปลี่ยนรหัสผ่านสำเร็จแล้ว — กลับไปเข้าสู่ระบบได้เลย")
        setFEmail("")
        setFNewPw("")
        setFConfirm("")
    }

    // ── CHANGE ────────────────────────────────────────────────────────────────
    async function handleChange(e: React.FormEvent) {
        e.preventDefault()
        reset()
        if (!cOld || !cNew || !cConfirm) return setErr("กรุณากรอกข้อมูลให้ครบ")
        if (cNew === cOld)
            return setErr("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม")
        if (cNew.length < 8)
            return setErr("password ใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
        if (cNew !== cConfirm)
            return setErr("password ใหม่ทั้งสองช่องไม่ตรงกัน")
        setLoading(true)
        const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword: cOld, newPassword: cNew }),
        })
        const data = await res.json()
        setLoading(false)
        if (!res.ok) return setErr(data.error ?? "เกิดข้อผิดพลาด")
        setDone("เปลี่ยนรหัสผ่านสำเร็จแล้ว!")
        setCOld("")
        setCNew("")
        setCConfirm("")
    }

    // ── Shared styles ─────────────────────────────────────────────────────────
    const inp: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        boxSizing: "border-box",
        background: "#0d1117",
        border: "1px solid #1e2130",
        color: "#e2e8f0",
        outline: "none",
    }
    const btn: React.CSSProperties = {
        width: "100%",
        padding: "12px",
        borderRadius: "9px",
        border: "none",
        fontWeight: 800,
        fontSize: "15px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        background: loading ? "#334155" : "#facc15",
        color: "#0d0f14",
    }
    const lbl: React.CSSProperties = {
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#94a3b8",
    }

    const TITLE = {
        login: "เข้าสู่ระบบ",
        forgot: "รีเซ็ตรหัสผ่าน",
        change: "เปลี่ยนรหัสผ่าน",
    }
    const ICON = { login: "🔑", forgot: "🔓", change: "🔒" }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 16px",
            }}
        >
            <div style={{ width: "100%", maxWidth: "400px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                        {ICON[view]}
                    </div>
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#e2e8f0",
                            margin: "0 0 6px",
                        }}
                    >
                        {TITLE[view]}
                    </h1>
                    <p
                        style={{
                            color: "#475569",
                            fontSize: "14px",
                            margin: 0,
                        }}
                    >
                        <span style={{ color: "#facc15", fontWeight: 700 }}>
                            Peonix
                        </span>
                        Tune
                    </p>
                </div>

                {/* Tab bar */}
                <div
                    style={{
                        display: "flex",
                        background: "#0d1117",
                        border: "1px solid #1e2130",
                        borderRadius: "10px",
                        padding: "4px",
                        marginBottom: "28px",
                        gap: "4px",
                    }}
                >
                    {(["login", "forgot", "change"] as View[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => switchTo(v)}
                            style={{
                                flex: 1,
                                padding: "8px 4px",
                                borderRadius: "7px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                transition: "all 0.2s",
                                background:
                                    view === v ? "#facc15" : "transparent",
                                color: view === v ? "#0d0f14" : "#475569",
                            }}
                        >
                            {v === "login"
                                ? "เข้าสู่ระบบ"
                                : v === "forgot"
                                  ? "ลืมรหัสผ่าน"
                                  : "เปลี่ยน"}
                        </button>
                    ))}
                </div>

                {/* Success / Error */}
                {done && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(74,222,128,0.1)",
                            border: "1px solid #4ade8066",
                            borderRadius: "8px",
                            color: "#4ade80",
                            fontSize: "13px",
                            marginBottom: "18px",
                        }}
                    >
                        ✅ {done}
                    </div>
                )}
                {err && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(248,113,113,0.1)",
                            border: "1px solid #f8717166",
                            borderRadius: "8px",
                            color: "#f87171",
                            fontSize: "13px",
                            marginBottom: "18px",
                        }}
                    >
                        ❌ {err}
                    </div>
                )}

                {/* ── VIEW: LOGIN ──────────────────────────────────────────────── */}
                {view === "login" && (
                    <form
                        onSubmit={handleLogin}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div>
                            <label style={lbl}>Email</label>
                            <input
                                style={inp}
                                type="email"
                                placeholder="you@example.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={lbl}>Password</label>
                            <input
                                style={inp}
                                type="password"
                                placeholder="••••••••"
                                value={loginPw}
                                onChange={(e) => setLoginPw(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={btn}>
                            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ →"}
                        </button>
                        <p
                            style={{
                                textAlign: "center",
                                color: "#475569",
                                fontSize: "13px",
                                margin: 0,
                            }}
                        >
                            ยังไม่มีบัญชี?{" "}
                            <Link
                                href="/register"
                                style={{
                                    color: "#facc15",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                }}
                            >
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </form>
                )}

                {/* ── VIEW: FORGOT ─────────────────────────────────────────────── */}
                {view === "forgot" && (
                    <form
                        onSubmit={handleForgot}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                padding: "12px 14px",
                                background: "rgba(250,204,21,0.06)",
                                border: "1px solid rgba(250,204,21,0.2)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#94a3b8",
                                lineHeight: 1.6,
                            }}
                        >
                            💡 กรอก email ที่ใช้สมัคร และ password
                            ใหม่ที่ต้องการตั้ง
                        </div>
                        <div>
                            <label style={lbl}>Email ที่ใช้สมัคร</label>
                            <input
                                style={inp}
                                type="email"
                                placeholder="you@example.com"
                                value={fEmail}
                                onChange={(e) => setFEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={lbl}>รหัสผ่านใหม่</label>
                            <input
                                style={inp}
                                type="password"
                                placeholder="อย่างน้อย 8 ตัวอักษร"
                                value={fNewPw}
                                onChange={(e) => setFNewPw(e.target.value)}
                            />
                            <StrengthBar password={fNewPw} />
                        </div>
                        <div>
                            <label style={lbl}>ยืนยันรหัสผ่านใหม่</label>
                            <input
                                style={{
                                    ...inp,
                                    borderColor:
                                        fConfirm && fConfirm !== fNewPw
                                            ? "#f87171"
                                            : "#1e2130",
                                }}
                                type="password"
                                placeholder="••••••••"
                                value={fConfirm}
                                onChange={(e) => setFConfirm(e.target.value)}
                            />
                            {fConfirm && fConfirm !== fNewPw && (
                                <p
                                    style={{
                                        color: "#f87171",
                                        fontSize: "12px",
                                        margin: "4px 0 0",
                                    }}
                                >
                                    password ไม่ตรงกัน
                                </p>
                            )}
                            {fConfirm && fConfirm === fNewPw && fNewPw && (
                                <p
                                    style={{
                                        color: "#4ade80",
                                        fontSize: "12px",
                                        margin: "4px 0 0",
                                    }}
                                >
                                    ✓ password ตรงกัน
                                </p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} style={btn}>
                            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน →"}
                        </button>
                    </form>
                )}

                {/* ── VIEW: CHANGE ─────────────────────────────────────────────── */}
                {view === "change" && (
                    <form
                        onSubmit={handleChange}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                padding: "12px 14px",
                                background: "rgba(96,165,250,0.06)",
                                border: "1px solid rgba(96,165,250,0.2)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#94a3b8",
                                lineHeight: 1.6,
                            }}
                        >
                            🔒 ต้องเข้าสู่ระบบก่อนถึงจะเปลี่ยนรหัสผ่านได้
                        </div>
                        <div>
                            <label style={lbl}>รหัสผ่านเดิม</label>
                            <input
                                style={inp}
                                type="password"
                                placeholder="••••••••"
                                value={cOld}
                                onChange={(e) => setCOld(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={lbl}>รหัสผ่านใหม่</label>
                            <input
                                style={{
                                    ...inp,
                                    borderColor:
                                        cNew && cNew === cOld
                                            ? "#f87171"
                                            : "#1e2130",
                                }}
                                type="password"
                                placeholder="ต้องไม่ซ้ำกับอันเดิม"
                                value={cNew}
                                onChange={(e) => setCNew(e.target.value)}
                            />
                            {cNew && cNew === cOld && (
                                <p
                                    style={{
                                        color: "#f87171",
                                        fontSize: "12px",
                                        margin: "4px 0 0",
                                    }}
                                >
                                    รหัสผ่านใหม่ซ้ำกับอันเดิม
                                </p>
                            )}
                            <StrengthBar password={cNew} />
                        </div>
                        <div>
                            <label style={lbl}>ยืนยันรหัสผ่านใหม่</label>
                            <input
                                style={{
                                    ...inp,
                                    borderColor:
                                        cConfirm && cConfirm !== cNew
                                            ? "#f87171"
                                            : "#1e2130",
                                }}
                                type="password"
                                placeholder="••••••••"
                                value={cConfirm}
                                onChange={(e) => setCConfirm(e.target.value)}
                            />
                            {cConfirm && cConfirm !== cNew && (
                                <p
                                    style={{
                                        color: "#f87171",
                                        fontSize: "12px",
                                        margin: "4px 0 0",
                                    }}
                                >
                                    password ไม่ตรงกัน
                                </p>
                            )}
                            {cConfirm &&
                                cConfirm === cNew &&
                                cNew &&
                                cNew !== cOld && (
                                    <p
                                        style={{
                                            color: "#4ade80",
                                            fontSize: "12px",
                                            margin: "4px 0 0",
                                        }}
                                    >
                                        ✓ password ตรงกัน
                                    </p>
                                )}
                        </div>
                        <button type="submit" disabled={loading} style={btn}>
                            {loading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน →"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
