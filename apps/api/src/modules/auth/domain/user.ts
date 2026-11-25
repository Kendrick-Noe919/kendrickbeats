import type { UserRole } from '@kendrick/contracts'
import type { Email } from './email.js'
import { InvalidDisplayNameError } from './errors.js'

export interface CreateUserProps {
  id: string
  email: Email
  displayName: string
  passwordHash: string
  role?: UserRole
}

export interface RestoreUserProps {
  id: string
  email: Email
  displayName: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly displayName: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}

  /** Crée un nouvel utilisateur (inscription) en appliquant les règles métier. */
  static create(props: CreateUserProps): User {
    const displayName = props.displayName.trim()

    if (displayName.length === 0) {
      throw new InvalidDisplayNameError()
    }

    return new User(
      props.id,
      props.email,
      displayName,
      props.passwordHash,
      props.role ?? 'CUSTOMER',
      new Date(),
    )
  }

  /**
   * Reconstruit un utilisateur déjà persisté (lecture en base).
   * Les données sont supposées valides : aucune règle de création n'est rejouée.
   */
  static restore(props: RestoreUserProps): User {
    return new User(
      props.id,
      props.email,
      props.displayName,
      props.passwordHash,
      props.role,
      props.createdAt,
    )
  }
}
