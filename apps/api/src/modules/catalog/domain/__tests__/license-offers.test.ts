import { describe, expect, it } from 'vitest'
import {
  DuplicateLicenseError,
  InvalidLicensePriceError,
  LicensePriceOrderError,
  NoLicenseOfferedError,
} from '../errors.js'
import { LicenseOffers } from '../license-offers.js'
import { Money } from '../money.js'

const basic = { type: 'BASIC', price: Money.create(10000) } as const
const premium = { type: 'PREMIUM', price: Money.create(20000) } as const
const unlimited = { type: 'UNLIMITED', price: Money.create(50000) } as const
const exclusive = { type: 'EXCLUSIVE', price: Money.create(150000) } as const

describe('LicenseOffers', () => {
  it('accepte une seule formule', () => {
    expect(LicenseOffers.create([premium]).items).toHaveLength(1)
  })

  it('accepte les quatre formules', () => {
    expect(LicenseOffers.create([basic, premium, unlimited, exclusive]).items).toHaveLength(4)
  })

  it('range les formules de la moins chère à la plus chère, quel que soit l’ordre de saisie', () => {
    const offers = LicenseOffers.create([exclusive, basic, unlimited, premium])

    expect(offers.items.map((offer) => offer.type)).toEqual([
      'BASIC',
      'PREMIUM',
      'UNLIMITED',
      'EXCLUSIVE',
    ])
  })

  it('refuse une liste vide', () => {
    expect(() => LicenseOffers.create([])).toThrow(NoLicenseOfferedError)
  })

  it('refuse deux fois la même formule', () => {
    expect(() => LicenseOffers.create([basic, basic])).toThrow(DuplicateLicenseError)
  })

  it('refuse un prix à zéro', () => {
    expect(() => LicenseOffers.create([{ type: 'BASIC', price: Money.create(0) }])).toThrow(
      InvalidLicensePriceError,
    )
  })

  it('refuse un Premium moins cher que le Basic', () => {
    const cheapPremium = { type: 'PREMIUM', price: Money.create(5000) } as const

    expect(() => LicenseOffers.create([basic, cheapPremium])).toThrow(LicensePriceOrderError)
  })

  it('refuse deux formules au même prix', () => {
    const samePrice = { type: 'PREMIUM', price: Money.create(10000) } as const

    expect(() => LicenseOffers.create([basic, samePrice])).toThrow(LicensePriceOrderError)
  })

  it('compare les prix même quand une formule intermédiaire est absente', () => {
    const cheapExclusive = { type: 'EXCLUSIVE', price: Money.create(15000) } as const

    expect(() => LicenseOffers.create([basic, exclusive])).not.toThrow()
    expect(() => LicenseOffers.create([premium, cheapExclusive])).toThrow(LicensePriceOrderError)
  })

  it('donne le prix d’une formule et dit si elle est proposée', () => {
    const offers = LicenseOffers.create([basic, exclusive])

    expect(offers.priceOf('BASIC')?.amount).toBe(10000)
    expect(offers.priceOf('PREMIUM')).toBeUndefined()
    expect(offers.offers('EXCLUSIVE')).toBe(true)
    expect(offers.offers('UNLIMITED')).toBe(false)
  })

  it('donne le prix « à partir de » : le plus bas', () => {
    expect(LicenseOffers.create([exclusive, premium]).lowestPrice.amount).toBe(20000)
  })
})
