import type { AuthResponseDto } from '@kendrick/contracts'
import { InvalidCredentialsError } from './errors.js'
import type { PasswordHasher } from './ports/password-hasher.js'
import type { TokenService } from './ports/token-service.js'
import type { UserRepository } from './ports/user-repository.js'
import { toUserDto } from './user-mapper.js'

export interface LoginUserInput {
  email: string
  password: string
}

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.hasher.verify(input.password, user.passwordHash)
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokens.sign({ sub: user.id, role: user.role })

    return { accessToken, user: toUserDto(user) }
  }
}