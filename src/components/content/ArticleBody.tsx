"use client";

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "image"; url: string }
  | { type: "section"; title: string };

export function parseBlocks(raw: string): ContentBlock[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* */
  }
  if (raw.trim()) return [{ type: "text", content: raw }];
  return [];
}

export function extractSections(
  blocks: ContentBlock[],
): { title: string; index: number }[] {
  return blocks
    .map((b, i) => (b.type === "section" ? { title: b.title, index: i } : null))
    .filter(Boolean) as { title: string; index: number }[];
}

export function ArticleBody({ raw }: { raw: string }) {
  const blocks = parseBlocks(raw);
  let sectionCount = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {blocks.map((block, i) => {
        if (block.type === "section") {
          const n = ++sectionCount;
          const anchor = `section-${n}`;
          return (
            <div
              key={i}
              id={anchor}
              style={{
                borderLeft: "3px solid #facc15",
                paddingLeft: "16px",
                marginTop: "12px",
                scrollMarginTop: "80px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "0.01em",
                }}
              >
                {block.title}
              </h2>
            </div>
          );
        }
        if (block.type === "image") {
          return (
            <a
              key={i}
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.url}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "560px",
                  objectFit: "contain",
                  display: "block",
                  background: "#0d0f14",
                }}
              />
            </a>
          );
        }
        return (
          <p
            key={i}
            style={{
              margin: 0,
              color: "#cbd5e1",
              fontSize: "14.5px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
            }}
          >
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
