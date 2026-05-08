import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CarModelsGrid } from '@/components/game/CarModelsGrid'

const GAME_META: Record<string, { name: string; accent: string }> = {
  'forza-horizon-5': { name: 'Forza Horizon 5', accent: '#60a5fa' },
  'forza-horizon-6': { name: 'Forza Horizon 6', accent: '#c084fc' },
  'nfs-unbound':     { name: 'NFS Unbound',     accent: '#f87171' },
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ gameSlug: string; brand: string }>
}) {
  const { gameSlug, brand } = await params
  const brandName = decodeURIComponent(brand)
  const meta = GAME_META[gameSlug] ?? { name: gameSlug, accent: '#64748b' }

  const supabase = await createClient()

  const { data: game } = await supabase.from('games').select('id').eq('slug', gameSlug).single()
  if (!game) {
    return (
      <div style={{ background: '#0d0f14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <p>ไม่พบเกมนี้</p>
          <Link href="/" style={{ color: meta.accent, textDecoration: 'none' }}>← กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  const { data: cars } = await supabase
    .from('cars')
    .select('id, make, model, year, drivetrain, pi_class')
    .eq('game_id', game.id)
    .eq('make', brandName)
    .order('year', { ascending: false })

  const models = cars ?? []

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e2330', background: '#0f1117' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={`/games/${gameSlug}`} style={{ color: '#64748b', textDecoration: 'none' }}>{meta.name}</Link>
            <span>›</span>
            <span style={{ color: meta.accent }}>{brandName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#f1f5f9' }}>{brandName}</h1>
            <span style={{ fontSize: '13px', color: '#475569', background: '#131620', padding: '4px 10px', borderRadius: '6px', border: '1px solid #1e2330' }}>
              {models.length} รุ่น
            </span>
          </div>
        </div>
      </div>

      {/* Models Grid — Client Component handles hover */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <CarModelsGrid
          cars={models}
          gameSlug={gameSlug}
          brandName={brandName}
          accent={meta.accent}
        />
      </div>
    </div>
  )
}
