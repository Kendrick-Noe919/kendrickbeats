import { USER_ROLES } from '@kendrick/contracts'
import { InvalidTokenError } from '../errors.js'
import type { IdGenerator } from '../ports/id-generator.js'
import type { PasswordHasher } from '../ports/password-hasher.js'
import type { TokenPayload, TokenService } from '../ports/token-service.js'

export { InMemoryUserRepository } from '../../infrastructure/in-memory-user-repository.js'

export class FakePasswordHasher implements PasswordHasher {
  readonly verifiedHashes: string[] = []

  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`)
  }

  verify(plain: string, hash: string): Promise<boolean> {
    this.verifiedHashes.push(hash)
    return Promise.resolve(hash === `hashed:${plain}`)
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private next = 1

  generate(): string {
    return `user-${this.next++}`
  }
}

export class FakeTokenService implements TokenService {
  sign(payload: TokenPayload): Promise<string> {
    return Promise.resolve(`token:${payload.sub}:${payload.role}`)
  }

  verify(token: string): Promise<TokenPayload> {
    const [prefix, sub, rawRole] = token.split(':')
    const role = USER_ROLES.find((r) => r === rawRole)
    if (prefix !== 'token' || !sub || !role) {
      return Promise.reject(new InvalidTokenError())
    }
    return Promise.resolve({ sub, role })
  }
}
