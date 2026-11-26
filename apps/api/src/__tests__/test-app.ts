import { buildApp } from '../app.js'
import {
  FakePasswordHasher,
  FakeTokenService,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../modules/auth/application/__tests__/fakes.js'
import { GetCurrentUser } from '../modules/auth/application/get-current-user.js'
import { LoginUser } from '../modules/auth/application/login-user.js'
import { RegisterUser } from '../modules/auth/application/register-user.js'

/** Application HTTP complète, branchée sur des faux : rapide et sans réseau. */
export function createTestApp() {
  const users = new InMemoryUserRepository()
  const hasher = new FakePasswordHasher()
  const tokens = new FakeTokenService()

  return buildApp({
    registerUser: new RegisterUser(users, hasher, new SequentialIdGenerator()),
    loginUser: new LoginUser(users, hasher, tokens),
    getCurrentUser: new GetCurrentUser(users),
    tokens,
  })
}
