import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../features/auth/useAuth'

/** Garde de route : n'affiche les pages enfants qu'à un utilisateur connecté. */
export function RequireAuth() {
  const { session } = useAuth()

  if (session.status === 'loading') {
    return (
      <section className="page page--center">
        <p className="muted">Chargement…</p>
      </section>
    )
  }
  if (session.status === 'anonymous') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
