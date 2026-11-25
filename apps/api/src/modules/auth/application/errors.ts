export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export class EmailAlreadyUsedError extends Error {
  constructor() {
    super('Cet email est déjà utilisé')
    this.name = 'EmailAlreadyUsedError'
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super(
      `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
    )
    this.name = 'InvalidPasswordError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email ou mot de passe incorrect')
    this.name = 'InvalidCredentialsError'
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('Token invalide')
    this.name = 'InvalidTokenError'
  }
}
