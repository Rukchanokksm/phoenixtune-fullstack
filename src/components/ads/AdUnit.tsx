'use client'

import { useEffect, useRef } from 'react'

type AdFormat = 'horizontal' | 'rectangle' | 'infeed'

const FORMAT_STYLES: Record<AdFormat, React.CSSProperties> = {
  horizontal: { display: 'block', width: '100%', minHeight: '90px' },
  rectangle:  { display: 'block', width: '300px', minHeight: '250px' },
  infeed:     { display: 'block', width: '100%', minHeight: '100px' },
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

interface Props {
  slot: string
  format?: AdFormat
  style?: React.CSSProperties
}

export function AdUnit({ slot, format = 'horizontal', style }: Props) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!CLIENT || pushed.current) return
    try {
      pushed.current = true
      ;(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ?? []
      ;(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({})
    } catch { /* ignore */ }
  }, [])

  if (!CLIENT) {
    // Dev placeholder — shows layout position without loading AdSense
    return (
      <div style={{
        ...FORMAT_STYLES[format],
        ...style,
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
      </div>
    )
  }

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ ...FORMAT_STYLES[format], ...style }}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
