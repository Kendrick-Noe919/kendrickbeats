import type { Beat } from '../../domain/beat.js'

export interface BeatRepository {
  findById(id: string): Promise<Beat | null>

  /** Enregistre l'état du beat : le crée s'il n'existe pas, le remplace sinon. */
  save(beat: Beat): Promise<void>
}
