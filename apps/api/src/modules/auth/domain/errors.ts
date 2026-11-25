export class InvalidEmailError extends Error {
  constructor() {
    super('Email invalide')
    this.name = 'InvalidEmailError'
  }
}

export class InvalidDisplayNameError extends Error {
  constructor() {
    super('Nom affiché requis')
    this.name = 'InvalidDisplayNameError'
  }
}
