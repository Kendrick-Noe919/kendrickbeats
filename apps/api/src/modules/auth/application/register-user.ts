import type { UserDto } from '@kendrick/contracts'
import { User } from '../domain/user.js'
import { EmailAlreadyUsedError, InvalidPasswordError } from './errors.js'
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
    if (input.password.length < 8) {
      throw new InvalidPasswordError()
    }

    const existing = await this.users.findByEmail(input.email)
    if (existing) {
      throw new EmailAlreadyUsedError()
    }

    const user = User.create({
      id: this.ids.generate(),
      email: input.email,
      displayName: input.displayName,
      passwordHash: await this.hasher.hash(input.password),
    })

    await this.users.save(user)

    return toUserDto(user)
  }
}