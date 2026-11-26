import { describe, expect, it } from 'vitest'
import { Bpm } from '../bpm.js'
import { InvalidBpmError } from '../errors.js'

describe('Bpm', () => {
  it.each([40, 93, 140, 300])('accepte %i', (value) => {
    expect(Bpm.create(value).value).toBe(value)
  })

  it.each([39, 301, 0, -120, 140.5, Number.NaN, Number.POSITIVE_INFINITY])('refuse %s', (value) => {
    expect(() => Bpm.create(value)).toThrow(InvalidBpmError)
  })

  it('compare par valeur', () => {
    expect(Bpm.create(140).equals(Bpm.create(140))).toBe(true)
    expect(Bpm.create(140).equals(Bpm.create(141))).toBe(false)
  })
})
