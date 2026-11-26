import { Link, Outlet } from 'react-router'
import { AuthNav } from './AuthNav'

export function RootLayout() {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="header__brand">
          Kendrick <span className="accent">Beats</span>
        </Link>
        <AuthNav />
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}
