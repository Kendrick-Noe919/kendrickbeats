import { USER_ROLES } from '@kendrick/contracts'
import { jwtVerify, SignJWT } from 'jose'
import { InvalidTokenError } from '../application/errors.js'
import type { TokenPayload, TokenService } from '../application/ports/token-service.js'

export class JoseTokenService implements TokenService {
  private readonly key: Uint8Array

  constructor(
    secret: string,
    private readonly expiresIn: string = '15m',
  ) {
    if (secret.length < 32) {
      throw new Error('Le secret JWT doit contenir au moins 32 caractères')
    }
    this.key = new TextEncoder().encode(secret)
  }

  async sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.key)
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.key, { algorithms: ['HS256'] }).catch(() => {
      throw new InvalidTokenError()
    })

    const role = USER_ROLES.find((r) => r === payload.role)
    if (!payload.sub || !role) {
      throw new InvalidTokenError()
    }
    return { sub: payload.sub, role }
  }
}
