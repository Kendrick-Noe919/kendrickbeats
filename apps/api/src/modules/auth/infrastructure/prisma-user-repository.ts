import type { PrismaClient } from '../../../generated/prisma/client.js'
import { EmailAlreadyUsedError } from '../application/errors.js'
import type { UserRepository } from '../application/ports/user-repository.js'
import { Email } from '../domain/email.js'
import { User } from '../domain/user.js'

/** Code d'erreur Prisma : une contrainte d'unicité (UNIQUE) a été violée. */
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002'

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  )
}

interface UserRow {
  id: string
  email: string
  displayName: string
  passwordHash: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
}

function toDomain(row: UserRow): User {
  return User.restore({
    id: row.id,
    email: Email.create(row.email),
    displayName: row.displayName,
    passwordHash: row.passwordHash,
    role: row.role,
    createdAt: row.createdAt,
  })
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } })
    return row ? toDomain(row) : null
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email.value,
          displayName: user.displayName,
          passwordHash: user.passwordHash,
          role: user.role,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyUsedError()
      }
      throw error
    }
  }
}
