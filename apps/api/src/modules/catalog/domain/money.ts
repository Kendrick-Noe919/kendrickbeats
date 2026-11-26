import { InvalidMoneyError } from './errors.js'

/** Devise de la boutique. Le franc CFA n'a pas de centimes : le montant est un entier de francs. */
export type Currency = 'XAF'
export const SHOP_CURRENCY: Currency = 'XAF'

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  static create(amount: number, currency: Currency = SHOP_CURRENCY): Money {
    if (!Number.isSafeInteger(amount) || amount < 0) {
      throw new InvalidMoneyError()
    }
    return new Money(amount, currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }
}
