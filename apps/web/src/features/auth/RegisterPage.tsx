import { useState } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../shared/api/http'
import { registerUser } from './api'

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)

  async function submit() {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await registerUser({ displayName, email, password })
      setIsDone(true)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <section className="page page--center">
        <h1 className="page__title">Compte créé</h1>
        <p className="muted">Bienvenue, {displayName}. Tu peux maintenant te connecter.</p>
        <Link to="/login" className="button">
          Aller à la connexion
        </Link>
      </section>
    )
  }

  return (
    <section className="page page--center">
      <h1 className="page__title">Inscription</h1>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="field">
          <label htmlFor="displayName">Nom affiché</label>
          <input
            id="displayName"
            className="field__input"
            type="text"
            autoComplete="nickname"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="field__input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            className="field__input"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {errorMessage && (
          <p className="form__error" role="alert">
            {errorMessage}
          </p>
        )}
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
      <p className="muted">
        Déjà un compte ? <Link to="/login">Connexion</Link>
      </p>
    </section>
  )
}
