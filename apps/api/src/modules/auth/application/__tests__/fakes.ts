import { USER_ROLES } from '@kendrick/contracts'
import type { Email } from '../../domain/email.js'
import type { User } from '../../domain/user.js'
import { EmailAlreadyUsedError, InvalidTokenError } from '../errors.js'
import type { IdGenerator } from '../ports/id-generator.js'
import type { PasswordHasher } from '../ports/password-hasher.js'
import type { TokenPayload, TokenService } from '../ports/token-service.js'
import type { UserRepository } from '../ports/user-repository.js'

export class InMemoryUserRepository implements UserRepository {
  private readonly items: User[] = []

  findByEmail(email: Email): Promise<User | null> {
    return Promise.resolve(this.items.find((user) => user.email.equals(email)) ?? null)
  }

  save(user: User): Promise<void> {
    // Simule la contrainte UNIQUE de la base de données
    if (this.items.some((existing) => existing.email.equals(user.email))) {
      return Promise.reject(new EmailAlreadyUsedError())
    }
    this.items.push(user)
    return Promise.resolve()
  }

  count(): number {
    return this.items.length
  }
}

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
