import { describe, expect, it } from 'vitest'
import { InvalidGenreError } from '../errors.js'
import { Genre } from '../genre.js'

describe('Genre', () => {
  it('renvoie le nom officiel quel que soit la casse', () => {
    expect(Genre.create('rnb').value).toBe('RnB')
    expect(Genre.create('  BOOM BAP ').value).toBe('Boom Bap')
    expect(Genre.create('Trap').value).toBe('Trap')
  })

  it.each(['', 'techno', 'trapp', 'R&B'])('refuse « %s »', (raw) => {
    expect(() => Genre.create(raw)).toThrow(InvalidGenreError)
  })
})
