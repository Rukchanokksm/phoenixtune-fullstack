"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/messages";

const OPTIONS: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 10px",
          borderRadius: "7px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#cbd5e1",
          cursor: "pointer",
          fontSize: "12.5px",
          fontWeight: 600,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.04)";
        }}
      >
        <span style={{ fontSize: "14px" }}>{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "#161820",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "4px",
            minWidth: "120px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 100,
          }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLocale(opt.code);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                background:
                  locale === opt.code ? "rgba(250,204,21,0.08)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: locale === opt.code ? "#facc15" : "#cbd5e1",
                fontSize: "13px",
                fontWeight: locale === opt.code ? 700 : 500,
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (locale !== opt.code)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (locale !== opt.code)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
