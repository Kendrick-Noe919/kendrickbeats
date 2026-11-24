import type { User } from '../../domain/user.js'
import type { IdGenerator } from '../ports/id-generator.js'
import type { PasswordHasher } from '../ports/password-hasher.js'
import type { UserRepository } from '../ports/user-repository.js'
import type { TokenPayload, TokenService } from '../ports/token-service.js'

 
export class InMemoryUserRepository implements UserRepository {
  private readonly items: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase()
    return this.items.find((user) => user.email.value === normalized) ?? null
  }

  async save(user: User): Promise<void> {
    this.items.push(user)
  }

  count(): number {
    return this.items.length
  }
}

export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private next = 1

  generate(): string {
    return `user-${this.next++}`
  }
  
}
export class FakeTokenService implements TokenService {
  async sign(payload: TokenPayload): Promise<string> {
    return `token:${payload.sub}:${payload.role}`
  }

  async verify(token: string): Promise<TokenPayload> {
    const [prefix, sub, role] = token.split(':')
    if (prefix !== 'token' || !sub || (role !== 'CUSTOMER' && role !== 'ADMIN')) {
      throw new Error('Token invalide')
    }
    return { sub, role }
  }
}