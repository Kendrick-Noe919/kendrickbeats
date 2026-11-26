import type { Clock } from '../ports/clock.js'
import type { IdGenerator } from '../ports/id-generator.js'
import { ArchiveBeat } from '../archive-beat.js'
import { CreateBeat, type CreateBeatInput } from '../create-beat.js'
import { GetPublishedBeat } from '../get-published-beat.js'
import { PublishBeat } from '../publish-beat.js'
import { InMemoryBeatRepository } from '../../infrastructure/in-memory-beat-repository.js'

export { InMemoryBeatRepository }

export class SequentialIdGenerator implements IdGenerator {
  private next = 1

  generate(): string {
    return `beat-${this.next++}`
  }
}

/** Une horloge qu'on règle et qu'on avance à la main. */
export class FakeClock implements Clock {
  constructor(private current = new Date('2026-11-26T10:00:00Z')) {}

  now(): Date {
    return new Date(this.current)
  }

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds)
  }
}

export function validBeatInput(overrides: Partial<CreateBeatInput> = {}): CreateBeatInput {
  return {
    title: 'Neon Shadows',
    genre: 'trap',
    bpm: 140,
    key: 'Dm',
    durationSeconds: 185,
    tags: ['dark', 'melodic'],
    coverUrl: 'https://cdn.example.com/neon-shadows.jpg',
    previewUrl: 'https://cdn.example.com/neon-shadows-preview.mp3',
    licenses: [
      { type: 'BASIC', price: 10000 },
      { type: 'PREMIUM', price: 20000 },
      { type: 'EXCLUSIVE', price: 150000 },
    ],
    ...overrides,
  }
}

/** Assemble tous les cas d'usage du catalogue sur des faux. */
export function createCatalog() {
  const beats = new InMemoryBeatRepository()
  const clock = new FakeClock()
  const ids = new SequentialIdGenerator()

  return {
    beats,
    clock,
    createBeat: new CreateBeat(beats, ids, clock),
    publishBeat: new PublishBeat(beats, clock),
    archiveBeat: new ArchiveBeat(beats),
    getPublishedBeat: new GetPublishedBeat(beats),
  }
}
