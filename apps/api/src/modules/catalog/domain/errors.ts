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
export class InvalidTitleError extends CatalogValidationError {
  constructor() {
    super('Titre invalide : de 1 à 100 caractères')
  }
}

export class InvalidMediaUrlError extends CatalogValidationError {
  constructor() {
    super('Adresse invalide : une URL http(s) complète est attendue')
  }
}

export class NoLicenseOfferedError extends CatalogValidationError {
  constructor() {
    super('Au moins une licence doit être proposée')
  }
}

export class DuplicateLicenseError extends CatalogValidationError {
  constructor() {
    super('Une même licence ne peut être proposée qu’une seule fois')
  }
}

export class InvalidLicensePriceError extends CatalogValidationError {
  constructor() {
    super('Le prix d’une licence doit être supérieur à 0')
  }
}

export class LicensePriceOrderError extends CatalogValidationError {
  constructor() {
    super('Le prix doit augmenter avec la formule : Basic < Premium < Unlimited < Exclusive')
  }
}

/** Action impossible dans l'état actuel du beat (ex. publier un beat déjà vendu en exclusivité). */
export class InvalidBeatTransitionError extends Error {
  constructor(action: string, status: string) {
    // Élision devant une voyelle ou un h muet : « d’archiver », mais « de publier ».
    const de = /^[aeiouyhàâéèêëîïôûü]/i.test(action) ? 'd’' : 'de '
    super(`Impossible ${de}${action} un beat au statut ${status}`)
    this.name = 'InvalidBeatTransitionError'
  }
}
