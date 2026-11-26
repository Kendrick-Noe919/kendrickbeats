import type { BeatRepository } from '../application/ports/beat-repository.js'
import type { Beat } from '../domain/beat.js'

/** Dépôt en mémoire : sert aux tests, et à développer avant d'avoir la table PostgreSQL. */
export class InMemoryBeatRepository implements BeatRepository {
  private readonly items = new Map<string, Beat>()

  findById(id: string): Promise<Beat | null> {
    return Promise.resolve(this.items.get(id) ?? null)
  }

  save(beat: Beat): Promise<void> {
    this.items.set(beat.id, beat)
    return Promise.resolve()
  }

  count(): number {
    return this.items.size
  }
}
