export class EmailAlreadyUsedError extends Error {
  constructor() {
    super('Cet email est déjà utilisé')
    this.name = 'EmailAlreadyUsedError'
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super('Le mot de passe doit contenir au moins 8 caractères')
    this.name = 'InvalidPasswordError'
  }
}