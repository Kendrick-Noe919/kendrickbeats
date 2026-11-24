export const USER_ROLES = ['CUSTOMER', 'ADMIN'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface UserDto {
  id: string
  email: string
  displayName: string
  role: UserRole
}
