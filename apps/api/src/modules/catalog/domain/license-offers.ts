import { LICENSE_TYPES, type LicenseType } from '@kendrick/contracts'
import {
  DuplicateLicenseError,
  InvalidLicensePriceError,
  LicensePriceOrderError,
  NoLicenseOfferedError,
} from './errors.js'
import type { Money } from './money.js'

export interface LicenseOffer {
  readonly type: LicenseType
  readonly price: Money
}

/** Les licences proposées pour un beat, avec leur prix. */
export class LicenseOffers {
  private constructor(public readonly items: readonly LicenseOffer[]) {}

  static create(raw: readonly LicenseOffer[]): LicenseOffers {
    if (raw.length === 0) {
      throw new NoLicenseOfferedError()
    }
    if (new Set(raw.map((offer) => offer.type)).size !== raw.length) {
      throw new DuplicateLicenseError()
    }
    if (raw.some((offer) => offer.price.amount <= 0)) {
      throw new InvalidLicensePriceError()
    }

    // On range de la formule la moins chère à la plus chère, quel que soit l'ordre de saisie.
    const sorted = [...raw].sort(
      (a, b) => LICENSE_TYPES.indexOf(a.type) - LICENSE_TYPES.indexOf(b.type),
    )

    // Règle métier : un prix doit être strictement supérieur à celui de la formule précédente.
    const isIncreasing = sorted.every((offer, index) => {
      const previous = sorted[index - 1]
      return previous === undefined || offer.price.amount > previous.price.amount
    })
    if (!isIncreasing) {
      throw new LicensePriceOrderError()
    }

    return new LicenseOffers(sorted)
  }

  priceOf(type: LicenseType): Money | undefined {
    return this.items.find((offer) => offer.type === type)?.price
  }

  offers(type: LicenseType): boolean {
    return this.priceOf(type) !== undefined
  }

  /** Le prix « à partir de » affiché dans le catalogue. */
  get lowestPrice(): Money {
    // Jamais vide (vérifié à la création) et trié du moins cher au plus cher.
    return (this.items[0] as LicenseOffer).price
  }
}
