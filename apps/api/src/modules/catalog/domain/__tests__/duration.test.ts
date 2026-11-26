import { describe, expect, it } from 'vitest'
import { Duration } from '../duration.js'
import { InvalidDurationError } from '../errors.js'

describe('Duration', () => {
  it.each([10, 205, 900])('accepte %i secondes', (seconds) => {
    expect(Duration.create(seconds).seconds).toBe(seconds)
  })

  it.each([9, 901, 0, -5, 120.5, Number.NaN])('refuse %s', (seconds) => {
    expect(() => Duration.create(seconds)).toThrow(InvalidDurationError)
  })
})
