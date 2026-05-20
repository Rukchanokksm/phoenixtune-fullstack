"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Game = { id: string; name: string; slug: string };

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET = "forum-images";

type TextBlock = { id: string; type: "text"; content: string };
type ImageBlock = {
  id: string;
  type: "image";
  tempPath: string;
  preview: string;
  uploading: boolean;
  error: string;
};
type FormBlock = TextBlock | ImageBlock;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── sub-components ──────────────────────────────────────────────

function AddBar({
  onText,
  onImage,
  canImage,
}: {
  onText: () => void;
  onImage: () => void;
  canImage: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        justifyContent: "center",
        padding: "2px 0",
      }}
    >
      <button
        type="button"
        onClick={onText}
        style={{
          padding: "4px 12px",
          borderRadius: "5px",
          fontSize: "11px",
          cursor: "pointer",
          border: "1px solid #1e2130",
          background: "#0d0f14",
          color: "#475569",
        }}
      >
        {t.newPost.addText}
      </button>
      <button
        type="button"
        onClick={onImage}
        disabled={!canImage}
        style={{
          padding: "4px 12px",
          borderRadius: "5px",
          fontSize: "11px",
          cursor: canImage ? "pointer" : "not-allowed",
          border: "1px solid #1e2130",
          background: "#0d0f14",
          color: canImage ? "#475569" : "#2a2d35",
          opacity: canImage ? 1 : 0.5,
        }}
      >
        {t.newPost.addImage}
      </button>
    </div>
  );
}

function TextBlockEditor({
  block,
  onChange,
  onRemove,
  canRemove,
}: {
  block: TextBlock;
  onChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={block.content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.newPost.textPlaceholder}
        rows={4}
        style={{
          width: "100%",
          padding: "10px 36px 10px 14px",
          borderRadius: "8px",
          background: "#0d0f14",
          border: "1px solid #1e2130",
          color: "#e2e8f0",
          fontSize: "14px",
          outline: "none",
          resize: "vertical",
          lineHeight: "1.65",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            background: "transparent",
            border: "none",
            color: "#374151",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function ImageBlockEditor({
  block,
  onUpload,
  onRemove,
}: {
  block: ImageBlock;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const [drag, setDrag] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {block.preview ? (
        <div
          style={{
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#0d0f14",
            border: "1px solid #1e2130",
            cursor: "pointer",
          }}
          onClick={onUpload}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.preview}
            alt=""
            style={{
              width: "100%",
              maxHeight: "360px",
              objectFit: "contain",
              display: "block",
              background: "#0d0f14",
            }}
          />
          <div
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.15s",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {t.newPost.changeImage}
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onUpload();
          }}
          onClick={onUpload}
          style={{
            border: `2px dashed ${drag ? "#6366f1" : "#1e2130"}`,
            borderRadius: "8px",
            padding: "32px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? "rgba(99,102,241,0.04)" : "transparent",
            transition: "border-color 0.15s",
          }}
        >
          {block.uploading ? (
            <span style={{ color: "#475569", fontSize: "13px" }}>
              {t.newPost.uploading}
            </span>
          ) : (
            <span style={{ color: "#475569", fontSize: "13px" }}>
              {t.newPost.dropHint}{" "}
              <span style={{ color: "#6366f1", fontWeight: 600 }}>
                {t.newPost.selectFile}
              </span>
              <br />
              <span style={{ color: "#374151", fontSize: "11px" }}>
                {t.newPost.imageHint}
              </span>
            </span>
          )}
        </div>
      )}
      {block.error && (
        <div
          style={{
            color: "#fbbf24",
            fontSize: "11px",
            marginTop: "4px",
          }}
        >
          {block.error}
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "22px",
          height: "22px",
          borderRadius: "4px",
          background: "rgba(0,0,0,0.6)",
          border: "none",
          color: "#e2e8f0",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── main page ───────────────────────────────────────────────────

export default function NewForumPostPage() {
  const { t } = useLanguage();
  const np = t.newPost;

  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCat = searchParams.get("category") ?? "general";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlock = useRef<string>("");

  const [games, setGames] = useState<Game[]>([]);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<FormBlock[]>([
    { id: uid(), type: "text", content: "" },
  ]);
  const [tag, setTag] = useState<
    "general" | "report" | "game" | "announcement"
  >(
    defaultCat === "announcement"
      ? "announcement"
      : defaultCat === "report"
        ? "report"
        : "general",
  );
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((d) => setGames(d.games ?? []))
      .catch(() => {});
  }, []);

  const category = tag === "game" ? "general" : tag;
  const imageCount = blocks.filter((b) => b.type === "image").length;
  const canImage = imageCount < MAX_IMAGES;

  // ── block mutations ──────────────────────────────────────────

  function insertAfter(afterId: string, block: FormBlock) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === afterId);
      const next = [...prev];
      next.splice(i + 1, 0, block);
      return next;
    });
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.length === 0
        ? [{ id: uid(), type: "text", content: "" }]
        : next;
    });
  }

  function updateText(id: string, content: string) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }

  function updateImageBlock(id: string, patch: Partial<ImageBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as ImageBlock) : b)),
    );
  }

  // ── image upload ─────────────────────────────────────────────

  function triggerUpload(blockId: string) {
    activeBlock.current = blockId;
    fileInputRef.current?.click();
  }

  async function uploadFile(blockId: string, file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      updateImageBlock(blockId, {
        error: np.errFileType,
        uploading: false,
      });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      updateImageBlock(blockId, {
        error: `${np.errFileSizePrefix}${(file.size / 1024 / 1024).toFixed(1)} MB)`,
        uploading: false,
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    updateImageBlock(blockId, {
      uploading: true,
      error: "",
      preview,
      tempPath: "",
    });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      updateImageBlock(blockId, {
        uploading: false,
        error: np.errLoginRequired,
      });
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    // uploadFile runs from an onChange event, not during render — the
    // purity rule's heuristic flags Math.random/Date.now in any function
    // declared inside the component body.
    // eslint-disable-next-line react-hooks/purity
    const rand = Math.random().toString(36).slice(2, 8);
    // eslint-disable-next-line react-hooks/purity
    const tempPath = `temps/${user.id}_${Date.now()}_${rand}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(tempPath, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      updateImageBlock(blockId, {
        uploading: false,
        error: upErr.message,
      });
      return;
    }

    updateImageBlock(blockId, { uploading: false, tempPath });
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files[0] && activeBlock.current) {
      uploadFile(activeBlock.current, files[0]);
    }
  }

  // ── submit ───────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError(np.errNoTitle);
      return;
    }

    const hasContent = blocks.some(
      (b) =>
        (b.type === "text" && b.content.trim()) ||
        (b.type === "image" && b.tempPath),
    );
    if (!hasContent) {
      setError(np.errNoContent);
      return;
    }

    if (blocks.some((b) => b.type === "image" && (b as ImageBlock).uploading)) {
      setError(np.errImageUploading);
      return;
    }

    setLoading(true);
    try {
      const apiBlocks = blocks
        .filter((b) =>
          b.type === "text"
            ? (b as TextBlock).content.trim()
            : (b as ImageBlock).tempPath,
        )
        .map((b) =>
          b.type === "text"
            ? { type: "text", content: (b as TextBlock).content.trim() }
            : { type: "image", tempPath: (b as ImageBlock).tempPath },
        );

      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          gameId: tag === "game" ? gameId || null : null,
          blocks: apiBlocks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? np.errGeneric);
        return;
      }
      router.push(`/forums/${data.id}`);
    } catch {
      setError(np.errRetry);
    } finally {
      setLoading(false);
    }
  }

  // ── render ───────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#0d0f14",
    border: "1px solid #1e2130",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "6px",
    letterSpacing: "0.04em",
  };

  const categoryOpts = [
    { value: "general", label: np.catGeneral },
    { value: "game", label: np.catGame },
    { value: "report", label: np.catReport },
    ...(tag === "announcement"
      ? [{ value: "announcement" as const, label: np.catAnnouncement }]
      : []),
  ] as const;

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 24px 80px",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/forums"
          style={{
            color: "#475569",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Forums
        </Link>
        <span style={{ color: "#334155" }}>›</span>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
          {np.pageTitle}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "#111318",
            border: "1px solid #1e2130",
            borderRadius: "10px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Category */}
          <div>
            <label style={labelStyle}>{np.categoryLabel}</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {categoryOpts.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTag(opt.value)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: tag === opt.value ? "#6366f1" : "#1e2130",
                    background:
                      tag === opt.value ? "rgba(99,102,241,0.12)" : "#0d0f14",
                    color: tag === opt.value ? "#818cf8" : "#64748b",
                    fontWeight: tag === opt.value ? 700 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game picker */}
          {tag === "game" && (
            <div>
              <label style={labelStyle}>{np.gameLabel}</label>
              <select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">{np.selectGame}</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>{np.titleLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={np.titlePlaceholder}
              maxLength={200}
              style={inputStyle}
            />
          </div>

          {/* Block editor */}
          <div>
            <label style={labelStyle}>{np.contentLabel}</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {blocks.map((block) => (
                <div key={block.id}>
                  {block.type === "text" ? (
                    <TextBlockEditor
                      block={block}
                      onChange={(v) => updateText(block.id, v)}
                      onRemove={() => removeBlock(block.id)}
                      canRemove={blocks.length > 1}
                    />
                  ) : (
                    <ImageBlockEditor
                      block={block as ImageBlock}
                      onUpload={() => triggerUpload(block.id)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  )}
                  <AddBar
                    onText={() =>
                      insertAfter(block.id, {
                        id: uid(),
                        type: "text",
                        content: "",
                      })
                    }
                    onImage={() =>
                      insertAfter(block.id, {
                        id: uid(),
                        type: "image",
                        tempPath: "",
                        preview: "",
                        uploading: false,
                        error: "",
                      })
                    }
                    canImage={canImage}
                  />
                </div>
              ))}
            </div>
            {!canImage && (
              <div
                style={{
                  color: "#374151",
                  fontSize: "11px",
                  marginTop: "2px",
                  textAlign: "center",
                }}
              >
                {np.maxImagesPrefix} {MAX_IMAGES} {np.maxImagesSuffix}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={onFileInput}
            style={{ display: "none" }}
          />

          {error && (
            <div
              style={{
                color: "#f87171",
                fontSize: "13px",
                padding: "10px 14px",
                background: "rgba(248,113,113,0.08)",
                borderRadius: "6px",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <Link
              href="/forums"
              style={{
                padding: "10px 20px",
                borderRadius: "7px",
                background: "#1a1d24",
                color: "#64748b",
                fontSize: "13px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              {np.cancel}
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: "7px",
                background: loading ? "#3730a3" : "#6366f1",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {loading ? np.submitting : np.submitBtn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
