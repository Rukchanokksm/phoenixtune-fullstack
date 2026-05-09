import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TopTunesClient } from '@/components/game/TopTunesClient'
import { BrandsGrid } from '@/components/game/BrandsGrid'
import { AdUnit } from '@/components/ads/AdUnit'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const STORAGE_BASE  = `${SUPABASE_URL}/storage/v1/object/public/image-games`
const COVER_BUCKET  = 'image-games'

const GAME_META: Record<string, { name:string; subtitle:string; gradient:string; accent:string; available:boolean }> = {
  'forza-horizon-5': { name:'Forza Horizon 5', subtitle:'Mexico Open World · 500+ Cars', gradient:'linear-gradient(135deg,#1e3a5f,#0f2040,#0d0f1e)', accent:'#60a5fa', available:true },
  'forza-horizon-6': { name:'Forza Horizon 6', subtitle:'Coming Soon', gradient:'linear-gradient(135deg,#2a1f3a,#1a0f2a,#0d0f1e)', accent:'#c084fc', available:false },
  'nfs-unbound':     { name:'Need for Speed Unbound', subtitle:'Lakeshore City · Street Racing', gradient:'linear-gradient(135deg,#2a0f0f,#1a0808,#150a0a)', accent:'#f87171', available:true },
}

/** List the cover folder for this game slug and return the public URL of the first file found. */
async function getGameCoverUrl(supabase: Awaited<ReturnType<typeof createClient>>, gameSlug: string): Promise<string | null> {
  const prefix = `cover/${gameSlug}/`
  const { data } = await supabase.storage
    .from(COVER_BUCKET)
    .list(prefix, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } })

  const file = data?.find(f => f.id !== null) // skip folder placeholders
  if (!file) return null

  return `${STORAGE_BASE}/${prefix}${file.name}`
}

function Heading({ emoji, title, sub, dot }: { emoji:string; title:string; sub:string; dot:string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'24px' }}>
      <span style={{ fontSize:'26px', lineHeight:1 }}>{emoji}</span>
      <div>
        <h2 style={{ margin:0, color:'#e2e8f0', fontWeight:800, fontSize:'19px' }}>{title}</h2>
        <p style={{ margin:'4px 0 0', color:'#475569', fontSize:'13px' }}>{sub}</p>
      </div>
      <div style={{ marginLeft:'auto', width:'36px', height:'3px', background:dot, borderRadius:'2px', marginTop:'12px', flexShrink:0 }} />
    </div>
  )
}

export default async function GamePage({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params
  const meta = GAME_META[gameSlug]

  if (!meta) {
    return (
      <div style={{ background:'#0d0f14', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎮</div>
          <h1 style={{ color:'#e2e8f0', marginBottom:'8px' }}>ไม่พบเกมนี้</h1>
          <Link href="/" style={{ color:'#facc15', textDecoration:'none' }}>← กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch cover from bucket + game id (both in parallel)
  const [coverUrl, gameRow] = await Promise.all([
    getGameCoverUrl(supabase, gameSlug),
    supabase.from('games').select('id').eq('slug', gameSlug).single().then(r => r.data),
  ])

  if (!meta.available) {
    return (
      <div style={{ background:'#0d0f14', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {coverUrl && (
          <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
            <Image src={coverUrl} alt="" fill style={{ objectFit:'cover', opacity:0.06, filter:'blur(2px)' }} priority />
          </div>
        )}
        <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔜</div>
          <h1 style={{ color:'#e2e8f0', marginBottom:'8px' }}>{meta.name}</h1>
          <p style={{ color:'#475569', marginBottom:'20px' }}>เร็วๆ นี้ — อยู่ระหว่างพัฒนา</p>
          <Link href="/" style={{ color:'#facc15', textDecoration:'none' }}>← กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  // Fetch brands
  let brands: string[] = []
  if (gameRow) {
    const { data: cars } = await supabase
      .from('cars')
      .select('make')
      .eq('game_id', gameRow.id)
      .order('make', { ascending: true })
    if (cars) brands = [...new Set(cars.map(c => c.make))]
  }

  return (
    <div style={{ background:'#0d0f14', minHeight:'100vh', color:'#e2e8f0' }}>

      {/* ─── Hero with cover image background ─── */}
      <div style={{ position:'relative', borderBottom:`1px solid ${meta.accent}22`, overflow:'hidden' }}>

        {/* Cover image — faded behind gradient */}
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={meta.name}
            fill
            style={{ objectFit:'cover', objectPosition:'center 30%', opacity:0.18 }}
            priority
          />
        )}

        {/* Gradient overlay */}
        <div style={{
          position:'absolute', inset:0,
          background: meta.gradient,
          zIndex:1,
          ...(coverUrl ? { opacity:0.82 } : {}),
        }} />

        {/* Hero content */}
        <div style={{ position:'relative', zIndex:2, maxWidth:'1280px', margin:'0 auto', padding:'56px 24px 48px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <Link href="/" style={{ fontSize:'13px', color:'#64748b', textDecoration:'none' }}>Home</Link>
            <span style={{ color:'#334155' }}>›</span>
            <span style={{ fontSize:'13px', color:meta.accent }}>{meta.name}</span>
          </div>

          <div style={{ display:'flex', alignItems:'flex-end', gap:'24px', flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:900, margin:'0 0 8px', color:'#f1f5f9', letterSpacing:'-0.02em' }}>
                {meta.name}
              </h1>
              <p style={{ margin:0, color:'#64748b', fontSize:'15px' }}>{meta.subtitle}</p>
            </div>
            {brands.length > 0 && (
              <div style={{
                marginLeft:'auto', padding:'8px 18px', borderRadius:'10px',
                background:`${meta.accent}18`, border:`1px solid ${meta.accent}33`,
                fontSize:'13px', color:meta.accent, fontWeight:700, whiteSpace:'nowrap',
              }}>
                {brands.length} brands
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'40px 24px', display:'flex', flexDirection:'column', gap:'56px' }}>

        {/* Top Tunes */}
        <section>
          <Heading emoji="🏆" title="Top Tunes" sub="tune ที่ได้รับ upvote สูงสุดในชุมชน" dot={meta.accent} />
          <TopTunesClient gameSlug={gameSlug} />
        </section>

        <AdUnit slot={`game-${gameSlug}-mid`} format="horizontal" />

        {/* Tune Lab CTA */}
        <section>
          <Heading emoji="🧮" title="Tune Lab" sub="คำนวณค่า tune จากสเปครถของคุณ" dot="#facc15" />
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'linear-gradient(135deg,#1a1400,#0d0f14)', border:'1px solid rgba(250,204,21,0.15)', borderRadius:'16px', padding:'40px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'24px' }}>
              <div>
                <h3 style={{ margin:'0 0 8px', fontSize:'20px', fontWeight:800, color:'#f1f5f9' }}>Auto Calculator</h3>
                <p style={{ margin:0, color:'#64748b', fontSize:'14px', maxWidth:'420px', lineHeight:1.6 }}>กรอกค่า Balance, Drivetrain, Weight และ Torque ระบบจะคำนวณให้อัตโนมัติ</p>
              </div>
              <Link href="/calculator" style={{ padding:'13px 28px', borderRadius:'10px', background:'#facc15', color:'#0d0f14', fontWeight:800, fontSize:'15px', textDecoration:'none', whiteSpace:'nowrap' }}>เปิด Calculator →</Link>
            </div>
            <div style={{ background:'linear-gradient(135deg,#0f1a0f,#0d0f14)', border:'1px solid rgba(74,222,128,0.15)', borderRadius:'16px', padding:'40px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'24px' }}>
              <div>
                <h3 style={{ margin:'0 0 8px', fontSize:'20px', fontWeight:800, color:'#f1f5f9' }}>Share Your Tune</h3>
                <p style={{ margin:0, color:'#64748b', fontSize:'14px', maxWidth:'420px', lineHeight:1.6 }}>แบ่งปัน tune setup ของคุณให้กับชุมชน</p>
              </div>
              <Link href="/tunes/new" style={{ padding:'13px 28px', borderRadius:'10px', background:'#4ade80', color:'#0d0f14', fontWeight:800, fontSize:'15px', textDecoration:'none', whiteSpace:'nowrap' }}>แชร์ Tune →</Link>
            </div>
          </div>
        </section>

        {/* Car Brands */}
        {brands.length > 0 && (
          <section>
            <Heading emoji="🚗" title="Car Brands" sub={`ค้นหา tune ตามยี่ห้อรถ — ${brands.length} แบรนด์`} dot="#4ade80" />
            <BrandsGrid gameSlug={gameSlug} brands={brands} accent={meta.accent} />
          </section>
        )}

        <AdUnit slot={`game-${gameSlug}-bottom`} format="horizontal" />

        {/* All Tunes CTA */}
        <section>
          <Heading emoji="📋" title="ดู Tune ทั้งหมด" sub={`รวม tune ทุก discipline สำหรับ ${meta.name}`} dot={meta.accent} />
          <Link href={`/tunes?gameSlug=${gameSlug}`} style={{ textDecoration:'none', display:'block' }}>
            <div style={{
              background: `linear-gradient(135deg,${meta.accent}0d,#0d0f14)`,
              border: `1px solid ${meta.accent}33`,
              borderRadius:'16px', padding:'36px 32px',
              display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px',
            }}>
              <div>
                <h3 style={{ margin:'0 0 8px', fontSize:'20px', fontWeight:800, color:'#f1f5f9' }}>
                  Tune ทั้งหมดของ {meta.name}
                </h3>
                <p style={{ margin:0, color:'#64748b', fontSize:'14px', lineHeight:1.6, maxWidth:'420px' }}>
                  ค้นหา กรอง และเรียงดู tune จากชุมชน — ตาม discipline, class, drivetrain และอื่นๆ
                </p>
              </div>
              <div style={{
                padding:'13px 28px', borderRadius:'10px',
                background: meta.accent, color:'#0d0f14',
                fontWeight:800, fontSize:'15px', whiteSpace:'nowrap', flexShrink:0,
              }}>
                ดู Tune ทั้งหมด →
              </div>
            </div>
          </Link>
        </section>

      </div>
    </div>
  )
}
