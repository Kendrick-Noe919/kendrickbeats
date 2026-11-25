import { describe, expect, it } from 'vitest'
import { Email } from '../email.js'
import { InvalidDisplayNameError } from '../errors.js'
import { User } from '../user.js'

const email = Email.create('kendrick@mail.com')

describe('User.create', () => {
  it('crée un client par défaut avec un nom nettoyé', () => {
    const user = User.create({ id: 'u1', email, displayName: '  Kendrick  ', passwordHash: 'h' })

    expect(user.displayName).toBe('Kendrick')
    expect(user.role).toBe('CUSTOMER')
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it('refuse un nom affiché vide ou composé d’espaces', () => {
    expect(() => User.create({ id: 'u1', email, displayName: '   ', passwordHash: 'h' })).toThrow(
      InvalidDisplayNameError,
    )
  })
})

describe('User.restore', () => {
  it('conserve les données persistées, dont la date de création', () => {
    const createdAt = new Date('2025-01-01T00:00:00Z')
    const user = User.restore({
      id: 'u1',
      email,
      displayName: 'Kendrick',
      passwordHash: 'h',
      role: 'ADMIN',
      createdAt,
    })

    expect(user.createdAt).toBe(createdAt)
    expect(user.role).toBe('ADMIN')
  })
})
