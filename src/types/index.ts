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
export type PIClass = "D" | "C" | "B" | "A" | "S1" | "S2" | "X" | "R"
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

export const TITLES: Record<TitleId, { icon: string; color: string }> = {
    newcomer: { icon: "🏁", color: "#64748b" },
    first_tune: { icon: "🔧", color: "#60a5fa" },
    tuner_10: { icon: "⚙️", color: "#4ade80" },
    tuner_30: { icon: "🛠️", color: "#facc15" },
    tuner_100: { icon: "🏆", color: "#f97316" },
    liked_10: { icon: "👍", color: "#c084fc" },
    liked_50: { icon: "⭐", color: "#f472b6" },
    liked_100: { icon: "👑", color: "#facc15" },
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
