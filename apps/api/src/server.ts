import { buildApp } from './app.js'
import { loadConfig } from './config.js'
import { GetCurrentUser } from './modules/auth/application/get-current-user.js'
import { LoginUser } from './modules/auth/application/login-user.js'
import { RegisterUser } from './modules/auth/application/register-user.js'
import { Argon2PasswordHasher } from './modules/auth/infrastructure/argon2-password-hasher.js'
import { InMemoryUserRepository } from './modules/auth/infrastructure/in-memory-user-repository.js'
import { JoseTokenService } from './modules/auth/infrastructure/jose-token-service.js'
import { UuidIdGenerator } from './modules/auth/infrastructure/uuid-id-generator.js'

async function main() {
  const config = loadConfig()

  // Composition root : le seul endroit qui connaît les classes concrètes.
  const users = new InMemoryUserRepository()
  const hasher = new Argon2PasswordHasher()
  const ids = new UuidIdGenerator()
  const tokens = new JoseTokenService({
    secret: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    expiresIn: config.JWT_EXPIRES_IN,
  })

  const app = buildApp(
    {
      registerUser: new RegisterUser(users, hasher, ids),
      loginUser: new LoginUser(users, hasher, tokens),
      getCurrentUser: new GetCurrentUser(users),
      tokens,
    },
    true,
  )

  await app.listen({ port: config.PORT, host: '0.0.0.0' })
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
