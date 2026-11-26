import type {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto,
} from '@kendrick/contracts'
import { getJson, postJson } from '../../shared/api/http'

export function registerUser(input: RegisterRequestDto): Promise<UserDto> {
  return postJson<UserDto>('/auth/register', input)
}

export function loginUser(input: LoginRequestDto): Promise<AuthResponseDto> {
  return postJson<AuthResponseDto>('/auth/login', input)
}

export function fetchCurrentUser(token: string): Promise<UserDto> {
  return getJson<UserDto>('/auth/me', token)
}
