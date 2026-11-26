import { InvalidDurationError } from './errors.js'

const MIN_SECONDS = 10
const MAX_SECONDS = 900

/** Durée d'un beat, en secondes entières. */
export class Duration {
  private constructor(public readonly seconds: number) {}

  static create(seconds: number): Duration {
    if (!Number.isInteger(seconds) || seconds < MIN_SECONDS || seconds > MAX_SECONDS) {
      throw new InvalidDurationError()
    }
    return new Duration(seconds)
  }

  equals(other: Duration): boolean {
    return this.seconds === other.seconds
  }
}
