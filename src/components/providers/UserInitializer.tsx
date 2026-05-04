'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

interface Props {
  // Server Component passes the initial profile (may be null if not logged in)
  initialUser: UserProfile | null
  // Also pass initial saved tune IDs if premium user
  initialSavedIds?: string[]
}

/**
 * UserInitializer — runs once on mount to hydrate Zustand userStore
 * from the server-fetched user profile, then subscribes to auth changes.
 *
 * Pattern: Server Component fetches user → passes as prop →
 *          Client Component syncs into Zustand store.
 */
export function UserInitializer({ initialUser, initialSavedIds = [] }: Props) {
  const setUser       = useUserStore((s) => s.setUser)
  const setIsLoading  = useUserStore((s) => s.setIsLoading)
  const setSavedIds   = useUserStore((s) => s.setSavedTuneIds)

  useEffect(() => {
    // Hydrate from server-fetched data immediately (no loading flash)
    setUser(initialUser)
    setSavedIds(initialSavedIds)
    setIsLoading(false)

    // Subscribe to Supabase auth state changes
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          setSavedIds([])
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Fetch fresh profile on auth events
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, username, avatar_url, is_premium, premium_until, bio, created_at')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            // Map DB snake_case → TypeScript camelCase
            setUser({
              id:           profile.id,
              email:        session.user.email ?? '',
              username:     profile.username,
              avatarUrl:    profile.avatar_url ?? undefined,
              isPremium:    profile.is_premium,
              premiumUntil: profile.premium_until ?? undefined,
              bio:          profile.bio ?? undefined,
              createdAt:    profile.created_at,
            })

            // If premium, fetch saved tune IDs
            if (profile.is_premium) {
              const { data: saves } = await supabase
                .from('saves')
                .select('tune_id')
                .eq('user_id', session.user.id)

              setSavedIds((saves ?? []).map((s: { tune_id: string }) => s.tune_id))
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Renders nothing — this is a headless initializer
  return null
}
