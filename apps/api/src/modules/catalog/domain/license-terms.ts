import type { LicenseType } from '@kendrick/contracts'

export type DeliveredFile = 'MP3' | 'WAV' | 'STEMS'

export interface LicenseTerms {
  /** Nom affiché à l'acheteur. */
  readonly name: string
  /** Fichiers livrés après l'achat (STEMS = pistes séparées). */
  readonly files: readonly DeliveredFile[]
  /** Nombre maximal de streams, `null` = illimité. */
  readonly maxStreams: number | null
  /** Nombre maximal de copies distribuées (ventes, téléchargements), `null` = illimité. */
  readonly maxCopies: number | null
  readonly musicVideo: boolean
  readonly paidLivePerformance: boolean
  /** Le beat est retiré du catalogue après la vente. */
  readonly exclusive: boolean
}

/**
 * Les conditions de chaque formule : identiques pour tous les beats, seul le prix change.
 * Valeurs de départ à faire valider avant une vraie vente.
 */
export const LICENSE_TERMS: Readonly<Record<LicenseType, LicenseTerms>> = {
  BASIC: {
    name: 'Basic',
    files: ['MP3'],
    maxStreams: 100_000,
    maxCopies: 2_000,
    musicVideo: false,
    paidLivePerformance: false,
    exclusive: false,
  },
  PREMIUM: {
    name: 'Premium',
    files: ['MP3', 'WAV'],
    maxStreams: 500_000,
    maxCopies: 10_000,
    musicVideo: true,
    paidLivePerformance: true,
    exclusive: false,
  },
  UNLIMITED: {
    name: 'Unlimited',
    files: ['MP3', 'WAV', 'STEMS'],
    maxStreams: null,
    maxCopies: null,
    musicVideo: true,
    paidLivePerformance: true,
    exclusive: false,
  },
  EXCLUSIVE: {
    name: 'Exclusive',
    files: ['MP3', 'WAV', 'STEMS'],
    maxStreams: null,
    maxCopies: null,
    musicVideo: true,
    paidLivePerformance: true,
    exclusive: true,
  },
}
