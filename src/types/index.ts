// ===== GAMES =====
export type GameSlug = 'forza-horizon-5' | 'forza-horizon-6' | 'the-crew-motorfest' | 'nfs-unbound'
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
export type Drivetrain = 'FWD' | 'RWD' | 'AWD'
export type PIClass = 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X'
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
export type Discipline = 'street' | 'track' | 'rally' | 'offroad' | 'drift' | 'drag'
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
export interface UserProfile {
  id: string
  email: string
  username: string
  avatarUrl?: string
  isPremium: boolean
  premiumUntil?: string
  bio?: string
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
  sortBy?: 'newest' | 'popular' | 'trending'
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
