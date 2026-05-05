'use client'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserRole, Gender, TitleId } from '@/types'

interface Props {
  initialUser:     UserProfile | null
  initialSavedIds: string[]
}

function mapProfile(profile: Record<string, unknown>, email: string): UserProfile {
  return {
    id:                   profile.id as string,
    email,
    username:             profile.username as string,
    avatarUrl:            (profile.avatar_url as string) ?? undefined,
    isPremium:            profile.is_premium as boolean,
    premiumUntil:         (profile.premium_until as string) ?? undefined,
    bio:                  (profile.bio as string) ?? undefined,
    role:                 ((profile.role as UserRole)           ?? 'user'),
    gender:               ((profile.gender as Gender)           ?? 'unspecified'),
    country:              (profile.country as string)            ?? undefined,
    activeTitle:          ((profile.active_title as TitleId)    ?? 'newcomer'),
    titlesEarned:         ((profile.titles_earned as TitleId[]) ?? ['newcomer']),
    tuneShareCount:       (profile.tune_share_count as number)       ?? 0,
    totalUpvotesReceived: (profile.total_upvotes_received as number) ?? 0,
    createdAt:            profile.created_at as string,
  }
}

export function UserInitializer({ initialUser, initialSavedIds = [] }: Props) {
  const setUser      = useUserStore((s) => s.setUser)
  const setSavedIds  = useUserStore((s) => s.setSavedTuneIds)
  const setIsLoading = useUserStore((s) => s.setIsLoading)

  // Hydrate from server on mount
  useEffect(() => {
    setUser(initialUser)
    setSavedIds(initialSavedIds)
    setIsLoading(false)
  }, [])

  // Subscribe to auth state changes (client-side)
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSavedIds([])
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, username, avatar_url, is_premium, premium_until, bio, role, gender, country, active_title, titles_earned, tune_share_count, total_upvotes_received, created_at')
            .eq('id', session!.user.id)
            .single()

          if (profile) {
            setUser(mapProfile(profile as Record<string, unknown>, session!.user.email ?? ''))

            if (profile.is_premium) {
              const { data: saves } = await supabase
                .from('saves').select('tune_id').eq('user_id', session!.user.id)
              setSavedIds((saves ?? []).map((s: { tune_id: string }) => s.tune_id))
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return null
}
