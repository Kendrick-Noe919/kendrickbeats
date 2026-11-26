import { InvalidTagsError } from './errors.js'

const MAX_TAGS = 10
const MIN_LENGTH = 2
const MAX_LENGTH = 30
const TAG_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} -]*$/u

export class Tags {
  private constructor(public readonly values: readonly string[]) {}

  /** Normalise (minuscules, « # » retiré, espaces simplifiés) et supprime les doublons. */
  static create(raw: readonly string[]): Tags {
    const normalized = raw.map((tag) =>
      tag.trim().replace(/^#+/, '').replace(/\s+/g, ' ').toLowerCase(),
    )
    const unique = [...new Set(normalized)]

    const isValid = unique.every(
      (tag) => tag.length >= MIN_LENGTH && tag.length <= MAX_LENGTH && TAG_PATTERN.test(tag),
    )
    if (!isValid || unique.length > MAX_TAGS) {
      throw new InvalidTagsError()
    }
    return new Tags(unique)
  }

  has(tag: string): boolean {
    return this.values.includes(tag.trim().replace(/^#+/, '').toLowerCase())
  }
}
