import type { LoginRequestDto, UserDto } from '@kendrick/contracts'
import { createContext } from 'react'

/** L'état de la session : trois cas qui s'excluent, chacun avec ses propres données. */
export type Session =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; token: string; user: UserDto }

export interface AuthContextValue {
  session: Session
  login: (input: LoginRequestDto) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
