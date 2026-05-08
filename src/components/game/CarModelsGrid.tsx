'use client'
import Link from 'next/link'

const PI_COLOR: Record<string, string> = {
  D:'#a3e635', C:'#facc15', B:'#fb923c', A:'#f87171', S1:'#c084fc', X:'#60a5fa',
}

type Car = {
  id: string
  make: string
  model: string
  year: number
  drivetrain: string | null
  pi_class: string | null
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
        <p style={{ fontSize: '13px', margin: 0 }}>รัน seed script เพื่อเพิ่มข้อมูลรถ</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
      {cars.map(car => (
        <Link key={car.id} href={`/games/${gameSlug}/${encodeURIComponent(brandName)}/${car.id}`} style={{ textDecoration: 'none' }}>
          <div
            style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9' }}>{car.year}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {car.pi_class && (
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px',
                    background: (PI_COLOR[car.pi_class] ?? '#64748b') + '22',
                    color: PI_COLOR[car.pi_class] ?? '#64748b',
                    border: `1px solid ${(PI_COLOR[car.pi_class] ?? '#64748b')}44` }}>
                    {car.pi_class}
                  </span>
                )}
                {car.drivetrain && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '5px',
                    background: '#1e2330', color: '#94a3b8', border: '1px solid #2a2f3f' }}>
                    {car.drivetrain}
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#cbd5e1' }}>{car.model}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>{car.make}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
