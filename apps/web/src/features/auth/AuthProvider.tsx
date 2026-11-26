import type { LoginRequestDto } from '@kendrick/contracts'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError } from '../../shared/api/http'
import { fetchCurrentUser, loginUser } from './api'
import { AuthContext, type AuthContextValue, type Session } from './auth-context'
import { clearToken, readToken, writeToken } from './token-storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Jeton laissé par une visite précédente : on le lit une seule fois, au démarrage.
  const [savedToken] = useState(readToken)
  const [session, setSession] = useState<Session>(
    savedToken ? { status: 'loading' } : { status: 'anonymous' },
  )

  useEffect(() => {
    if (!savedToken) return

    let isCancelled = false
    void fetchCurrentUser(savedToken)
      .then((user) => {
        if (!isCancelled) setSession({ status: 'authenticated', token: savedToken, user })
      })
      .catch((error: unknown) => {
        // Jeton refusé (expiré, falsifié) : on l'oublie. Panne réseau : on le garde pour réessayer.
        if (error instanceof ApiError && error.status === 401) clearToken()
        if (!isCancelled) setSession({ status: 'anonymous' })
      })

    return () => {
      isCancelled = true
    }
  }, [savedToken])

  const login = useCallback(async (input: LoginRequestDto) => {
    const { accessToken, user } = await loginUser(input)
    writeToken(accessToken)
    setSession({ status: 'authenticated', token: accessToken, user })
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setSession({ status: 'anonymous' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, login, logout }),
    [session, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
