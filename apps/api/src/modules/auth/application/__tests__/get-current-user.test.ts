import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidTokenError } from '../errors.js'
import { GetCurrentUser } from '../get-current-user.js'
import { RegisterUser } from '../register-user.js'
import { FakePasswordHasher, InMemoryUserRepository, SequentialIdGenerator } from './fakes.js'

describe('GetCurrentUser', () => {
  let getCurrentUser: GetCurrentUser

  beforeEach(async () => {
    const users = new InMemoryUserRepository()
    const registerUser = new RegisterUser(
      users,
      new FakePasswordHasher(),
      new SequentialIdGenerator(),
    )
    await registerUser.execute({
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      password: 'motdepasse123',
    })
    getCurrentUser = new GetCurrentUser(users)
  })

  it('renvoie le profil de l’utilisateur sans mot de passe', async () => {
    expect(await getCurrentUser.execute('user-1')).toEqual({
      id: 'user-1',
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      role: 'CUSTOMER',
    })
  })

  it('refuse un identifiant inconnu', async () => {
    await expect(getCurrentUser.execute('user-99')).rejects.toThrow(InvalidTokenError)
  })
})
