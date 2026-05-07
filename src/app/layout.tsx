import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserInitializer } from '@/components/providers/UserInitializer'
import { createClient } from '@/lib/supabase/server'
import type { UserProfile, UserRole, Gender, TitleId } from '@/types'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { template: '%s | PhoenixTune', default: 'PhoenixTune — Community Tuning Platform' },
  description: 'Free tune settings สำหรับ Forza, The Crew และ NFS — ตั้งค่าง่าย แชร์ฟรี',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  let profile: UserProfile | null = null
  let savedIds: string[] = []

  if (authUser) {
    const { data: dbProfile } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, is_premium, premium_until, bio, role, gender, country, active_title, titles_earned, tune_share_count, total_upvotes_received, created_at')
      .eq('id', authUser.id)
      .maybeSingle()

    if (dbProfile) {
      profile = {
        id:                   dbProfile.id,
        email:                authUser.email ?? '',
        username:             dbProfile.username,
        avatarUrl:            dbProfile.avatar_url ?? undefined,
        isPremium:            dbProfile.is_premium,
        premiumUntil:         dbProfile.premium_until ?? undefined,
        bio:                  dbProfile.bio ?? undefined,
        role:                 (dbProfile.role as UserRole)   ?? 'user',
        gender:               (dbProfile.gender as Gender)   ?? 'unspecified',
        country:              dbProfile.country ?? undefined,
        activeTitle:          (dbProfile.active_title as TitleId) ?? 'newcomer',
        titlesEarned:         (dbProfile.titles_earned as TitleId[]) ?? ['newcomer'],
        tuneShareCount:       dbProfile.tune_share_count       ?? 0,
        totalUpvotesReceived: dbProfile.total_upvotes_received ?? 0,
        createdAt:            dbProfile.created_at,
      }

      if (dbProfile.is_premium) {
        const { data: saves } = await supabase
          .from('saves')
          .select('tune_id')
          .eq('user_id', authUser.id)
        savedIds = (saves ?? []).map((s: { tune_id: string }) => s.tune_id)
      }
    }
  }

  return (
    <html lang="th" className={geist.variable}>
      <body style={{ margin: 0, background: '#0d0f14', color: '#e2e8f0', fontFamily: 'var(--font-geist), sans-serif' }}>
        <UserInitializer initialUser={profile} initialSavedIds={savedIds} />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
