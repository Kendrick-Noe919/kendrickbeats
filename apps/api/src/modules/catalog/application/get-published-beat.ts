import type { BeatDto } from '@kendrick/contracts'
import { toBeatDto } from './beat-mapper.js'
import { BeatNotFoundError } from './errors.js'
import type { BeatRepository } from './ports/beat-repository.js'

/** Lecture publique d'un beat : seuls les beats publiés sont visibles. */
export class GetPublishedBeat {
  constructor(private readonly beats: BeatRepository) {}

  async execute(id: string): Promise<BeatDto> {
    const beat = await this.beats.findById(id)
    // Un brouillon ou un beat retiré ne doit pas se distinguer d'un beat qui n'existe pas.
    if (beat === null || !beat.isPublished) {
      throw new BeatNotFoundError()
    }
    return toBeatDto(beat)
  }
}
