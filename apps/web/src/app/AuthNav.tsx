import { NavLink } from 'react-router'
import { useAuth } from '../features/auth/useAuth'

export function AuthNav() {
  const { session, logout } = useAuth()

  if (session.status === 'loading') return null

  if (session.status === 'authenticated') {
    return (
      <nav className="header__nav">
        <NavLink to="/account" className="header__link">
          {session.user.displayName}
        </NavLink>
        <button type="button" className="header__link header__button" onClick={logout}>
          Déconnexion
        </button>
      </nav>
    )
  }

  return (
    <nav className="header__nav">
      <NavLink to="/login" className="header__link">
        Connexion
      </NavLink>
      <NavLink to="/register" className="header__link header__link--cta">
        Inscription
      </NavLink>
    </nav>
  )
}
