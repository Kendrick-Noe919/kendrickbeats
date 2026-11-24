import type { UserRole } from '@kendrick/contracts'
import { Email } from './email.js'

export interface CreateUserProps {
  id: string
  email: string
  displayName: string
  passwordHash: string
  role?: UserRole
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

  static create(props: CreateUserProps): User {
    const displayName = props.displayName.trim()

    if (displayName.length === 0) {
      throw new Error('Nom affiché requis')
    }

    return new User(
      props.id,
      Email.create(props.email),
      displayName,
      props.passwordHash,
      props.role ?? 'CUSTOMER',
      new Date(),
    )
  }
}