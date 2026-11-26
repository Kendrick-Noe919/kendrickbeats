import { InvalidMusicalKeyError } from './errors.js'

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'
export type KeyMode = 'major' | 'minor'

/** Les bémols (et notes enharmoniques) sont ramenés à la note « dièse » équivalente. */
const ENHARMONIC: Record<string, NoteName> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
  Fb: 'E',
  'E#': 'F',
  'B#': 'C',
}

const NOTES: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const KEY_PATTERN = /^([A-Ga-g])([#b♯♭]?)(minor|major|min|maj|m|M)?$/

export class MusicalKey {
  private constructor(
    public readonly root: NoteName,
    public readonly mode: KeyMode,
  ) {}

  /** Texte canonique : « F#m » (mineur) ou « C » (majeur). */
  get value(): string {
    return this.mode === 'minor' ? `${this.root}m` : this.root
  }

  /** Accepte « Dm », « d minor », « Bb », « F♯m »… et normalise. */
  static create(raw: string): MusicalKey {
    const match = KEY_PATTERN.exec(raw.trim().replace(/\s+/g, ''))
    if (match === null) {
      throw new InvalidMusicalKeyError()
    }

    const [, letter = '', accidental = '', suffix = ''] = match
    // « M » majuscule est ambigu selon les habitudes (majeur ou mineur) : on le refuse.
    if (suffix === 'M') {
      throw new InvalidMusicalKeyError()
    }

    const sign = accidental === '♯' ? '#' : accidental === '♭' ? 'b' : accidental
    const written = `${letter.toUpperCase()}${sign}`
    const root = ENHARMONIC[written] ?? written
    if (!NOTES.includes(root)) {
      throw new InvalidMusicalKeyError()
    }

    const isMinor = suffix === 'm' || suffix === 'min' || suffix === 'minor'
    return new MusicalKey(root as NoteName, isMinor ? 'minor' : 'major')
  }

  equals(other: MusicalKey): boolean {
    return this.root === other.root && this.mode === other.mode
  }
}
