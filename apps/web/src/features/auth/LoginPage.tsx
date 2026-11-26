import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../../shared/api/http'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function submit() {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await login({ email, password })
      await navigate('/account')
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page page--center">
      <h1 className="page__title">Connexion</h1>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
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
            autoComplete="current-password"
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
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p className="muted">
        Pas encore de compte ? <Link to="/register">Inscription</Link>
      </p>
    </section>
  )
}
