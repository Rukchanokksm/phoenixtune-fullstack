import Link from 'next/link'
import { TopTunesClient } from '@/components/game/TopTunesClient'
import { BrandsGrid } from '@/components/game/BrandsGrid'

const FH5_BRANDS = [
  { name:'Acura',        country:'🇺🇸' }, { name:'Alfa Romeo',   country:'🇮🇹' },
  { name:'Alpine',       country:'🇫🇷' }, { name:'Ariel',        country:'🇬🇧' },
  { name:'Aston Martin', country:'🇬🇧' }, { name:'Audi',         country:'🇩🇪' },
  { name:'BAC',          country:'🇬🇧' }, { name:'Bentley',      country:'🇬🇧' },
  { name:'BMW',          country:'🇩🇪' }, { name:'Bugatti',      country:'🇫🇷' },
  { name:'Buick',        country:'🇺🇸' }, { name:'Cadillac',     country:'🇺🇸' },
  { name:'Caterham',     country:'🇬🇧' }, { name:'Chevrolet',    country:'🇺🇸' },
  { name:'Citroën',      country:'🇫🇷' }, { name:'Dodge',        country:'🇺🇸' },
  { name:'Ferrari',      country:'🇮🇹' }, { name:'Ford',         country:'🇺🇸' },
  { name:'GMC',          country:'🇺🇸' }, { name:'Honda',        country:'🇯🇵' },
  { name:'HUMMER',       country:'🇺🇸' }, { name:'Hyundai',      country:'🇰🇷' },
  { name:'Infiniti',     country:'🇯🇵' }, { name:'Jaguar',       country:'🇬🇧' },
  { name:'Jeep',         country:'🇺🇸' }, { name:'Koenigsegg',   country:'🇸🇪' },
  { name:'KTM',          country:'🇦🇹' }, { name:'Lamborghini',  country:'🇮🇹' },
  { name:'Land Rover',   country:'🇬🇧' }, { name:'Lexus',        country:'🇯🇵' },
  { name:'Lincoln',      country:'🇺🇸' }, { name:'Lotus',        country:'🇬🇧' },
  { name:'Maserati',     country:'🇮🇹' }, { name:'Mazda',        country:'🇯🇵' },
  { name:'McLaren',      country:'🇬🇧' }, { name:'Mercedes-AMG', country:'🇩🇪' },
  { name:'MINI',         country:'🇬🇧' }, { name:'Mitsubishi',   country:'🇯🇵' },
  { name:'Mosler',       country:'🇺🇸' }, { name:'Nissan',       country:'🇯🇵' },
  { name:'Pagani',       country:'🇮🇹' }, { name:'Peugeot',      country:'🇫🇷' },
  { name:'Plymouth',     country:'🇺🇸' }, { name:'Pontiac',      country:'🇺🇸' },
  { name:'Porsche',      country:'🇩🇪' }, { name:'RAM',          country:'🇺🇸' },
  { name:'Renault',      country:'🇫🇷' }, { name:'Rimac',        country:'🇭🇷' },
  { name:'Rolls-Royce',  country:'🇬🇧' }, { name:'Saleen',       country:'🇺🇸' },
  { name:'Shelby',       country:'🇺🇸' }, { name:'Subaru',       country:'🇯🇵' },
  { name:'Toyota',       country:'🇯🇵' }, { name:'TVR',          country:'🇬🇧' },
  { name:'Volkswagen',   country:'🇩🇪' }, { name:'Volvo',        country:'🇸🇪' },
]

const GAME_META: Record<string, { name:string; subtitle:string; gradient:string; accent:string; available:boolean }> = {
  'forza-horizon-5': { name:'Forza Horizon 5', subtitle:'Mexico Open World · 500+ Cars', gradient:'linear-gradient(135deg,#1e3a5f,#0f2040,#0d0f1e)', accent:'#60a5fa', available:true },
  'forza-horizon-6': { name:'Forza Horizon 6', subtitle:'Coming Soon', gradient:'linear-gradient(135deg,#2a1f3a,#1a0f2a,#0d0f1e)', accent:'#c084fc', available:false },
  'nfs-unbound':     { name:'Need for Speed Unbound', subtitle:'Lakeshore City · Street Racing', gradient:'linear-gradient(135deg,#2a0f0f,#1a0808,#150a0a)', accent:'#f87171', available:true },
}

const PLAYLIST_MOCK = [
  { season:'🍂 Autumn', event:'Horizon Tour — Road Racing',      reward:'2023 Lamborghini Huracán STO', cls:'S1 900' },
  { season:'🍂 Autumn', event:'PR Stunt — Speed Trap: El Gancho',reward:'+5 Super Wheelspins',          cls:'—'      },
  { season:'🍂 Autumn', event:'The Trial — Cross Country',        reward:'Exclusive Horn',               cls:'B 700'  },
  { season:'🌧 Rainy',  event:'Horizon Tour — Drag Racing',       reward:'2020 Koenigsegg Jesko',        cls:'X 999'  },
  { season:'🌧 Rainy',  event:'Showcase Remix — Halo Warthog',    reward:'+3 Wheelspins',                cls:'—'      },
]

interface Props { params: Promise<{ gameSlug: string }> }

export default async function GamePage({ params }: Props) {
  const { gameSlug } = await params
  const meta = GAME_META[gameSlug]

  if (!meta) return (
    <div style={{ textAlign:'center', padding:'120px 24px', color:'#64748b' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎮</div>
      <h2 style={{ color:'#e2e8f0' }}>ไม่พบเกมนี้</h2>
      <Link href="/" style={{ color:'#facc15' }}>← กลับหน้าแรก</Link>
    </div>
  )

  if (!meta.available) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <div style={{ fontSize:'56px' }}>🚧</div>
      <h1 style={{ color:'#e2e8f0', fontSize:'28px', fontWeight:800 }}>{meta.name}</h1>
      <p style={{ color:'#64748b' }}>กำลังเตรียม tune database — เร็วๆ นี้!</p>
      <Link href="/" style={{ padding:'10px 24px', background:'#facc15', color:'#0d0f14', borderRadius:'8px', fontWeight:700, textDecoration:'none' }}>← กลับหน้าแรก</Link>
    </div>
  )

  const isFH5 = gameSlug === 'forza-horizon-5'

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 24px 80px' }}>

      {/* Hero Banner */}
      <div style={{ borderRadius:'16px', background:meta.gradient, padding:'48px 40px', marginBottom:'48px', position:'relative', overflow:'hidden', border:`1px solid ${meta.accent}22` }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:`${meta.accent}0a`, filter:'blur(40px)', pointerEvents:'none' }} />
        <p style={{ color:meta.accent, fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'10px' }}>🎮 PhoenixTune · Game Hub</p>
        <h1 style={{ color:'#fff', fontSize:'clamp(24px,4vw,38px)', fontWeight:900, margin:'0 0 8px', lineHeight:1.1 }}>{meta.name}</h1>
        <p style={{ color:'#64748b', margin:'0 0 28px' }}>{meta.subtitle}</p>
        <Link href={`/tunes?gameSlug=${gameSlug}`} style={{ display:'inline-block', padding:'10px 24px', background:meta.accent, color:'#0d0f14', borderRadius:'8px', fontWeight:700, textDecoration:'none', fontSize:'14px' }}>
          ดู Tune ทั้งหมด →
        </Link>
      </div>

      {/* Section 1 — Top 10 */}
      <section style={{ marginBottom:'56px' }}>
        <Heading emoji="🏆" title="Top 10 Tunes" sub="tune ที่ชุมชนถูกใจมากที่สุด" dot="#facc15" />
        <TopTunesClient gameSlug={gameSlug} />
      </section>

      {/* Section 2 — Tune Lab */}
      <section style={{ marginBottom:'56px' }}>
        <Heading emoji="⚙️" title="Tune Lab" sub="ตั้งค่ารถด้วยตัวเอง — ไม่ต้องเดา" dot="#4ade80" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
          {([
            { icon:'🧮', title:'Auto Calculator',  desc:'กรอก PI Class / น้ำหนัก / แรงม้า แล้วให้ระบบคำนวณ setup ให้เลย', href:'/calculator',           cta:'เปิด Calculator', color:'#facc15' },
            { icon:'✍️', title:'Share Your Tune',  desc:'เอา tune ที่เล่นอยู่มาแชร์ให้ชุมชน รับ upvote และฟีดแบ็ก',        href:'/tunes/new',             cta:'แชร์ Tune',       color:'#60a5fa' },
            { icon:'📋', title:'Tune Templates',   desc:'โครงสร้าง setup สำเร็จรูปแยกตาม discipline — FWD / RWD / AWD',   href:`/tunes?gameSlug=${gameSlug}`, cta:'ดู Templates', color:'#c084fc' },
          ] as const).map(c => (
            <div key={c.title} style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', padding:'28px 24px' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>{c.icon}</div>
              <h3 style={{ color:'#e2e8f0', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>{c.title}</h3>
              <p style={{ color:'#475569', fontSize:'13px', lineHeight:1.6, margin:'0 0 20px' }}>{c.desc}</p>
              <Link href={c.href} style={{ display:'inline-block', padding:'9px 20px', background:c.color, color:'#0d0f14', borderRadius:'8px', fontWeight:700, fontSize:'13px', textDecoration:'none' }}>
                {c.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Car Brands (FH5 only) */}
      {isFH5 && (
        <section style={{ marginBottom:'56px' }}>
          <Heading emoji="🚗" title="แบรนด์รถใน FH5" sub={`${FH5_BRANDS.length} แบรนด์ · กดเพื่อดู tune ของแต่ละแบรนด์`} dot="#fb923c" />
          <BrandsGrid gameSlug={gameSlug} brands={FH5_BRANDS} />
        </section>
      )}

      {/* Section 4 — Festival Playlist */}
      <section>
        <Heading emoji="📅" title="Festival Playlist" sub="seasonal events สัปดาห์นี้ — อัปเดตทุกพฤหัสบดี" dot="#f472b6" />
        <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', background:'#0d1117', borderBottom:'1px solid #1e2130', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
            <span style={{ color:'#94a3b8', fontSize:'13px' }}>Series 40 · Week 2 · อัปเดต: พฤ. 8 พ.ค. 2568</span>
            <span style={{ marginLeft:'auto', fontSize:'11px', color:'#475569', background:'#1e2130', padding:'2px 10px', borderRadius:'20px' }}>Community Sourced</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e2130' }}>
                  {['ฤดู','Event','Class','รางวัล'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'12px 20px', color:'#475569', fontWeight:600, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAYLIST_MOCK.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < PLAYLIST_MOCK.length-1 ? '1px solid #161923' : 'none' }}>
                    <td style={{ padding:'13px 20px', color:'#94a3b8', whiteSpace:'nowrap' }}>{row.season}</td>
                    <td style={{ padding:'13px 20px', color:'#e2e8f0', fontWeight:500 }}>{row.event}</td>
                    <td style={{ padding:'13px 20px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:'4px', background:'#1e2130', color:'#94a3b8', fontSize:'11px', fontWeight:700 }}>{row.cls}</span>
                    </td>
                    <td style={{ padding:'13px 20px', color:'#facc15', fontWeight:600 }}>{row.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'14px 20px', borderTop:'1px solid #1e2130', textAlign:'center' }}>
            <span style={{ color:'#475569', fontSize:'12px' }}>ข้อมูล playlist มาจากชุมชน · </span>
            <Link href="/forums" style={{ color:'#facc15', fontSize:'12px', textDecoration:'none', fontWeight:600 }}>ช่วยอัปเดตใน Forum →</Link>
          </div>
        </div>
      </section>

    </div>
  )
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
