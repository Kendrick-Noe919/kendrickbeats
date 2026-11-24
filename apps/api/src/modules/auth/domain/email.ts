// apps/api/src/modules/auth/domain/email.ts

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalized)) {
      throw new Error('Email invalide')
    }

    return new Email(normalized)
  }
}