import type { RegisterRequestDto, UserDto } from '@kendrick/contracts'
import { postJson } from '../../shared/api/http'

export function registerUser(input: RegisterRequestDto): Promise<UserDto> {
  return postJson<UserDto>('/auth/register', input)
}
