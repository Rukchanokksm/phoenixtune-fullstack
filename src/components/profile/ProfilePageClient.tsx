'use client'
import Link from 'next/link'
import type { TitleId } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { ProfileCard } from './ProfileCard'
import { TitlesEarnedSection } from './TitlesEarnedSection'

interface TuneItem {
    id: string
    title: string
    discipline: string
    upvotes: number
    view_count: number
    created_at: string
    updated_at: string | null
    car: { make: string; model: string; pi_class: string } | null
}

interface GameGroup {
    gameName: string
    gameSlug: string
    tunes: TuneItem[]
}

interface ProfileData {
    id: string
    username: string
    avatarUrl: string | null
    bio: string | null
    gender: 'male' | 'female' | 'unspecified'
    country: string | null
    birthday: string | null
    role: string
    activeTitle: TitleId
    joinYear: number
}

interface Props {
    profile: ProfileData
    isOwner: boolean
    earned: TitleId[]
    totalTunes: number
    totalUpvotes: number
    totalViews: number
    gameGroups: GameGroup[]
}

const PI_COLORS: Record<string, string> = {
    D: '#a3e635', C: '#facc15', B: '#fb923c',
    A: '#f87171', S1: '#c084fc', S2: '#818cf8', X: '#60a5fa', R: '#e879f9',
}
const DISC_COLORS: Record<string, string> = {
    street: '#c084fc', track: '#60a5fa', drift: '#f472b6',
    rally: '#fb923c', offroad: '#fbbf24', drag: '#f87171',
}

export function ProfilePageClient({
    profile, isOwner, earned,
    totalTunes, totalUpvotes, totalViews, gameGroups,
}: Props) {
    const { t, locale } = useLanguage()
    const pp = t.profilePage
    const dateLocale = locale === 'th' ? 'th-TH' : 'en-US'

    const stats = [
        { label: pp.statTunes,   value: totalTunes,   icon: '🔧', color: '#60a5fa' },
        { label: pp.statUpvotes, value: totalUpvotes, icon: '▲',  color: '#facc15' },
        { label: pp.statViews,   value: totalViews,   icon: '👁', color: '#34d399' },
        { label: pp.statTitles,  value: earned.length, icon: '🏅', color: '#c084fc' },
    ]

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
            <ProfileCard isOwner={isOwner} profile={profile} />

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Per-game tune count */}
            {gameGroups.length > 0 && (
                <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '10px' }}>
                        {pp.tunesByGame}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {gameGroups.map(g => (
                            <div key={g.gameSlug} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                <span style={{ fontSize: '12px' }}>🎮</span>
                                <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>{g.gameName}</span>
                                <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 800 }}>{g.tunes.length}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <TitlesEarnedSection titleIds={earned} />

            {/* All tunes grouped by game */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ margin: 0, color: '#e2e8f0', fontWeight: 700, fontSize: '16px' }}>
                    🔧 {pp.allTunesPrefix} @{profile.username}
                </h2>

                {gameGroups.length === 0 && (
                    <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                        <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 12px' }}>{pp.noTunes}</p>
                        <Link href="/tunes/new" style={{ color: '#facc15', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                            {pp.shareFirstTune}
                        </Link>
                    </div>
                )}

                {gameGroups.map(group => (
                    <div key={group.gameSlug} style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>🎮</span>
                                <span style={{ color: '#facc15', fontWeight: 700, fontSize: '15px' }}>{group.gameName}</span>
                                <span style={{ color: '#475569', fontSize: '12px' }}>({group.tunes.length} tune)</span>
                            </div>
                            <Link href={`/tunes?game=${group.gameSlug}&user=${profile.username}`} style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>
                                {pp.viewAllInGame}
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {group.tunes.map(tune => {
                                const piColor = PI_COLORS[tune.car?.pi_class ?? ''] ?? '#64748b'
                                const isEdited = tune.updated_at &&
                                    new Date(tune.updated_at).getTime() - new Date(tune.created_at).getTime() > 60_000
                                return (
                                    <Link key={tune.id} href={`/tunes/${tune.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '9px', background: '#0d0f14', border: '1px solid #1a1d24', transition: 'border-color 0.15s', cursor: 'pointer' }}>
                                            {tune.car && (
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: piColor, background: piColor + '18', border: `1px solid ${piColor}44`, padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>
                                                    {tune.car.pi_class}
                                                </span>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {tune.title}
                                                </div>
                                                {tune.car && (
                                                    <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                                                        {tune.car.make} {tune.car.model}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, flexShrink: 0, color: DISC_COLORS[tune.discipline] ?? '#64748b' }}>
                                                {tune.discipline}
                                            </span>
                                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                                <span style={{ color: '#facc15', fontSize: '12px' }}>▲ {tune.upvotes}</span>
                                                <span style={{ color: '#475569', fontSize: '12px' }}>👁 {tune.view_count}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: '2px' }}>
                                                <span style={{ color: '#374151', fontSize: '11px' }}>
                                                    {new Date(tune.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </span>
                                                {isEdited && (
                                                    <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600 }}>
                                                        {pp.edited}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
