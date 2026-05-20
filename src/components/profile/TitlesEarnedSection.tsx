"use client";
import { TITLES } from "@/types";
import type { TitleId } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function TitlesEarnedSection({ titleIds }: { titleIds: TitleId[] }) {
  const { t } = useLanguage();
  const tt = t.titles;

  const labelOf: Record<TitleId, string> = {
    newcomer: tt.newcomer,
    first_tune: tt.firstTune,
    tuner_10: tt.tuner10,
    tuner_30: tt.tuner30,
    tuner_100: tt.tuner100,
    liked_10: tt.liked10,
    liked_50: tt.liked50,
    liked_100: tt.liked100,
  };

  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #1e2130",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          color: "#e2e8f0",
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        🏅 {tt.sectionHeader}
      </h2>
      {titleIds.length === 0 ? (
        <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
          {tt.noTitles}
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {titleIds.map((id) => {
            const meta = TITLES[id];
            if (!meta) return null;
            return (
              <span
                key={id}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${meta.color}44`,
                  color: meta.color,
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {meta.icon} {labelOf[id]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
