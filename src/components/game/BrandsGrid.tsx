'use client'
import Link from 'next/link'

interface Brand { name: string; country: string }

export function BrandsGrid({ gameSlug, brands }: { gameSlug: string; brands: Brand[] }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'8px' }}>
      {brands.map(b => (
        <Link
          key={b.name}
          href={`/tunes?gameSlug=${gameSlug}&brand=${encodeURIComponent(b.name)}`}
          style={{ textDecoration:'none' }}
        >
          <div
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', background:'#111318', border:'1px solid #1e2130', borderRadius:'9px', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='#facc1588'; el.style.background='#13161f' }}
            onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='#1e2130'; el.style.background='#111318' }}
          >
            <span style={{ fontSize:'16px' }}>{b.country}</span>
            <span style={{ color:'#cbd5e1', fontSize:'13px', fontWeight:500 }}>{b.name}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
