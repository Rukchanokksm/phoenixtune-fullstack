'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export function ProfileNotFoundView({ username }: { username: string }) {
    const { t } = useLanguage()
    const pp = t.profilePage
    return (
        <div style={{ textAlign: 'center', padding: '100px 24px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
            <h2 style={{ color: '#e2e8f0' }}>{pp.notFoundPrefix} @{username}</h2>
            <Link href="/" style={{ color: '#facc15', textDecoration: 'none' }}>
                {pp.backHome}
            </Link>
        </div>
    )
}
