import { describe, expect, it } from 'vitest'
import { Email } from '../email.js'
import { InvalidEmailError } from '../errors.js'

describe('Email', () => {
  it('normalise la casse et les espaces', () => {
    expect(Email.create('  Kendrick@Mail.COM ').value).toBe('kendrick@mail.com')
  })

  it.each(['', '   ', 'pas-un-email', 'a@b', '@mail.com', 'a b@mail.com', 'a@@mail.com'])(
    'refuse « %s »',
    (raw) => {
      expect(() => Email.create(raw)).toThrow(InvalidEmailError)
    },
  )

  it('refuse un email de plus de 254 caractères', () => {
    const raw = `${'a'.repeat(250)}@mail.com`
    expect(() => Email.create(raw)).toThrow(InvalidEmailError)
  })

  it('compare deux emails par valeur normalisée', () => {
    expect(Email.create('A@mail.com').equals(Email.create('a@MAIL.com'))).toBe(true)
    expect(Email.create('a@mail.com').equals(Email.create('b@mail.com'))).toBe(false)
  })
})
