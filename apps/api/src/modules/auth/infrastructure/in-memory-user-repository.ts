import { EmailAlreadyUsedError } from '../application/errors.js'
import type { UserRepository } from '../application/ports/user-repository.js'
import type { Email } from '../domain/email.js'
import type { User } from '../domain/user.js'

/**
 * Dépôt en mémoire : les utilisateurs disparaissent à l'arrêt du serveur.
 * Utilisé en attendant PostgreSQL, et dans les tests.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly items: User[] = []

  findByEmail(email: Email): Promise<User | null> {
    return Promise.resolve(this.items.find((user) => user.email.equals(email)) ?? null)
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.items.find((user) => user.id === id) ?? null)
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
