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
