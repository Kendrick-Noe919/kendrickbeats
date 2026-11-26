import { describe, expect, it } from 'vitest'
import { InvalidMusicalKeyError } from '../errors.js'
import { MusicalKey } from '../musical-key.js'

describe('MusicalKey', () => {
  it.each([
    ['Dm', 'Dm'],
    ['C', 'C'],
    ['F#m', 'F#m'],
    ['dm', 'Dm'],
    ['d minor', 'Dm'],
    ['D min', 'Dm'],
    ['C major', 'C'],
    ['Cmaj', 'C'],
    ['F♯m', 'F#m'],
  ])('lit « %s » comme %s', (raw, expected) => {
    expect(MusicalKey.create(raw).value).toBe(expected)
  })

  it.each([
    ['Bb', 'A#'],
    ['Ebm', 'D#m'],
    ['A♭', 'G#'],
    ['Cb', 'B'],
    ['E#', 'F'],
  ])('ramène le bémol « %s » à la note dièse %s', (raw, expected) => {
    expect(MusicalKey.create(raw).value).toBe(expected)
  })

  it('distingue Bb (si bémol majeur) de bm (si mineur)', () => {
    expect(MusicalKey.create('Bb').value).toBe('A#')
    expect(MusicalKey.create('bm').value).toBe('Bm')
    expect(MusicalKey.create('bbm').value).toBe('A#m')
  })

  it('expose la note et le mode', () => {
    const key = MusicalKey.create('F#m')
    expect(key.root).toBe('F#')
    expect(key.mode).toBe('minor')
  })

  it.each(['', 'H', 'Z#m', 'DM', 'Dmm', 'C##', '12'])('refuse « %s »', (raw) => {
    expect(() => MusicalKey.create(raw)).toThrow(InvalidMusicalKeyError)
  })

  it('compare par note et par mode', () => {
    expect(MusicalKey.create('Bb').equals(MusicalKey.create('A#'))).toBe(true)
    expect(MusicalKey.create('C').equals(MusicalKey.create('Cm'))).toBe(false)
  })
})
