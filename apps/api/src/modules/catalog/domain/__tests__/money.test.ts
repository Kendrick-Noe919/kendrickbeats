import { describe, expect, it } from 'vitest'
import { InvalidMoneyError } from '../errors.js'
import { Money } from '../money.js'

describe('Money', () => {
  it('crée un montant en francs CFA par défaut', () => {
    const price = Money.create(15000)

    expect(price.amount).toBe(15000)
    expect(price.currency).toBe('XAF')
  })

  it('accepte zéro', () => {
    expect(Money.create(0).amount).toBe(0)
  })

  it.each([-1, 150.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 60])('refuse %s', (amount) => {
    expect(() => Money.create(amount)).toThrow(InvalidMoneyError)
  })

  it('compare le montant et la devise', () => {
    expect(Money.create(15000).equals(Money.create(15000))).toBe(true)
    expect(Money.create(15000).equals(Money.create(20000))).toBe(false)
  })
})
