import type { UserRole } from '@kendrick/contracts'

export interface TokenPayload {
  sub: string
  role: UserRole
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>
  /** Lève `InvalidTokenError` si le token est invalide, expiré ou mal formé. */
  verify(token: string): Promise<TokenPayload>
}
