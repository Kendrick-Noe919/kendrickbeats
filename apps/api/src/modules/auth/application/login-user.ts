import type { AuthResponseDto } from '@kendrick/contracts'
import { Email } from '../domain/email.js'
import { InvalidEmailError } from '../domain/errors.js'
import { InvalidCredentialsError, PASSWORD_MAX_LENGTH } from './errors.js'
import type { PasswordHasher } from './ports/password-hasher.js'
import type { TokenService } from './ports/token-service.js'
import type { UserRepository } from './ports/user-repository.js'
import { toUserDto } from './user-mapper.js'

export interface LoginUserInput {
  email: string
  password: string
}

export class LoginUser {
  /**
   * Hash factice, calculé une seule fois, utilisé quand l'email est inconnu :
   * la réponse prend alors le même temps que pour un compte existant, ce qui
   * empêche de deviner les emails inscrits en mesurant le temps de réponse.
   */
  private dummyHash: Promise<string> | undefined

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResponseDto> {
    if (input.password.length > PASSWORD_MAX_LENGTH) {
      throw new InvalidCredentialsError()
    }

    const email = this.parseEmail(input.email)
    const user = email ? await this.users.findByEmail(email) : null

    const hashToCheck = user?.passwordHash ?? (await this.getDummyHash())
    const passwordMatches = await this.hasher.verify(input.password, hashToCheck)

    if (!user || !passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokens.sign({ sub: user.id, role: user.role })

    return { accessToken, user: toUserDto(user) }
  }

  private parseEmail(raw: string): Email | null {
    try {
      return Email.create(raw)
    } catch (error) {
      if (error instanceof InvalidEmailError) return null
      throw error
    }
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('dummy-password-for-timing-safety')
    return this.dummyHash
  }
}
