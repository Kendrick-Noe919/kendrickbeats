import type { BeatDto, LicenseType } from '@kendrick/contracts'
import { Beat } from '../domain/beat.js'
import { Bpm } from '../domain/bpm.js'
import { Duration } from '../domain/duration.js'
import { Genre } from '../domain/genre.js'
import { LicenseOffers } from '../domain/license-offers.js'
import { MediaUrl } from '../domain/media-url.js'
import { Money } from '../domain/money.js'
import { MusicalKey } from '../domain/musical-key.js'
import { Tags } from '../domain/tags.js'
import { toBeatDto } from './beat-mapper.js'
import type { BeatRepository } from './ports/beat-repository.js'
import type { Clock } from './ports/clock.js'
import type { IdGenerator } from './ports/id-generator.js'

export interface CreateBeatInput {
  title: string
  genre: string
  bpm: number
  key: string
  durationSeconds: number
  tags: string[]
  coverUrl: string
  previewUrl: string
  licenses: { type: LicenseType; price: number }[]
}

export class CreateBeat {
  constructor(
    private readonly beats: BeatRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateBeatInput): Promise<BeatDto> {
    // Chaque valeur brute est transformée en objet de valeur : si une règle est violée,
    // l'erreur métier correspondante est levée et rien n'est enregistré.
    const beat = Beat.create(
      {
        id: this.ids.generate(),
        title: input.title,
        genre: Genre.create(input.genre),
        bpm: Bpm.create(input.bpm),
        musicalKey: MusicalKey.create(input.key),
        duration: Duration.create(input.durationSeconds),
        tags: Tags.create(input.tags),
        coverUrl: MediaUrl.create(input.coverUrl),
        previewUrl: MediaUrl.create(input.previewUrl),
        licenses: LicenseOffers.create(
          input.licenses.map((offer) => ({ type: offer.type, price: Money.create(offer.price) })),
        ),
      },
      this.clock.now(),
    )

    await this.beats.save(beat)
    return toBeatDto(beat)
  }
}
