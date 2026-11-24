import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../errors.js'
import { LoginUser } from '../login-user.js'
import { RegisterUser } from '../register-user.js'
import {
  FakePasswordHasher,
  FakeTokenService,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from './fakes.js'

describe('LoginUser', () => {
  let loginUser: LoginUser

  beforeEach(async () => {
    const users = new InMemoryUserRepository()
    const hasher = new FakePasswordHasher()

    const registerUser = new RegisterUser(users, hasher, new SequentialIdGenerator())
    await registerUser.execute({
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      password: 'motdepasse123',
    })

    loginUser = new LoginUser(users, hasher, new FakeTokenService())
  })

  it('connecte un utilisateur et renvoie un token et son profil', async () => {
    const result = await loginUser.execute({
      email: 'kendrick@mail.com',
      password: 'motdepasse123',
    })

    expect(result.accessToken).toBe('token:user-1:CUSTOMER')
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      role: 'CUSTOMER',
    })
  })

  it('accepte un email saisi avec une autre casse', async () => {
    const result = await loginUser.execute({
      email: '  KENDRICK@mail.com ',
      password: 'motdepasse123',
    })

    expect(result.user.id).toBe('user-1')
  })

  it('refuse un mauvais mot de passe', async () => {
    await expect(
      loginUser.execute({ email: 'kendrick@mail.com', password: 'mauvaismdp' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('refuse un email inconnu avec la même erreur', async () => {
    await expect(
      loginUser.execute({ email: 'inconnu@mail.com', password: 'motdepasse123' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})