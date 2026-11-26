import type { BeatDto } from '@kendrick/contracts'
import { toBeatDto } from './beat-mapper.js'
import { BeatNotFoundError } from './errors.js'
import type { BeatRepository } from './ports/beat-repository.js'

export class ArchiveBeat {
  constructor(private readonly beats: BeatRepository) {}

  async execute(id: string): Promise<BeatDto> {
    const beat = await this.beats.findById(id)
    if (beat === null) {
      throw new BeatNotFoundError()
    }

    const archived = beat.archive()
    await this.beats.save(archived)
    return toBeatDto(archived)
  }
}
