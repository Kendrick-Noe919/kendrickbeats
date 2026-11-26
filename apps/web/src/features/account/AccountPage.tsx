import { useAuth } from '../auth/useAuth'

export function AccountPage() {
  const { session } = useAuth()
  if (session.status !== 'authenticated') return null

  const { user } = session
  return (
    <section className="page page--center">
      <p className="kicker">Mon compte</p>
      <h1 className="page__title">{user.displayName}</h1>
      <dl className="details">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Rôle</dt>
        <dd>{user.role}</dd>
      </dl>
    </section>
  )
}
