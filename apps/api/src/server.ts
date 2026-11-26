import { buildApp } from './app.js'
import { loadConfig } from './config.js'
import { GetCurrentUser } from './modules/auth/application/get-current-user.js'
import { LoginUser } from './modules/auth/application/login-user.js'
import { RegisterUser } from './modules/auth/application/register-user.js'
import { Argon2PasswordHasher } from './modules/auth/infrastructure/argon2-password-hasher.js'
import { JoseTokenService } from './modules/auth/infrastructure/jose-token-service.js'
import { PrismaUserRepository } from './modules/auth/infrastructure/prisma-user-repository.js'
import { UuidIdGenerator } from './modules/auth/infrastructure/uuid-id-generator.js'
import { createPrismaClient } from './shared/infrastructure/prisma-client.js'

async function main() {
  const config = loadConfig()

  // Composition root : le seul endroit qui connaît les classes concrètes.
  const prisma = createPrismaClient(config.DATABASE_URL)
  const users = new PrismaUserRepository(prisma)
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

  // Arrêt propre (Ctrl+C ou arrêt par Docker) : on termine les requêtes en cours
  // puis on ferme les connexions à la base.
  const shutdown = async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.once('SIGINT', () => void shutdown())
  process.once('SIGTERM', () => void shutdown())

  await app.listen({ port: config.PORT, host: '0.0.0.0' })
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
