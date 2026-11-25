import { InvalidEmailError } from './errors.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase()

    if (normalized.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError()
    }

    return new Email(normalized)
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
