'use client'

import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { resolveSlotId } from '@/lib/adsense'

type AdFormat = 'horizontal' | 'rectangle' | 'infeed'

const FORMAT_STYLES: Record<AdFormat, React.CSSProperties> = {
  horizontal: { display: 'block', width: '100%', minHeight: '90px' },
  rectangle:  { display: 'block', width: '300px', minHeight: '250px' },
  infeed:     { display: 'block', width: '100%', minHeight: '100px' },
}

const CLIENT    = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
const COOLDOWN  = 60 * 60 * 1000 // 1 hour in ms
const STORE_KEY = (slot: string) => `ad_dismissed_${slot}`

interface Props {
  slot: string
  format?: AdFormat
  style?: React.CSSProperties
}

export function AdUnit({ slot, format = 'horizontal', style }: Props) {
  const user      = useUserStore(s => s.user)
  const ref       = useRef<HTMLModElement>(null)
  const pushed    = useRef(false)
  const [dismissed, setDismissed] = useState(false)

  const isAdmin = user?.role === 'admin'

  // Resolve the human-readable slot key to a real AdSense numeric slot ID.
  // If the map entry is empty, we treat the slot as not-yet-configured and
  // render the dev placeholder instead of an empty real ad.
  const slotId = resolveSlotId(slot)
  const isConfigured = Boolean(CLIENT && slotId)

  // Check localStorage on mount to restore dismissal state
  useEffect(() => {
    const ts = localStorage.getItem(STORE_KEY(slot))
    if (ts && Date.now() - Number(ts) < COOLDOWN) {
      setDismissed(true)
    }
  }, [slot])

  // Push AdSense only when visible AND properly configured
  useEffect(() => {
    if (isAdmin || dismissed || !isConfigured || pushed.current) return
    try {
      pushed.current = true
      ;(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ?? []
      ;(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({})
    } catch { /* ignore */ }
  }, [isAdmin, dismissed, isConfigured])

  function dismiss() {
    localStorage.setItem(STORE_KEY(slot), String(Date.now()))
    setDismissed(true)
  }

  if (isAdmin || dismissed) return null

  const wrapStyle: React.CSSProperties = {
    position: 'relative',
    ...FORMAT_STYLES[format],
    ...style,
  }

  const closeBtn: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    zIndex: 10,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    fontSize: '10px',
    lineHeight: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  if (!isConfigured) {
    return (
      <div style={{
        ...wrapStyle,
        background: 'repeating-linear-gradient(45deg, #13151c, #13151c 10px, #161820 10px, #161820 20px)',
        border: '1px dashed #1e2130',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '11px',
        letterSpacing: '0.08em',
        userSelect: 'none',
      }}>
        AD · {format}
        <button onClick={dismiss} style={closeBtn} title="Close ad">✕</button>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <button onClick={dismiss} style={closeBtn} title="Close ad">✕</button>
    </div>
  )
}
