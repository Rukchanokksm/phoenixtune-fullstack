"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Gender } from "@/types"

const COUNTRIES = [
    "ไทย",
    "ญี่ปุ่น",
    "เกาหลีใต้",
    "จีน",
    "สิงคโปร์",
    "มาเลเซีย",
    "อินโดนีเซีย",
    "ฟิลิปปินส์",
    "เวียดนาม",
    "อินเดีย",
    "สหรัฐอเมริกา",
    "สหราชอาณาจักร",
    "แคนาดา",
    "ออสเตรเลีย",
    "เยอรมนี",
    "ฝรั่งเศส",
    "อิตาลี",
    "สเปน",
    "เนเธอร์แลนด์",
    "สวีเดน",
    "นอร์เวย์",
    "เดนมาร์ก",
    "ฟินแลนด์",
    "สวิตเซอร์แลนด์",
    "บราซิล",
    "เม็กซิโก",
    "อาร์เจนตินา",
    "แอฟริกาใต้",
    "รัสเซีย",
    "นิวซีแลนด์",
    "อื่นๆ",
]

interface Props {
    userId: string
    initial: {
        bio: string
        gender: Gender
        country: string
        birthday: string
        avatarUrl: string
    }
    username: string
}

export function EditProfileForm({ userId, initial, username }: Props) {
    const router = useRouter()
    const supabase = createClient()
    const fileRef = useRef<HTMLInputElement>(null)

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(initial)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
        setForm((f) => ({ ...f, [k]: v }))
        setSuccess(false)
        setError("")
    }

    function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            setError("ขนาดรูปต้องไม่เกิน 2MB")
            return
        }
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)
        try {
            let avatarUrl = form.avatarUrl

            if (avatarFile) {
                const ext = avatarFile.name.split(".").pop()
                const path = `${userId}/avatar.${ext}`
                const { error: upErr } = await supabase.storage
                    .from("avatars")
                    .upload(path, avatarFile, { upsert: true })
                if (upErr) throw upErr
                const { data: pub } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(path)
                avatarUrl = pub.publicUrl
            }

            const res = await fetch("/api/auth/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bio: form.bio,
                    gender: form.gender,
                    country: form.country,
                    birthday: form.birthday,
                    avatarUrl,
                }),
            })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error ?? "บันทึกไม่สำเร็จ")
            }

            setSuccess(true)
            setAvatarFile(null)
            router.refresh()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        } finally {
            setLoading(false)
        }
    }

    const inp: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        background: "#0d1117",
        border: "1px solid #1e2130",
        color: "#e2e8f0",
        outline: "none",
        boxSizing: "border-box",
    }
    const lbl: React.CSSProperties = {
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#94a3b8",
    }

    const currentAvatar = avatarPreview ?? (form.avatarUrl || null)

    return (
        <div
            style={{
                background: "#111318",
                border: "1px solid #1e2130",
                borderRadius: "16px",
                marginBottom: "24px",
                overflow: "hidden",
            }}
        >
            {/* Toggle header */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: "100%",
                    padding: "18px 24px",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    color: "#e2e8f0",
                }}
            >
                <span style={{ fontWeight: 700, fontSize: "15px" }}>
                    ✏️ แก้ไขข้อมูลส่วนตัว
                </span>
                <span
                    style={{
                        color: "#475569",
                        fontSize: "18px",
                        transition: "transform 0.2s",
                        transform: open ? "rotate(180deg)" : "none",
                    }}
                >
                    ▾
                </span>
            </button>

            {open && (
                <form
                    onSubmit={handleSave}
                    style={{
                        padding: "0 24px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            height: "1px",
                            background: "#1e2130",
                            margin: "0 0 4px",
                        }}
                    />

                    {/* Avatar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px dashed #facc1566",
                                cursor: "pointer",
                                flexShrink: 0,
                                background: "#0d1117",
                            }}
                        >
                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt="avatar"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "28px",
                                    }}
                                >
                                    👤
                                </div>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    background: "none",
                                    border: "1px solid #1e2130",
                                    color: "#94a3b8",
                                    padding: "6px 14px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    display: "block",
                                    marginBottom: "4px",
                                }}
                            >
                                เปลี่ยนรูปโปรไฟล์
                            </button>
                            <span
                                style={{ color: "#475569", fontSize: "11px" }}
                            >
                                JPG/PNG ไม่เกิน 2MB
                            </span>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatar}
                            style={{ display: "none" }}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={lbl}>Bio</label>
                        <textarea
                            style={{
                                ...inp,
                                resize: "vertical",
                                minHeight: "72px",
                                fontFamily: "inherit",
                            }}
                            placeholder="แนะนำตัวสั้นๆ..."
                            value={form.bio}
                            onChange={(e) => setField("bio", e.target.value)}
                            maxLength={200}
                        />
                        <span style={{ color: "#334155", fontSize: "11px" }}>
                            {form.bio.length}/200
                        </span>
                    </div>

                    {/* Gender */}
                    <div>
                        <label style={lbl}>เพศ</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {(
                                [
                                    ["male", "ชาย", "💙"],
                                    ["female", "หญิง", "🩷"],
                                    ["unspecified", "ไม่ระบุ", "🤍"],
                                ] as const
                            ).map(([val, text, icon]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setField("gender", val)}
                                    style={{
                                        flex: 1,
                                        padding: "9px 4px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        border: `1px solid ${form.gender === val ? "#facc15" : "#1e2130"}`,
                                        background:
                                            form.gender === val
                                                ? "rgba(250,204,21,0.08)"
                                                : "#0d1117",
                                        color:
                                            form.gender === val
                                                ? "#facc15"
                                                : "#64748b",
                                    }}
                                >
                                    {icon} {text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Country */}
                    <div>
                        <label style={lbl}>ประเทศ</label>
                        <select
                            style={{ ...inp, cursor: "pointer" }}
                            value={form.country}
                            onChange={(e) =>
                                setField("country", e.target.value)
                            }
                        >
                            <option value="">— ไม่ระบุ —</option>
                            {COUNTRIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Birthday */}
                    <div>
                        <label style={lbl}>วันเกิด</label>
                        <input
                            style={{ ...inp, colorScheme: "dark" }}
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={form.birthday}
                            onChange={(e) =>
                                setField("birthday", e.target.value)
                            }
                        />
                    </div>

                    {/* Feedback */}
                    {error && (
                        <div
                            style={{
                                padding: "10px 14px",
                                background: "rgba(248,113,113,0.1)",
                                border: "1px solid #f87171",
                                borderRadius: "8px",
                                color: "#f87171",
                                fontSize: "13px",
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {success && (
                        <div
                            style={{
                                padding: "10px 14px",
                                background: "rgba(74,222,128,0.1)",
                                border: "1px solid #4ade80",
                                borderRadius: "8px",
                                color: "#4ade80",
                                fontSize: "13px",
                            }}
                        >
                            ✓ บันทึกสำเร็จ
                        </div>
                    )}

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "11px",
                            borderRadius: "9px",
                            border: "none",
                            fontWeight: 800,
                            fontSize: "14px",
                            cursor: loading ? "not-allowed" : "pointer",
                            background: loading ? "#334155" : "#facc15",
                            color: "#0d0f14",
                            transition: "background 0.2s",
                        }}
                    >
                        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                </form>
            )}
        </div>
    )
}
