/** Famille des erreurs de validation du catalogue : la couche HTTP les traduit toutes en 400. */
export class CatalogValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class InvalidBpmError extends CatalogValidationError {
  constructor() {
    super('BPM invalide : un nombre entier entre 40 et 300')
  }
}

export class InvalidDurationError extends CatalogValidationError {
  constructor() {
    super('Durée invalide : un nombre entier de secondes entre 10 et 900')
  }
}

export class InvalidGenreError extends CatalogValidationError {
  constructor() {
    super('Genre inconnu')
  }
}

export class InvalidMusicalKeyError extends CatalogValidationError {
  constructor() {
    super('Tonalité invalide (exemples : Dm, F#m, C, Bb)')
  }
}

export class InvalidTagsError extends CatalogValidationError {
  constructor() {
    super(
      'Tags invalides : 10 au maximum, de 2 à 30 caractères (lettres, chiffres, espaces, tirets)',
    )
  }
}

export class InvalidMoneyError extends CatalogValidationError {
  constructor() {
    super('Montant invalide : un nombre entier positif ou nul')
  }
}
