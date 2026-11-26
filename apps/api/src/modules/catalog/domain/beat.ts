import type { BeatStatus } from '@kendrick/contracts'
import type { Bpm } from './bpm.js'
import type { Duration } from './duration.js'
import { InvalidBeatTransitionError, InvalidTitleError } from './errors.js'
import type { Genre } from './genre.js'
import type { LicenseOffers } from './license-offers.js'
import type { MediaUrl } from './media-url.js'
import type { MusicalKey } from './musical-key.js'
import type { Tags } from './tags.js'

const TITLE_MAX_LENGTH = 100

export interface CreateBeatProps {
  id: string
  title: string
  genre: Genre
  bpm: Bpm
  musicalKey: MusicalKey
  duration: Duration
  tags: Tags
  coverUrl: MediaUrl
  previewUrl: MediaUrl
  licenses: LicenseOffers
}

export interface RestoreBeatProps extends CreateBeatProps {
  status: BeatStatus
  createdAt: Date
  publishedAt: Date | null
}

export class Beat {
  private constructor(private readonly props: RestoreBeatProps) {}

  /** Crée un nouveau beat : il commence toujours en brouillon. */
  static create(props: CreateBeatProps, now: Date = new Date()): Beat {
    const title = props.title.trim()
    if (title.length === 0 || title.length > TITLE_MAX_LENGTH) {
      throw new InvalidTitleError()
    }
    return new Beat({ ...props, title, status: 'DRAFT', createdAt: now, publishedAt: null })
  }

  /** Reconstruit un beat déjà enregistré, sans rejouer les règles de création. */
  static restore(props: RestoreBeatProps): Beat {
    return new Beat(props)
  }

  get id(): string {
    return this.props.id
  }
  get title(): string {
    return this.props.title
  }
  get genre(): Genre {
    return this.props.genre
  }
  get bpm(): Bpm {
    return this.props.bpm
  }
  get musicalKey(): MusicalKey {
    return this.props.musicalKey
  }
  get duration(): Duration {
    return this.props.duration
  }
  get tags(): Tags {
    return this.props.tags
  }
  get coverUrl(): MediaUrl {
    return this.props.coverUrl
  }
  get previewUrl(): MediaUrl {
    return this.props.previewUrl
  }
  get licenses(): LicenseOffers {
    return this.props.licenses
  }
  get status(): BeatStatus {
    return this.props.status
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get publishedAt(): Date | null {
    return this.props.publishedAt
  }

  /** Visible dans le catalogue public et achetable. */
  get isPublished(): boolean {
    return this.props.status === 'PUBLISHED'
  }

  /** Publie le beat (depuis un brouillon ou une archive). */
  publish(now: Date = new Date()): Beat {
    if (this.props.status !== 'DRAFT' && this.props.status !== 'ARCHIVED') {
      throw new InvalidBeatTransitionError('publier', this.props.status)
    }
    return new Beat({
      ...this.props,
      status: 'PUBLISHED',
      // La date de première publication est conservée si on republie après une archive.
      publishedAt: this.props.publishedAt ?? now,
    })
  }

  /** Retire le beat du catalogue sans le supprimer. */
  archive(): Beat {
    if (this.props.status !== 'PUBLISHED') {
      throw new InvalidBeatTransitionError('archiver', this.props.status)
    }
    return new Beat({ ...this.props, status: 'ARCHIVED' })
  }

  /** Enregistre la vente en exclusivité : le beat quitte définitivement le catalogue. */
  markSoldExclusively(): Beat {
    if (this.props.status !== 'PUBLISHED' || !this.props.licenses.offers('EXCLUSIVE')) {
      throw new InvalidBeatTransitionError('vendre en exclusivité', this.props.status)
    }
    return new Beat({ ...this.props, status: 'SOLD' })
  }
}
