import type { Email } from '../../domain/email.js'
import type { User } from '../../domain/user.js'

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>

  /**
   * Persiste un nouvel utilisateur.
   * L'implémentation doit garantir l'unicité de l'email (contrainte UNIQUE en base)
   * et lever `EmailAlreadyUsedError` en cas de doublon, y compris lors d'une
   * inscription concurrente.
   */
  save(user: User): Promise<void>
}
