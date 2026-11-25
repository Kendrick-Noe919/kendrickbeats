import { USER_ROLES } from '@kendrick/contracts'
import { jwtVerify, SignJWT } from 'jose'
import { InvalidTokenError } from '../application/errors.js'
import type { TokenPayload, TokenService } from '../application/ports/token-service.js'

export interface JoseTokenServiceOptions {
  /** Secret HMAC, au moins 32 octets. */
  secret: string
  /** Émetteur du token (claim `iss`), ex. "kendrick-beats-api". */
  issuer: string
  /** Destinataire du token (claim `aud`), ex. "kendrick-beats-web". */
  audience: string
  /** Durée de vie, au format jose (ex. "15m"). */
  expiresIn?: string
}

const MIN_SECRET_BYTES = 32

export class JoseTokenService implements TokenService {
  private readonly key: Uint8Array
  private readonly issuer: string
  private readonly audience: string
  private readonly expiresIn: string

  constructor(options: JoseTokenServiceOptions) {
    this.key = new TextEncoder().encode(options.secret)
    if (this.key.length < MIN_SECRET_BYTES) {
      throw new Error(`Le secret JWT doit contenir au moins ${MIN_SECRET_BYTES} caractères`)
    }
    this.issuer = options.issuer
    this.audience = options.audience
    this.expiresIn = options.expiresIn ?? '15m'
  }

  sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.key)
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.key, {
      algorithms: ['HS256'],
      issuer: this.issuer,
      audience: this.audience,
    }).catch(() => {
      throw new InvalidTokenError()
    })

    const role = USER_ROLES.find((r) => r === payload.role)
    if (!payload.sub || !role) {
      throw new InvalidTokenError()
    }
    return { sub: payload.sub, role }
  }
}
