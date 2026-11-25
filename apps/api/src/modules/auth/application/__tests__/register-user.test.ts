import { beforeEach, describe, expect, it } from 'vitest'
import { EmailAlreadyUsedError, InvalidPasswordError } from '../errors.js'
import { RegisterUser } from '../register-user.js'
import { FakePasswordHasher, InMemoryUserRepository, SequentialIdGenerator } from './fakes.js'

describe('RegisterUser', () => {
  let users: InMemoryUserRepository
  let registerUser: RegisterUser

  beforeEach(() => {
    users = new InMemoryUserRepository()
    registerUser = new RegisterUser(users, new FakePasswordHasher(), new SequentialIdGenerator())
  })

  it('inscrit un utilisateur et renvoie un DTO sans mot de passe', async () => {
    const result = await registerUser.execute({
      email: 'Kendrick@Mail.com',
      displayName: 'Kendrick',
      password: 'motdepasse123',
    })

    expect(result).toEqual({
      id: 'user-1',
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      role: 'CUSTOMER',
    })
    expect(users.count()).toBe(1)
  })

  it('stocke le mot de passe haché, jamais en clair', async () => {
    await registerUser.execute({
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      password: 'motdepasse123',
    })

    const stored = await users.findByEmail('kendrick@mail.com')
    expect(stored?.passwordHash).toBe('hashed:motdepasse123')
  })

  it('refuse un email déjà utilisé, même avec une casse différente', async () => {
    await registerUser.execute({
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      password: 'motdepasse123',
    })

    await expect(
      registerUser.execute({
        email: 'KENDRICK@mail.com',
        displayName: 'Autre',
        password: 'motdepasse123',
      }),
    ).rejects.toThrow(EmailAlreadyUsedError)
    expect(users.count()).toBe(1)
  })

  it('refuse un mot de passe trop court', async () => {
    await expect(
      registerUser.execute({
        email: 'kendrick@mail.com',
        displayName: 'Kendrick',
        password: '1234567',
      }),
    ).rejects.toThrow(InvalidPasswordError)
    expect(users.count()).toBe(0)
  })

  it('refuse un email invalide sans rien enregistrer', async () => {
    await expect(
      registerUser.execute({
        email: 'pas-un-email',
        displayName: 'Kendrick',
        password: 'motdepasse123',
      }),
    ).rejects.toThrow('Email invalide')
    expect(users.count()).toBe(0)
  })
})
