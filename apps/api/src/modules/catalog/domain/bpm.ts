import { InvalidBpmError } from './errors.js'

const MIN_BPM = 40
const MAX_BPM = 300

export class Bpm {
  private constructor(public readonly value: number) {}

  static create(raw: number): Bpm {
    if (!Number.isInteger(raw) || raw < MIN_BPM || raw > MAX_BPM) {
      throw new InvalidBpmError()
    }
    return new Bpm(raw)
  }

  equals(other: Bpm): boolean {
    return this.value === other.value
  }
}
