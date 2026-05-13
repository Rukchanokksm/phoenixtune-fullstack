import type { Metadata } from "next"
import { Geist, Kanit, Michroma, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { UserInitializer } from "@/components/providers/UserInitializer"
import { LanguageProvider } from "@/lib/i18n/LanguageProvider"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile, UserRole, Gender, TitleId } from "@/types"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

const kanit = Kanit({
    subsets: ["latin", "thai"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-kanit",
})

const michroma = Michroma({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-michroma",
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
})

export const metadata: Metadata = {
    title: {
        template: "%s | Tunix",
        default: "Tunix — Community Tuning Platform",
    },
    description:
        "Free tune settings สำหรับ Forza Horizon, The Crew และ NFS — ตั้งค่าง่าย แชร์ฟรี",
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    let profile: UserProfile | null = null
    let savedIds: string[] = []

    if (authUser) {
        const { data: dbProfile } = await supabase
            .from("user_profiles")
            .select(
                "id, username, avatar_url, is_premium, premium_until, bio, role, gender, country, birthday, active_title, titles_earned, tune_share_count, total_upvotes_received, created_at",
            )
            .eq("id", authUser.id)
            .maybeSingle()

        if (dbProfile) {
            profile = {
                id: dbProfile.id,
                email: authUser.email ?? "",
                username: dbProfile.username,
                avatarUrl: dbProfile.avatar_url ?? undefined,
                isPremium: dbProfile.is_premium,
                premiumUntil: dbProfile.premium_until ?? undefined,
                bio: dbProfile.bio ?? undefined,
                role: (dbProfile.role as UserRole) ?? "user",
                gender: (dbProfile.gender as Gender) ?? "unspecified",
                country: dbProfile.country ?? undefined,
                birthday: dbProfile.birthday ?? undefined,
                activeTitle: (dbProfile.active_title as TitleId) ?? "newcomer",
                titlesEarned: (dbProfile.titles_earned as TitleId[]) ?? [
                    "newcomer",
                ],
                tuneShareCount: dbProfile.tune_share_count ?? 0,
                totalUpvotesReceived: dbProfile.total_upvotes_received ?? 0,
                createdAt: dbProfile.created_at,
            }

            if (dbProfile.is_premium) {
                const { data: saves } = await supabase
                    .from("saves")
                    .select("tune_id")
                    .eq("user_id", authUser.id)
                savedIds = (saves ?? []).map(
                    (s: { tune_id: string }) => s.tune_id,
                )
            }
        }
    }

    const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

    return (
        <html
            lang="en"
            className={`${geist.variable} ${kanit.variable} ${michroma.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <head>
                {adsenseClient && (
                    <script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
                        crossOrigin="anonymous"
                    />
                )}
            </head>
            <body
                style={{
                    margin: 0,
                    background: "#0d0f14",
                    color: "#e2e8f0",
                    fontFamily: "var(--font-kanit), var(--font-geist), sans-serif",
                }}
            >
                <LanguageProvider>
                    <UserInitializer
                        initialUser={profile}
                        initialSavedIds={savedIds}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "100vh",
                        }}
                    >
                        <Navbar />
                        <main style={{ flex: 1 }}>{children}</main>
                        <Footer />
                    </div>
                </LanguageProvider>
            </body>
        </html>
    )
}
