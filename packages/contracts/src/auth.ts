import type { UserDto } from './user.js'

export interface AuthResponseDto {
  accessToken: string
  user: UserDto
}
