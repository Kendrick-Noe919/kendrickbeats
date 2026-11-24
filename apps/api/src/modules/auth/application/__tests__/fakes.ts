import type { User } from '../../domain/user.js'
import type { IdGenerator } from '../ports/id-generator.js'
import type { PasswordHasher } from '../ports/password-hasher.js'
import type { UserRepository } from '../ports/user-repository.js'

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