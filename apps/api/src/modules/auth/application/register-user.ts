import type { UserDto } from '@kendrick/contracts'
import { Email } from '../domain/email.js'
import { User } from '../domain/user.js'
import {
  EmailAlreadyUsedError,
  InvalidPasswordError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './errors.js'
import type { IdGenerator } from './ports/id-generator.js'
import type { PasswordHasher } from './ports/password-hasher.js'
import type { UserRepository } from './ports/user-repository.js'
import { toUserDto } from './user-mapper.js'

export interface RegisterUserInput {
  email: string
  displayName: string
  password: string
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserDto> {
    if (
      input.password.length < PASSWORD_MIN_LENGTH ||
      input.password.length > PASSWORD_MAX_LENGTH
    ) {
      throw new InvalidPasswordError()
    }

    const email = Email.create(input.email)

    // Vérification anticipée pour un message clair ; l'unicité réelle est
    // garantie par le repository (contrainte UNIQUE) lors du save.
    const existing = await this.users.findByEmail(email)
    if (existing) {
      throw new EmailAlreadyUsedError()
    }

    const user = User.create({
      id: this.ids.generate(),
      email,
      displayName: input.displayName,
      passwordHash: await this.hasher.hash(input.password),
    })

    await this.users.save(user)

    return toUserDto(user)
  }
}
