import { BEAT_GENRES, type BeatGenre } from '@kendrick/contracts'
import { InvalidGenreError } from './errors.js'

export class Genre {
  private constructor(public readonly value: BeatGenre) {}

  /** Accepte n'importe quelle casse (« rnb », « RNB ») et renvoie le nom officiel (« RnB »). */
  static create(raw: string): Genre {
    const wanted = raw.trim().toLowerCase()
    const official = BEAT_GENRES.find((genre) => genre.toLowerCase() === wanted)
    if (official === undefined) {
      throw new InvalidGenreError()
    }
    return new Genre(official)
  }

  equals(other: Genre): boolean {
    return this.value === other.value
  }
}
