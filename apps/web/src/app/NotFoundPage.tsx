import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="page page--center">
      <p className="kicker">Erreur 404</p>
      <h1 className="page__title">Page introuvable</h1>
      <p className="muted">Cette adresse n'existe pas.</p>
      <Link to="/" className="button">
        Retour à l'accueil
      </Link>
    </section>
  )
}
