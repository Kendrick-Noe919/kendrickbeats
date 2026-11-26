import type { BeatDto } from '@kendrick/contracts'
import { toBeatDto } from './beat-mapper.js'
import { BeatNotFoundError } from './errors.js'
import type { BeatRepository } from './ports/beat-repository.js'
import type { Clock } from './ports/clock.js'

export class PublishBeat {
  constructor(
    private readonly beats: BeatRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: string): Promise<BeatDto> {
    const beat = await this.beats.findById(id)
    if (beat === null) {
      throw new BeatNotFoundError()
    }

    const published = beat.publish(this.clock.now())
    await this.beats.save(published)
    return toBeatDto(published)
  }
}
