import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { InvalidTokenError } from '../../application/errors.js'
import type { GetCurrentUser } from '../../application/get-current-user.js'
import type { LoginUser } from '../../application/login-user.js'
import type { TokenService } from '../../application/ports/token-service.js'
import type { RegisterUser } from '../../application/register-user.js'
import { createAuthenticator } from './authenticate.js'

export interface AuthRoutesDependencies {
  registerUser: RegisterUser
  loginUser: LoginUser
  getCurrentUser: GetCurrentUser
  tokens: TokenService
}

const registerBody = z.object({
  email: z.string(),
  displayName: z.string(),
  password: z.string(),
})

const loginBody = z.object({
  email: z.string(),
  password: z.string(),
})

function validationError(issues: { path: PropertyKey[]; message: string }[]) {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Requête invalide',
      details: issues.map((issue) => ({
        field: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    },
  }
}

export function registerAuthRoutes(app: FastifyInstance, deps: AuthRoutesDependencies): void {
  const authenticate = createAuthenticator(deps.tokens)

  app.decorateRequest('auth', null)

  app.post('/auth/register', async (request, reply) => {
    const parsed = registerBody.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(validationError(parsed.error.issues))
    }

    const user = await deps.registerUser.execute(parsed.data)
    return reply.status(201).send(user)
  })

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginBody.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(validationError(parsed.error.issues))
    }

    const result = await deps.loginUser.execute(parsed.data)
    return reply.status(200).send(result)
  })

  app.get('/auth/me', { preHandler: authenticate }, async (request) => {
    // authenticate a déjà vérifié le token : request.auth est rempli
    if (!request.auth) {
      throw new InvalidTokenError()
    }
    return deps.getCurrentUser.execute(request.auth.sub)
  })
}
