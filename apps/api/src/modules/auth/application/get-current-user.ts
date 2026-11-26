import type { UserDto } from '@kendrick/contracts'
import { InvalidTokenError } from './errors.js'
import type { UserRepository } from './ports/user-repository.js'
import { toUserDto } from './user-mapper.js'

export class GetCurrentUser {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.users.findById(userId)

    // Le token est valide, mais le compte n'existe plus (supprimé) :
    // pour le client, ce token ne permet plus rien, donc même réponse qu'un token invalide.
    if (!user) {
      throw new InvalidTokenError()
    }

    return toUserDto(user)
  }
}
