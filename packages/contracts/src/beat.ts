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
