"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Gender, TitleId } from "@/types";
import { TITLES } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
];

interface ProfileData {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: Gender;
  country: string | null;
  birthday: string | null;
  role: string;
  activeTitle: TitleId;
  joinYear: number;
}

interface Props {
  profile: ProfileData;
  isOwner: boolean;
}

function DefaultAvatar({ gender }: { gender: Gender }) {
  if (gender === "male")
    return (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <rect width="80" height="80" fill="#1e3a5f" />
        <circle cx="40" cy="28" r="14" fill="#60a5fa" />
        <path d="M10 72 Q10 50 40 50 Q70 50 70 72" fill="#60a5fa" />
      </svg>
    );
  if (gender === "female")
    return (
      <svg
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <rect width="80" height="80" fill="#3a1a2f" />
        <circle cx="40" cy="28" r="14" fill="#f472b6" />
        <path d="M10 72 Q10 48 40 48 Q70 48 70 72" fill="#f472b6" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <rect x="0" y="0" width="40" height="80" fill="#1e3a5f" />
      <rect x="40" y="0" width="40" height="80" fill="#3a1a2f" />
      <circle cx="40" cy="28" r="14" fill="#94a3b8" />
      <path d="M10 72 Q10 50 40 50 Q70 50 70 72" fill="#94a3b8" />
    </svg>
  );
}

export function ProfileCard({ profile, isOwner }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useLanguage();
  const pc = t.profileCard;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: profile.username,
    bio: profile.bio ?? "",
    gender: profile.gender,
    country: profile.country ?? "",
    birthday: profile.birthday ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const activeTitle = TITLES[profile.activeTitle] ?? TITLES.newcomer;
  const titleLabelMap: Record<string, string> = {
    newcomer: t.titles.newcomer,
    first_tune: t.titles.firstTune,
    tuner_10: t.titles.tuner10,
    tuner_30: t.titles.tuner30,
    tuner_100: t.titles.tuner100,
    liked_10: t.titles.liked10,
    liked_50: t.titles.liked50,
    liked_100: t.titles.liked100,
  };
  const activeTitleLabel =
    titleLabelMap[profile.activeTitle] ?? t.titles.newcomer;

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSuccess(false);
    setError("");
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(pc.errAvatarSize);
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || form.username.length < 3) {
      setError(pc.errUsernameMin3);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      let avatarUrl = form.avatarUrl;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatarUrl = pub.publicUrl;
      }

      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          bio: form.bio,
          gender: form.gender,
          country: form.country,
          birthday: form.birthday,
          avatarUrl,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? pc.errSaveFailed);
      }

      setSuccess(true);
      setAvatarFile(null);
      setEditing(false);
      if (form.username.trim() !== profile.username) {
        router.push(`/profile/${form.username.trim()}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : pc.errGeneric);
    } finally {
      setLoading(false);
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
  };
  const lbl: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
  };

  const currentAvatar = avatarPreview ?? (form.avatarUrl || null);
  const dateLocale = locale === "th" ? "th-TH" : "en-US";

  const genderOpts: [Gender, string, string][] = [
    ["male", pc.genderMale, "💙"],
    ["female", pc.genderFemale, "🩷"],
    ["unspecified", pc.genderUnspecified, "🤍"],
  ];

  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #1e2130",
        borderRadius: "16px",
        padding: "32px",
        marginBottom: "24px",
        position: "relative",
      }}
    >
      {/* Edit toggle button — top-right */}
      {isOwner && (
        <button
          onClick={() => {
            setEditing((o) => !o);
            setError("");
            setSuccess(false);
          }}
          title={editing ? pc.cancelTitle : pc.editBtn}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            border: `1px solid ${editing ? "#f87171" : "#1e2130"}`,
            background: editing ? "rgba(248,113,113,0.1)" : "#0d1117",
            color: editing ? "#f87171" : "#64748b",
            cursor: "pointer",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          {editing ? "✕" : "✏️"}
        </button>
      )}

      {!editing ? (
        /* ── Display mode ── */
        <div
          style={{
            display: "flex",
            gap: "28px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #facc1544",
              flexShrink: 0,
            }}
          >
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <DefaultAvatar gender={form.gender} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h1
              style={{
                margin: "0 0 6px",
                color: "#e2e8f0",
                fontWeight: 800,
                fontSize: "22px",
              }}
            >
              @{form.username}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{activeTitle.icon}</span>
              <span
                style={{
                  color: activeTitle.color,
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {activeTitleLabel}
              </span>
            </div>
            {form.bio && (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  margin: "0 0 12px",
                  lineHeight: 1.6,
                }}
              >
                {form.bio}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {form.country && (
                <span
                  style={{
                    color: "#475569",
                    fontSize: "13px",
                  }}
                >
                  📍 {form.country}
                </span>
              )}
              {form.birthday && (
                <span
                  style={{
                    color: "#475569",
                    fontSize: "13px",
                  }}
                >
                  🎂{" "}
                  {new Date(form.birthday).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              <span style={{ color: "#475569", fontSize: "13px" }}>
                📅 {pc.joinedPrefix} {profile.joinYear}
              </span>
              <span
                style={{
                  color: "#475569",
                  fontSize: "13px",
                  textTransform: "capitalize",
                }}
              >
                🎭 {profile.role}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Edit mode ── */
        <form
          onSubmit={handleSave}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            {pc.editHeading}
          </p>

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
                {pc.changeAvatar}
              </button>
              <span style={{ color: "#475569", fontSize: "11px" }}>
                {pc.avatarHint}
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

          {/* Username */}
          <div>
            <label style={lbl}>Username</label>
            <input
              style={{
                ...inp,
                borderColor:
                  error && form.username.length < 3 ? "#f87171" : "#1e2130",
              }}
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              placeholder="username"
              minLength={3}
              maxLength={30}
            />
            <p
              style={{
                color: "#475569",
                fontSize: "11px",
                margin: "4px 0 0",
              }}
            >
              {pc.usernameHint}
            </p>
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
              placeholder={pc.bioPlaceholder}
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
            <label style={lbl}>{pc.genderLabel}</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {genderOpts.map(([val, text, icon]) => (
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
                      form.gender === val ? "rgba(250,204,21,0.08)" : "#0d1117",
                    color: form.gender === val ? "#facc15" : "#64748b",
                  }}
                >
                  {icon} {text}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label style={lbl}>{pc.countryLabel}</label>
            <select
              style={{ ...inp, cursor: "pointer" }}
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
            >
              <option value="">{pc.countryNone}</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Birthday */}
          <div>
            <label style={lbl}>{pc.birthdayLabel}</label>
            <input
              style={{ ...inp, colorScheme: "dark" }}
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={form.birthday}
              onChange={(e) => setField("birthday", e.target.value)}
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
              {pc.saveSuccess}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
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
              {loading ? pc.saving : pc.saveBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              style={{
                padding: "11px 20px",
                borderRadius: "9px",
                border: "1px solid #1e2130",
                background: "none",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {pc.cancelBtn}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
