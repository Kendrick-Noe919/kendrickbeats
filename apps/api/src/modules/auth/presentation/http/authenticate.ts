import type { FastifyRequest } from 'fastify'
import { InvalidTokenError } from '../../application/errors.js'
import type { TokenPayload, TokenService } from '../../application/ports/token-service.js'

declare module 'fastify' {
  interface FastifyRequest {
    auth: TokenPayload | null
  }
}

export function createAuthenticator(tokens: TokenService) {
  return async function authenticate(request: FastifyRequest): Promise<void> {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? []

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new InvalidTokenError()
    }

    request.auth = await tokens.verify(token)
  }
}
