const TOKEN_KEY = 'kendrick-beats.access-token'

// Le stockage du navigateur peut être indisponible (navigation privée, données bloquées) :
// on ne laisse jamais cela faire planter l'application.

export function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function writeToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sans stockage, l'utilisateur reste connecté jusqu'au rechargement de la page.
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Rien à nettoyer.
  }
}
