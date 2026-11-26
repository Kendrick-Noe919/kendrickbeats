import { Link, NavLink, Outlet } from 'react-router'

export function RootLayout() {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="header__brand">
          Kendrick <span className="accent">Beats</span>
        </Link>
        <nav className="header__nav">
          <NavLink to="/login" className="header__link">
            Connexion
          </NavLink>
          <NavLink to="/register" className="header__link header__link--cta">
            Inscription
          </NavLink>
        </nav>
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}
