export const BEAT_GENRES = [
  'Trap',
  'Drill',
  'Boom Bap',
  'RnB',
  'Afrobeats',
  'Afro Trap',
  'Amapiano',
  'Dancehall',
  'Reggaeton',
  'Cloud Rap',
  'Lo-fi',
  'Pop',
] as const

export type BeatGenre = (typeof BEAT_GENRES)[number]
/** Les formules de licence, de la moins chère à la plus chère. */
export const LICENSE_TYPES = ['BASIC', 'PREMIUM', 'UNLIMITED', 'EXCLUSIVE'] as const

export type LicenseType = (typeof LICENSE_TYPES)[number]

export const BEAT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD'] as const

export type BeatStatus = (typeof BEAT_STATUSES)[number]
/** Une formule de licence telle que l'acheteur la voit : prix et conditions. */
export interface LicenseOfferDto {
  type: LicenseType
  name: string
  /** Prix en francs CFA (entier, pas de centimes). */
  price: number
  currency: 'XAF'
  /** Fichiers livrés : MP3, WAV, STEMS (pistes séparées). */
  files: string[]
  /** `null` = illimité. */
  maxStreams: number | null
  /** `null` = illimité. */
  maxCopies: number | null
  musicVideo: boolean
  paidLivePerformance: boolean
  exclusive: boolean
}

export interface BeatDto {
  id: string
  title: string
  genre: BeatGenre
  bpm: number
  /** Tonalité normalisée : « F#m », « C »… */
  key: string
  durationSeconds: number
  tags: string[]
  coverUrl: string
  previewUrl: string
  status: BeatStatus
  createdAt: string
  publishedAt: string | null
  licenses: LicenseOfferDto[]
}
