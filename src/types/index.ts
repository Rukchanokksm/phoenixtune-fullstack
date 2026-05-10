// ===== GAMES =====
export type GameSlug =
    | "forza-horizon-5"
    | "forza-horizon-6"
    | "the-crew-motorfest"
    | "nfs-unbound"
export interface Game {
    id: string
    name: string
    slug: GameSlug
    coverUrl?: string
    isActive: boolean
    tuneCount?: number
    createdAt: string
}

// ===== CARS =====
export type Drivetrain = "FWD" | "RWD" | "AWD"
export type PIClass = "D" | "C" | "B" | "A" | "S1" | "S2" | "X"
export interface Car {
    id: string
    gameId: string
    make: string
    model: string
    year: number
    piClass: PIClass
    drivetrain: Drivetrain
    weightKg: number
    powerHp: number
}

// ===== TUNES =====
export type Discipline =
    | "street"
    | "track"
    | "rally"
    | "offroad"
    | "drift"
    | "drag"
export interface TuneParameters {
    tirePressureF?: number
    tirePressureR?: number
    springRateF?: number
    springRateR?: number
    reboundF?: number
    reboundR?: number
    bumpF?: number
    bumpR?: number
    camberF?: number
    camberR?: number
    toeF?: number
    toeR?: number
    arbF?: number
    arbR?: number
    diffAccel?: number
    diffDecel?: number
    diffFAccel?: number
    diffFDecel?: number
    diffRAccel?: number
    diffRDecel?: number
    diffCenter?: number
    aeroF?: number
    aeroR?: number
    finalDrive?: number
    [key: string]: number | string | undefined
}
export interface Tune {
    id: string
    userId: string
    carId: string
    gameId: string
    discipline: Discipline
    title: string
    description?: string
    parameters: TuneParameters
    isFeatured: boolean
    upvotes: number
    viewCount: number
    shareCode?: string
    gameVersion?: string
    createdAt: string
    updatedAt: string
    user?: UserProfile
    car?: Car
    game?: Game
    comments?: Comment[]
    isSaved?: boolean
    hasUpvoted?: boolean
}

// ===== USERS =====
export type UserRole = "admin" | "user"
export type Gender = "male" | "female" | "unspecified"
export type TitleId =
    | "newcomer"
    | "first_tune"
    | "tuner_10"
    | "tuner_30"
    | "tuner_100"
    | "liked_10"
    | "liked_50"
    | "liked_100"

export const TITLES: Record<
    TitleId,
    { label: string; desc: string; icon: string; color: string }
> = {
    newcomer: {
        label: "มือสตาร์ทใหม่",
        desc: "สมาชิกทั่วไป",
        icon: "🏁",
        color: "#64748b",
    },
    first_tune: {
        label: "ช่างจูนก้าวแรก",
        desc: "แชร์ tune ครั้งแรก",
        icon: "🔧",
        color: "#60a5fa",
    },
    tuner_10: {
        label: "ช่างจูนฝึกหัด",
        desc: "แชร์ tune ครบ 10 ครั้ง",
        icon: "⚙️",
        color: "#4ade80",
    },
    tuner_30: {
        label: "ช่างจูนมืออาชีพ",
        desc: "แชร์ tune ครบ 30 ครั้ง",
        icon: "🛠️",
        color: "#facc15",
    },
    tuner_100: {
        label: "Master Tuner",
        desc: "แชร์ tune ครบ 100 ครั้ง",
        icon: "🏆",
        color: "#f97316",
    },
    liked_10: {
        label: "Tune เข้าตา",
        desc: "ได้รับ upvote รวม 10 ครั้ง",
        icon: "👍",
        color: "#c084fc",
    },
    liked_50: {
        label: "Tune ระดับ TOP",
        desc: "ได้รับ upvote รวม 50 ครั้ง",
        icon: "⭐",
        color: "#f472b6",
    },
    liked_100: {
        label: "ราชาแห่ง Setup",
        desc: "ได้รับ upvote รวม 100 ครั้ง",
        icon: "👑",
        color: "#facc15",
    },
}

export interface UserProfile {
    id: string
    email: string
    username: string
    avatarUrl?: string
    isPremium: boolean
    premiumUntil?: string
    bio?: string
    role: UserRole
    gender: Gender
    country?: string
    birthday?: string
    activeTitle: TitleId
    titlesEarned: TitleId[]
    tuneShareCount: number
    totalUpvotesReceived: number
    tuneCount?: number
    createdAt: string
}

// ===== COMMENTS =====
export interface Comment {
    id: string
    tuneId: string
    userId: string
    body: string
    createdAt: string
    user?: UserProfile
}

// ===== SAVES =====
export interface SavedTune {
    id: string
    userId: string
    tuneId: string
    folderName?: string
    createdAt: string
    tune?: Tune
}

// ===== API RESPONSES =====
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    perPage: number
    hasMore: boolean
}
export interface ApiError {
    message: string
    code?: string
}

// ===== FILTER & SEARCH =====
export interface TuneFilters {
    gameId?: string
    discipline?: Discipline
    piClass?: PIClass
    drivetrain?: Drivetrain
    search?: string
    sortBy?: "newest" | "popular" | "trending"
    page?: number
    perPage?: number
}

// ===== CALCULATOR =====
export interface CalculatorInput {
    gameId: string
    drivetrain: Drivetrain
    piClass: PIClass
    powerHp: number
    weightKg: number
    discipline: Discipline
}
