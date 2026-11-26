import { InvalidMediaUrlError } from './errors.js'

const MAX_LENGTH = 2048

/** Adresse d'un fichier (cover, extrait audio) : une URL http(s) complète. */
export class MediaUrl {
  private constructor(public readonly value: string) {}

  static create(raw: string): MediaUrl {
    const trimmed = raw.trim()
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidMediaUrlError()
    }

    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      throw new InvalidMediaUrlError()
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new InvalidMediaUrlError()
    }
    return new MediaUrl(trimmed)
  }

  equals(other: MediaUrl): boolean {
    return this.value === other.value
  }
}
