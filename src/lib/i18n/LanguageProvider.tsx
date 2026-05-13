"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { MESSAGES, DEFAULT_LOCALE, type Locale, type Messages } from "./messages"

interface LanguageContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: Messages
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "lang"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Initial load — read from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "en" || saved === "th") {
        setLocaleState(saved)
        document.documentElement.lang = saved
      }
    } catch {}
  }, [])

  // Cross-tab + cross-component sync
  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === "en" || saved === "th") setLocaleState(saved)
      } catch {}
    }
    window.addEventListener("storage", handler)
    window.addEventListener("lang-change", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("lang-change", handler)
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
      window.dispatchEvent(new Event("lang-change"))
    } catch {}
    setLocaleState(next)
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: MESSAGES[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Fallback during SSR or if provider missing — return defaults
    return { locale: DEFAULT_LOCALE, setLocale: () => {}, t: MESSAGES[DEFAULT_LOCALE] }
  }
  return ctx
}
