'use client'
import Link from 'next/link'

type Car = {
  id: string
  make: string
  model: string
  year: number | null
}

interface Props {
  cars: Car[]
  gameSlug: string
  brandName: string
  accent?: string
}

export function CarModelsGrid({ cars, gameSlug, brandName, accent = '#60a5fa' }: Props) {
  if (cars.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
        <p style={{ fontSize: '16px', margin: '0 0 8px', color: '#64748b' }}>ยังไม่มีรุ่นรถในระบบ</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
      {cars.map(car => (
        <Link key={car.id} href={`/games/${gameSlug}/${encodeURIComponent(brandName)}/${car.id}`} style={{ textDecoration: 'none' }}>
          <div
            style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = accent + '66'
              el.style.background = '#13161f'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#1e2130'
              el.style.background = '#111318'
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
              {car.year ? `${car.year} ` : ''}{car.model}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
