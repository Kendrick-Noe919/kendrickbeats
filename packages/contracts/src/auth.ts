import type { UserDto } from './user.js'

export interface RegisterRequestDto {
  email: string
  displayName: string
  password: string
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  accessToken: string
  user: UserDto
}
