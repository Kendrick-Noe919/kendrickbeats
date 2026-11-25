import type { UserDto } from '@kendrick/contracts'
import type { User } from '../domain/user.js'

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email.value,
    displayName: user.displayName,
    role: user.role,
  }
}
